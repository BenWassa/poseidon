import type { Dive } from '@poseidon/domain';

import { formatMonthYear, monthKey } from './format';

export type JournalGrouping = 'date' | 'location';

export interface JournalGroup {
  id: string;
  title: string;
  period?: string;
  dives: Dive[];
}

function newestFirst(a: Dive, b: Dive): number {
  return (
    b.date.localeCompare(a.date) ||
    b.createdAt.localeCompare(a.createdAt) ||
    b.id.localeCompare(a.id)
  );
}

export function groupJournalDives(
  dives: Dive[],
  grouping: JournalGrouping,
): JournalGroup[] {
  const sorted = [...dives].sort(newestFirst);
  const groups = new Map<string, Dive[]>();

  for (const dive of sorted) {
    const key = grouping === 'date' ? monthKey(dive.date) : dive.areaName;
    const entries = groups.get(key) ?? [];
    entries.push(dive);
    groups.set(key, entries);
  }

  const keys = [...groups.keys()].sort((a, b) =>
    grouping === 'date'
      ? b.localeCompare(a)
      : a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );

  return keys.map((key) => {
    const entries = groups.get(key) ?? [];
    const oldest = entries.at(-1)?.date ?? '';
    const newest = entries[0]?.date ?? '';
    const period =
      grouping === 'location'
        ? monthKey(oldest) === monthKey(newest)
          ? formatMonthYear(newest)
          : `${formatMonthYear(oldest)} – ${formatMonthYear(newest)}`
        : undefined;

    return {
      id: `${grouping}-${key}`,
      title: grouping === 'date' ? formatMonthYear(`${key}-01`) : key,
      ...(period ? { period } : {}),
      dives: entries,
    };
  });
}
