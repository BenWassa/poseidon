import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_STORAGE_KEY,
  LocalStoragePersistence,
  PoseidonMigrationError,
  PoseidonPersistenceError,
  createPoseidonStore,
  migratePersistedState,
} from '../dist/index.js';

class FakeStorage {
  values = new Map();
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

const legacyDive = {
  id: 'legacy-dive',
  date: '2026-08-01',
  siteName: 'Legacy Site',
  areaName: 'Legacy Area',
  maxDepth: { value: 12, unit: 'm' },
  durationMinutes: 40,
  sightings: [{ id: 'legacy-sighting', creatureId: 'legacy-creature' }],
  highlightCreatureId: 'legacy-creature',
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
};

test('schema v1 migrates to v2 and the upgraded representation is written back on open', async () => {
  const storage = new FakeStorage();
  storage.setItem(DEFAULT_STORAGE_KEY, JSON.stringify({
    schemaVersion: 1,
    dives: [legacyDive],
    userCreatures: [{ id: 'legacy-creature', commonName: 'Old manual creature', aliases: ['Old alias'] }],
  }));

  const store = createPoseidonStore({
    persistence: new LocalStoragePersistence(storage),
    now: () => '2026-09-07T12:00:00.000Z',
  });
  assert.equal((await store.listDives())[0].id, 'legacy-dive');
  const creature = (await store.listCreatures()).find((entry) => entry.id === 'legacy-creature');
  assert.equal(creature.userCreated, true);
  assert.equal(creature.curated, false);
  assert.equal(creature.artwork.status, 'missing');

  const raw = JSON.parse(storage.getItem(DEFAULT_STORAGE_KEY));
  assert.equal(raw.schemaVersion, CURRENT_SCHEMA_VERSION);
  assert.equal(raw.updatedAt, '2026-09-07T12:00:00.000Z');
});

test('migration rejects malformed, unversioned and future-version data rather than discarding it', () => {
  assert.throws(() => migratePersistedState([], '2026-09-07T00:00:00.000Z'), PoseidonMigrationError);
  assert.throws(() => migratePersistedState({ dives: [] }, '2026-09-07T00:00:00.000Z'), PoseidonMigrationError);
  assert.throws(
    () => migratePersistedState({ schemaVersion: 99, dives: [], userCreatures: [] }, '2026-09-07T00:00:00.000Z'),
    PoseidonMigrationError,
  );
});

test('local persistence surfaces storage failures and does not report a successful write', async () => {
  const storage = {
    getItem() { return null; },
    setItem() { throw new Error('quota'); },
    removeItem() {},
  };
  const persistence = new LocalStoragePersistence(storage);
  await assert.rejects(
    () => persistence.write({ schemaVersion: 2, updatedAt: 'x', dives: [], userCreatures: [] }),
    PoseidonPersistenceError,
  );
});
