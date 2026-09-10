import assert from 'node:assert/strict';
import test from 'node:test';

import { createPoseidonStore } from '../dist/index.js';
import { fixtureContent, fixtureCreatures, fixtureDiveInputs, MemoryPersistence } from '../dist/fixtures.js';

function makeStore(persistence, prefix) {
  let counter = 0;
  return createPoseidonStore({
    persistence,
    content: fixtureContent,
    now: () => '2026-09-09T22:00:00.000Z',
    idGenerator: (kind) => `${prefix}-${kind}-${++counter}`,
  });
}

test('replace restore round-trips exported personal history exactly', async () => {
  const sourcePersistence = new MemoryPersistence();
  const source = makeStore(sourcePersistence, 'source');
  const custom = await source.createUserCreature('Tiny mystery crab');
  await source.createDive({
    ...fixtureDiveInputs[0],
    sightings: [
      { creatureId: fixtureCreatures[0].id, quantity: 'one' },
      { creatureId: custom.id, note: 'under the ledge' },
    ],
    highlightCreatureId: custom.id,
  });

  const backup = await source.exportData();
  const target = makeStore(new MemoryPersistence(), 'target');
  const preview = await target.previewRestore(backup);
  assert.equal(preview.backupDives, 1);
  assert.equal(preview.currentDives, 0);
  assert.equal(preview.replaceWouldDiscardDives, 0);

  const result = await target.restoreData(backup, 'replace');
  assert.equal(result.mode, 'replace');
  assert.equal(result.totalDives, 1);
  assert.equal(result.totalUserCreatures, 1);

  const restored = await target.exportData();
  assert.deepEqual(restored.personal, backup.personal);
});

test('merge keeps current history, adds only missing records, and is idempotent', async () => {
  const source = makeStore(new MemoryPersistence(), 'source');
  await source.createDive(fixtureDiveInputs[0]);
  const backup = await source.exportData();

  const targetPersistence = new MemoryPersistence();
  const target = makeStore(targetPersistence, 'target');
  await target.createDive(fixtureDiveInputs[1]);

  const first = await target.restoreData(backup, 'merge');
  assert.equal(first.addedDives, 1);
  assert.equal(first.totalDives, 2);

  const second = await target.restoreData(backup, 'merge');
  assert.equal(second.addedDives, 0);
  assert.equal(second.totalDives, 2);
  assert.equal((await target.listDives()).length, 2);
});

test('malformed and future backups are refused without mutating current history', async () => {
  const persistence = new MemoryPersistence();
  const store = makeStore(persistence, 'current');
  await store.createDive(fixtureDiveInputs[0]);
  const before = persistence.inspect();
  const valid = await store.exportData();

  const future = structuredClone(valid);
  future.exportVersion = 2;
  await assert.rejects(() => store.restoreData(future, 'replace'), /export version 2 is unsupported/i);
  assert.deepEqual(persistence.inspect(), before);

  const malformed = structuredClone(valid);
  malformed.personal.dives[0].sightings[0].creatureId = 'not-in-this-build';
  await assert.rejects(() => store.restoreData(malformed, 'replace'), /not available in this Poseidon build/i);
  assert.deepEqual(persistence.inspect(), before);
});

test('merge conflicts are previewed and refused without overwriting either version', async () => {
  const source = makeStore(new MemoryPersistence(), 'shared');
  await source.createDive(fixtureDiveInputs[0]);
  const backup = await source.exportData();

  const targetPersistence = new MemoryPersistence();
  const target = makeStore(targetPersistence, 'target');
  await target.restoreData(backup, 'replace');
  const before = targetPersistence.inspect();

  const changed = structuredClone(backup);
  changed.personal.dives[0].siteName = 'Different reef with the same id';
  const preview = await target.previewRestore(changed);
  assert.equal(preview.mergeConflicts.length, 1);
  assert.equal(preview.replaceWouldDiscardDives, 1);

  await assert.rejects(() => target.restoreData(changed, 'merge'), /Merge refused/i);
  assert.deepEqual(targetPersistence.inspect(), before);
});
