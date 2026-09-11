import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LocalStoragePersistence,
  PoseidonNotFoundError,
  PoseidonValidationError,
  createPoseidonStore,
} from '../dist/index.js';

class FakeStorage {
  #values = new Map();
  getItem(key) {
    return this.#values.has(key) ? this.#values.get(key) : null;
  }
  setItem(key, value) {
    this.#values.set(key, String(value));
  }
  removeItem(key) {
    this.#values.delete(key);
  }
  raw(key) {
    return this.getItem(key);
  }
}

function deterministicRuntime() {
  let tick = 0;
  const ids = new Map();
  return {
    now: () => new Date(Date.UTC(2026, 8, 7, 12, 0, tick++)).toISOString(),
    idGenerator: (prefix) => {
      const next = (ids.get(prefix) ?? 0) + 1;
      ids.set(prefix, next);
      return `${prefix}-${next}`;
    },
  };
}

const content = {
  regions: [
    { id: 'mx-caribbean', name: 'Mexican Caribbean', countryCode: 'MX' },
    {
      id: 'cozumel',
      name: 'Cozumel',
      countryCode: 'MX',
      parentRegionId: 'mx-caribbean',
    },
    {
      id: 'playa',
      name: 'Playa del Carmen',
      countryCode: 'MX',
      parentRegionId: 'mx-caribbean',
    },
  ],
  places: [
    {
      id: 'place-a',
      name: 'Site A',
      kind: 'site',
      regionId: 'cozumel',
      countryCode: 'MX',
      curated: true,
    },
    {
      id: 'place-b',
      name: 'Site B',
      kind: 'site',
      regionId: 'playa',
      countryCode: 'MX',
      curated: true,
    },
  ],
  creatures: [
    {
      id: 'turtle',
      commonName: 'Hawksbill turtle',
      aliases: ['Hawksbill'],
      scientificName: 'Eretmochelys imbricata',
      curated: true,
      regionIds: ['cozumel'],
    },
    {
      id: 'ray',
      commonName: 'Spotted eagle ray',
      curated: true,
      regionIds: ['playa'],
    },
    {
      id: 'shark',
      commonName: 'Nurse shark',
      curated: true,
      regionIds: ['playa'],
    },
    {
      id: 'puffer',
      commonName: 'Pufferfish',
      curated: true,
      regionIds: ['cozumel'],
    },
  ],
};

function diveInput(overrides = {}) {
  return {
    date: '2026-09-01',
    siteName: 'Site A',
    areaName: 'Cozumel',
    countryCode: 'mx',
    regionId: 'cozumel',
    maxDepth: { value: 18, unit: 'm' },
    durationMinutes: 50,
    sightings: [
      { creatureId: 'turtle' },
      { creatureId: 'ray', quantity: 'few' },
    ],
    highlightCreatureId: 'turtle',
    ...overrides,
  };
}

test('round-trips through local storage across store restart and preserves stable sighting IDs on edit', async () => {
  const storage = new FakeStorage();
  const runtime = deterministicRuntime();
  const persistence = new LocalStoragePersistence(storage);
  const first = createPoseidonStore({ persistence, content, ...runtime });

  const userCreature = await first.createUserCreature('Mystery nudibranch');
  const created = await first.createDive(
    diveInput({
      sightings: [{ creatureId: 'turtle' }, { creatureId: userCreature.id }],
      highlightCreatureId: userCreature.id,
      note: 'First note',
    }),
  );
  const turtleSightingId = created.sightings.find(
    (entry) => entry.creatureId === 'turtle',
  ).id;

  const second = createPoseidonStore({
    persistence: new LocalStoragePersistence(storage),
    content,
    ...runtime,
  });
  const reopened = await second.getDive(created.id);
  assert.equal(reopened.note, 'First note');
  assert.equal(reopened.countryCode, 'MX');
  assert.equal(reopened.sightings.length, 2);

  const updated = await second.updateDive(created.id, {
    note: 'Edited after restart',
    sightings: [
      { creatureId: 'turtle', quantity: 'one' },
      { creatureId: userCreature.id, note: 'Still uncertain' },
    ],
  });
  assert.equal(
    updated.sightings.find((entry) => entry.creatureId === 'turtle').id,
    turtleSightingId,
  );
  assert.equal(updated.highlightCreatureId, userCreature.id);

  const third = createPoseidonStore({
    persistence: new LocalStoragePersistence(storage),
    content,
    ...runtime,
  });
  assert.equal((await third.getDive(created.id)).note, 'Edited after restart');
  assert.equal((await third.listCreatureCollection()).length, 2);

  await third.deleteDive(created.id);
  assert.deepEqual(await third.getLifetimeStats(), {
    totalDives: 0,
    totalBottomTimeMinutes: 0,
    distinctSites: 0,
    distinctCreatures: 0,
    distinctCountries: 0,
  });
  assert.equal(
    (await third.listCreatures()).some(
      (creature) => creature.id === userCreature.id,
    ),
    true,
  );
});

test('derived collection, discoveries, lifetime stats and place summaries follow dive create/edit/delete', async () => {
  const runtime = deterministicRuntime();
  const storage = new FakeStorage();
  const store = createPoseidonStore({
    persistence: new LocalStoragePersistence(storage),
    content,
    ...runtime,
  });

  const d1 = await store.createDive(diveInput());
  await store.createDive(
    diveInput({
      date: '2026-09-02',
      sightings: [{ creatureId: 'turtle' }],
      highlightCreatureId: 'turtle',
    }),
  );
  const d3 = await store.createDive(
    diveInput({
      date: '2026-09-03',
      siteName: 'Site B',
      areaName: 'Playa del Carmen',
      regionId: 'playa',
      durationMinutes: 50,
      sightings: [{ creatureId: 'shark' }, { creatureId: 'ray' }],
      highlightCreatureId: 'shark',
    }),
  );

  assert.deepEqual(await store.getLifetimeStats(), {
    totalDives: 3,
    totalBottomTimeMinutes: 150,
    distinctSites: 2,
    distinctCreatures: 3,
    distinctCountries: 1,
  });

  const rayHistory = await store.getCreatureHistory('ray');
  assert.equal(rayHistory.firstSeenDate, '2026-09-01');
  assert.equal(rayHistory.mostRecentSeenDate, '2026-09-03');
  assert.equal(rayHistory.diveCount, 2);
  assert.deepEqual(rayHistory.sites, ['Site A', 'Site B']);

  const discoveries = await store.listRecentDiscoveries(2);
  assert.equal(discoveries[0].creature.id, 'shark');
  assert.equal(discoveries[0].diveId, d3.id);

  const places = await store.listPlaceSummaries();
  assert.deepEqual(
    places.map(({ label, diveCount, creatureCount, siteCount }) => ({
      label,
      diveCount,
      creatureCount,
      siteCount,
    })),
    [
      {
        label: 'Playa del Carmen',
        diveCount: 1,
        creatureCount: 2,
        siteCount: 1,
      },
      { label: 'Cozumel', diveCount: 2, creatureCount: 2, siteCount: 1 },
    ],
  );

  await store.updateDive(d3.id, { sightings: [{ creatureId: 'shark' }] });
  assert.equal((await store.getCreatureHistory('ray')).diveCount, 1);
  await store.deleteDive(d1.id);
  assert.equal(await store.getCreatureHistory('ray'), null);
  assert.equal((await store.getLifetimeStats()).distinctCreatures, 2);
});

test('suggestions deterministically prioritize local creatures, then personal familiarity, then broader catalogue', async () => {
  const runtime = deterministicRuntime();
  const store = createPoseidonStore({
    persistence: new LocalStoragePersistence(new FakeStorage()),
    content,
    ...runtime,
  });
  await store.createDive(
    diveInput({
      date: '2026-09-04',
      regionId: 'playa',
      areaName: 'Playa del Carmen',
      siteName: 'Site B',
      sightings: [{ creatureId: 'ray' }],
      highlightCreatureId: 'ray',
    }),
  );
  await store.createDive(
    diveInput({
      date: '2026-09-05',
      sightings: [{ creatureId: 'turtle' }],
      highlightCreatureId: 'turtle',
    }),
  );

  const suggestions = await store.listSuggestedCreatures({
    regionId: 'cozumel',
    areaName: 'Cozumel',
    countryCode: 'MX',
  });
  assert.deepEqual(
    suggestions.map((creature) => creature.id),
    ['turtle', 'puffer', 'ray', 'shark'],
  );
});

test('search covers common names, aliases and scientific names', async () => {
  const store = createPoseidonStore({
    persistence: new LocalStoragePersistence(new FakeStorage()),
    content,
  });
  assert.deepEqual(
    (await store.searchCreatures('hawksbill')).map((creature) => creature.id),
    ['turtle'],
  );
  assert.deepEqual(
    (await store.searchCreatures('imbricata')).map((creature) => creature.id),
    ['turtle'],
  );
});

test('export contains canonical personal data plus referenced catalogue snapshots and region ancestors', async () => {
  const runtime = deterministicRuntime();
  const store = createPoseidonStore({
    persistence: new LocalStoragePersistence(new FakeStorage()),
    content,
    ...runtime,
  });
  const custom = await store.createUserCreature('Unlisted creature');
  const dive = await store.createDive(
    diveInput({
      sightings: [{ creatureId: 'turtle' }, { creatureId: custom.id }],
      highlightCreatureId: custom.id,
    }),
  );

  const exported = await store.exportData();
  assert.equal(exported.format, 'poseidon-personal-export');
  assert.equal(exported.exportVersion, 1);
  assert.equal(exported.personal.dives[0].id, dive.id);
  assert.deepEqual(
    exported.personal.userCreatures.map((creature) => creature.id),
    [custom.id],
  );
  assert.deepEqual(
    exported.catalogSnapshots.creatures.map((creature) => creature.id),
    ['turtle'],
  );
  assert.deepEqual(
    exported.catalogSnapshots.regions.map((region) => region.id),
    ['mx-caribbean', 'cozumel'],
  );
  assert.deepEqual(
    exported.catalogSnapshots.places.map((place) => place.id),
    ['place-a'],
  );
});

test('validation rejects unknown creature references and highlights not present on the dive', async () => {
  const store = createPoseidonStore({
    persistence: new LocalStoragePersistence(new FakeStorage()),
    content,
  });
  await assert.rejects(
    () =>
      store.createDive(diveInput({ sightings: [{ creatureId: 'unknown' }] })),
    PoseidonValidationError,
  );
  await assert.rejects(
    () =>
      store.createDive(
        diveInput({
          sightings: [{ creatureId: 'turtle' }],
          highlightCreatureId: 'ray',
        }),
      ),
    PoseidonValidationError,
  );
});

test('concurrent creates serialize without losing either dive', async () => {
  const runtime = deterministicRuntime();
  const store = createPoseidonStore({
    persistence: new LocalStoragePersistence(new FakeStorage()),
    content,
    ...runtime,
  });
  const [a, b] = await Promise.all([
    store.createDive(diveInput({ date: '2026-09-01' })),
    store.createDive(diveInput({ date: '2026-09-02' })),
  ]);
  assert.notEqual(a.id, b.id);
  assert.equal((await store.listDives()).length, 2);
});

test('delete and update reject missing dive IDs instead of silently mutating history', async () => {
  const store = createPoseidonStore({
    persistence: new LocalStoragePersistence(new FakeStorage()),
    content,
  });
  await assert.rejects(
    () => store.deleteDive('missing'),
    PoseidonNotFoundError,
  );
  await assert.rejects(
    () => store.updateDive('missing', { note: 'x' }),
    PoseidonNotFoundError,
  );
});
