import { describe, expect, it } from 'vitest';

import type { Dive } from '@poseidon/domain';

import { groupJournalDives } from '../src/lib/journal';

function dive(id: string, date: string, areaName: string): Dive {
  return {
    id,
    date,
    siteName: `Site ${id}`,
    areaName,
    maxDepth: { value: 12, unit: 'm' },
    durationMinutes: 40,
    sightings: [],
    createdAt: `${date}T12:00:00.000Z`,
    updatedAt: `${date}T12:00:00.000Z`,
  };
}

describe('journal grouping', () => {
  const dives = [
    dive('b', '2026-05-03', 'Zanzibar'),
    dive('c', '2026-06-02', 'Cozumel'),
    dive('a', '2026-05-14', 'Cozumel'),
  ];

  it('groups dates newest first and keeps dives chronological within a month', () => {
    const groups = groupJournalDives(dives, 'date');

    expect(groups.map((group) => group.title)).toEqual([
      'June 2026',
      'May 2026',
    ]);
    expect(groups[1]?.dives.map((entry) => entry.id)).toEqual(['a', 'b']);
  });

  it('groups locations alphabetically and keeps dives newest first', () => {
    const groups = groupJournalDives(dives, 'location');

    expect(groups.map((group) => group.title)).toEqual(['Cozumel', 'Zanzibar']);
    expect(groups[0]?.dives.map((entry) => entry.id)).toEqual(['c', 'a']);
  });
});
