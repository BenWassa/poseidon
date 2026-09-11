import assert from 'node:assert/strict';
import test from 'node:test';

import {
  TRIP_MAX_GAP_DAYS,
  deriveHistoryMilestones,
  groupDivesIntoTrips,
} from '../dist/index.js';

const creatureById = new Map([
  [
    'turtle',
    {
      id: 'turtle',
      commonName: 'Green sea turtle',
      category: 'sea-turtle',
      curated: true,
    },
  ],
  [
    'ray',
    {
      id: 'ray',
      commonName: 'Spotted eagle ray',
      category: 'ray',
      curated: true,
    },
  ],
  [
    'shark',
    {
      id: 'shark',
      commonName: 'Nurse shark',
      category: 'shark',
      curated: true,
    },
  ],
  [
    'squid',
    {
      id: 'squid',
      commonName: 'Caribbean reef squid',
      category: 'cephalopod',
      curated: true,
    },
  ],
]);

function dive({
  id,
  date,
  areaName = 'Cozumel',
  countryCode = 'MX',
  regionId = 'cozumel',
  creatures = [],
}) {
  const stamp = `${date}T12:00:00.000Z`;
  return {
    id,
    date,
    siteName: `Site ${id}`,
    areaName,
    countryCode,
    regionId,
    maxDepth: { value: 18, unit: 'm' },
    durationMinutes: 45,
    sightings: creatures.map((creatureId, index) => ({
      id: `sighting-${id}-${index}`,
      creatureId,
    })),
    createdAt: stamp,
    updatedAt: stamp,
  };
}

test('trip grouping has a deterministic seven-day inclusive boundary and never jumps across location changes', () => {
  assert.equal(TRIP_MAX_GAP_DAYS, 7);
  const dives = [
    dive({ id: 'c4', date: '2026-02-18' }),
    dive({
      id: 'p1',
      date: '2026-02-17',
      areaName: 'Playa del Carmen',
      regionId: 'playa',
    }),
    dive({ id: 'c3', date: '2026-02-16' }),
    dive({ id: 'c2', date: '2026-02-08' }),
    dive({ id: 'c1', date: '2026-02-01' }),
  ];

  const first = groupDivesIntoTrips(dives);
  const second = groupDivesIntoTrips(dives);

  assert.deepEqual(second, first);
  assert.deepEqual(
    first.map((trip) => trip.id),
    ['trip:c4', 'trip:p1', 'trip:c3', 'trip:c1'],
  );
  assert.deepEqual(
    first.at(-1).dives.map((entry) => entry.id),
    ['c2', 'c1'],
  );
  assert.equal(first.at(-1).firstDate, '2026-02-01');
  assert.equal(first.at(-1).lastDate, '2026-02-08');
});

test('explicit region identity wins over a coincidentally matching area label and sparse history stays graceful', () => {
  assert.deepEqual(groupDivesIntoTrips([]), []);

  const solo = dive({ id: 'solo', date: '2026-03-01', regionId: undefined });
  const soloTrips = groupDivesIntoTrips([solo]);
  assert.equal(soloTrips.length, 1);
  assert.equal(soloTrips[0].firstDate, '2026-03-01');
  assert.equal(soloTrips[0].lastDate, '2026-03-01');
  assert.deepEqual(
    soloTrips[0].dives.map((entry) => entry.id),
    ['solo'],
  );

  const regionMismatch = groupDivesIntoTrips([
    dive({
      id: 'a',
      date: '2026-03-01',
      areaName: 'Cozumel',
      regionId: 'cozumel',
    }),
    dive({
      id: 'b',
      date: '2026-03-02',
      areaName: 'Cozumel',
      regionId: 'other-region',
    }),
  ]);
  assert.equal(regionMismatch.length, 2);
});

test('milestones are finite, factual and idempotent', () => {
  const dives = [
    dive({ id: 'd1', date: '2026-01-01', creatures: ['turtle', 'ray'] }),
    dive({ id: 'd2', date: '2026-01-02' }),
    dive({
      id: 'd3',
      date: '2026-01-03',
      areaName: 'Playa del Carmen',
      regionId: 'playa',
      creatures: ['shark'],
    }),
    dive({
      id: 'd4',
      date: '2026-01-04',
      areaName: 'Ambergris Caye',
      countryCode: 'BZ',
      regionId: 'belize',
      creatures: ['squid'],
    }),
    ...Array.from({ length: 6 }, (_, index) =>
      dive({
        id: `d${index + 5}`,
        date: `2026-01-${String(index + 5).padStart(2, '0')}`,
        areaName: 'Ambergris Caye',
        countryCode: 'BZ',
        regionId: 'belize',
      }),
    ),
  ];

  const first = deriveHistoryMilestones(dives, creatureById);
  const second = deriveHistoryMilestones(dives, creatureById);

  assert.deepEqual(second, first);
  assert.deepEqual(
    first.map(({ kind, diveId, count, countryCode, areaName, category }) => ({
      kind,
      diveId,
      ...(count ? { count } : {}),
      ...(countryCode ? { countryCode } : {}),
      ...(areaName ? { areaName } : {}),
      ...(category ? { category } : {}),
    })),
    [
      { kind: 'first-dive', diveId: 'd1' },
      { kind: 'creature-group', diveId: 'd1', category: 'sea-turtle' },
      { kind: 'creature-group', diveId: 'd1', category: 'ray' },
      { kind: 'new-region', diveId: 'd3', areaName: 'Playa del Carmen' },
      { kind: 'creature-group', diveId: 'd3', category: 'shark' },
      {
        kind: 'new-country',
        diveId: 'd4',
        countryCode: 'BZ',
        areaName: 'Ambergris Caye',
      },
      { kind: 'creature-group', diveId: 'd4', category: 'cephalopod' },
      { kind: 'dive-count', diveId: 'd10', count: 10 },
    ],
  );

  for (const milestone of first) {
    assert.equal('depth' in milestone, false);
    assert.equal('duration' in milestone, false);
    assert.equal('streak' in milestone, false);
  }
});

test('derived trips and milestones recompute after edits and deletes without stale state', () => {
  const d1 = dive({ id: 'd1', date: '2026-04-01' });
  const d2 = dive({ id: 'd2', date: '2026-04-02' });
  const d3 = dive({
    id: 'd3',
    date: '2026-04-03',
    areaName: 'Playa del Carmen',
    regionId: 'playa',
  });

  assert.deepEqual(
    groupDivesIntoTrips([d1, d2, d3]).map((trip) =>
      trip.dives.map((entry) => entry.id),
    ),
    [['d3'], ['d2', 'd1']],
  );

  const editedD2 = {
    ...d2,
    areaName: 'Playa del Carmen',
    regionId: 'playa',
    updatedAt: '2026-04-04T12:00:00.000Z',
  };
  assert.deepEqual(
    groupDivesIntoTrips([d1, editedD2, d3]).map((trip) =>
      trip.dives.map((entry) => entry.id),
    ),
    [['d3', 'd2'], ['d1']],
  );

  const afterDelete = deriveHistoryMilestones([editedD2, d3], creatureById);
  assert.equal(
    afterDelete.find((entry) => entry.kind === 'first-dive')?.diveId,
    'd2',
  );
  assert.equal(
    afterDelete.some((entry) => entry.kind === 'new-region'),
    false,
  );
});
