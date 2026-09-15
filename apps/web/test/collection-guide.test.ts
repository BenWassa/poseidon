import { describe, expect, it } from 'vitest';

import type { Creature, CreatureHistory } from '@poseidon/domain';

import {
  ALL_COLLECTION_CATEGORIES,
  buildCollectionGuide,
  filterCollectionGuide,
} from '../src/lib/collectionGuide';

const turtle: Creature = {
  id: 'green-sea-turtle',
  commonName: 'Green sea turtle',
  aliases: ['Green turtle'],
  scientificName: 'Chelonia mydas',
  category: 'reptile',
  curated: true,
  artwork: { status: 'missing' },
};

const ray: Creature = {
  id: 'spotted-eagle-ray',
  commonName: 'Spotted eagle ray',
  scientificName: 'Aetobatus narinari',
  category: 'ray',
  curated: true,
  artwork: { status: 'curated', gallery: '/ray.webp' },
};

const custom: Creature = {
  id: 'creature-custom',
  commonName: 'Mystery blenny',
  curated: false,
  userCreated: true,
  artwork: { status: 'missing' },
};

function history(
  creature: Creature,
  diveCount = 1,
  relatedDiveIds = ['dive-1'],
): CreatureHistory {
  return {
    creature,
    firstSeenDate: '2026-09-01',
    mostRecentSeenDate: '2026-09-02',
    diveCount,
    sites: ['Palancar Gardens'],
    areas: ['Cozumel'],
    relatedDiveIds,
  };
}

describe('Marine Collection guide view model', () => {
  it('shows the full curated guide with zero dives and marks every entry unseen', () => {
    const guide = buildCollectionGuide([turtle, ray], []);

    expect(guide.curatedTotalCount).toBe(2);
    expect(guide.curatedSeenCount).toBe(0);
    expect(guide.entries.map((entry) => entry.creature.id)).toEqual([
      'green-sea-turtle',
      'spotted-eagle-ray',
    ]);
    expect(guide.entries.every((entry) => !entry.seen)).toBe(true);
  });

  it('counts a curated creature once even when its history spans multiple dives', () => {
    const guide = buildCollectionGuide(
      [turtle, ray],
      [history(turtle, 3, ['dive-1', 'dive-2', 'dive-3'])],
    );

    expect(guide.curatedSeenCount).toBe(1);
    expect(guide.curatedTotalCount).toBe(2);
    expect(
      guide.entries.find((entry) => entry.creature.id === turtle.id)?.seen,
    ).toBe(true);
  });

  it('returns a creature to not-yet-seen when its final sighting disappears', () => {
    const before = buildCollectionGuide([turtle, ray], [history(turtle)]);
    const after = buildCollectionGuide([turtle, ray], []);

    expect(before.curatedSeenCount).toBe(1);
    expect(after.curatedSeenCount).toBe(0);
    expect(
      after.entries.find((entry) => entry.creature.id === turtle.id)?.seen,
    ).toBe(false);
  });

  it('searches names, aliases and scientific names across seen and unseen entries', () => {
    const guide = buildCollectionGuide([turtle, ray], [history(ray)]);

    expect(
      filterCollectionGuide(guide.entries, { query: 'green turtle' }).map(
        (entry) => entry.creature.id,
      ),
    ).toEqual([turtle.id]);
    expect(
      filterCollectionGuide(guide.entries, { query: 'aetobatus' }).map(
        (entry) => entry.creature.id,
      ),
    ).toEqual([ray.id]);
  });

  it('composes discovery and category filters', () => {
    const guide = buildCollectionGuide([turtle, ray], [history(ray)]);

    expect(
      filterCollectionGuide(guide.entries, {
        category: 'ray',
        discovery: 'seen',
      }).map((entry) => entry.creature.id),
    ).toEqual([ray.id]);
    expect(
      filterCollectionGuide(guide.entries, {
        category: 'reptile',
        discovery: 'not-seen',
      }).map((entry) => entry.creature.id),
    ).toEqual([turtle.id]);
  });

  it('keeps Seen and Not yet seen mutually accurate', () => {
    const guide = buildCollectionGuide([turtle, ray], [history(ray)]);

    expect(
      filterCollectionGuide(guide.entries, { discovery: 'seen' }).map(
        (entry) => entry.creature.id,
      ),
    ).toEqual([ray.id]);
    expect(
      filterCollectionGuide(guide.entries, { discovery: 'not-seen' }).map(
        (entry) => entry.creature.id,
      ),
    ).toEqual([turtle.id]);
  });

  it('shows user-created creatures only with history and never changes the curated denominator', () => {
    const withoutHistory = buildCollectionGuide([turtle, ray, custom], []);
    const withHistory = buildCollectionGuide(
      [turtle, ray, custom],
      [history(custom)],
    );

    expect(
      withoutHistory.entries.some((entry) => entry.creature.id === custom.id),
    ).toBe(false);
    expect(withHistory.curatedTotalCount).toBe(2);
    expect(withHistory.curatedSeenCount).toBe(0);
    expect(
      filterCollectionGuide(withHistory.entries, { discovery: 'seen' }).map(
        (entry) => entry.creature.id,
      ),
    ).toEqual([custom.id]);
    expect(
      filterCollectionGuide(withHistory.entries, {
        discovery: 'not-seen',
      }).some((entry) => entry.creature.id === custom.id),
    ).toBe(false);
  });

  it('keeps missing artwork entries in the guide', () => {
    const guide = buildCollectionGuide([turtle], []);

    expect(guide.entries).toHaveLength(1);
    expect(guide.entries[0]?.creature.artwork?.status).toBe('missing');
    expect(
      filterCollectionGuide(guide.entries, {
        category: ALL_COLLECTION_CATEGORIES,
      }),
    ).toHaveLength(1);
  });
});
