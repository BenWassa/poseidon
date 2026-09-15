import type { Creature, CreatureHistory } from '@poseidon/domain';

export type CollectionDiscoveryFilter = 'all' | 'seen' | 'not-seen';

export interface CollectionGuideEntry {
  creature: Creature;
  history?: CreatureHistory;
  seen: boolean;
}

export interface CollectionGuideViewModel {
  entries: CollectionGuideEntry[];
  curatedSeenCount: number;
  curatedTotalCount: number;
}

export interface CollectionGuideFilter {
  query?: string;
  category?: string;
  discovery?: CollectionDiscoveryFilter;
}

export const ALL_COLLECTION_CATEGORIES = '**all**';

export function collectionCategory(creature: Creature): string {
  return creature.category ?? 'unlisted';
}

export function buildCollectionGuide(
  creatures: Creature[],
  collection: CreatureHistory[],
): CollectionGuideViewModel {
  const historyByCreatureId = new Map(
    collection.map((history) => [history.creature.id, history]),
  );
  const curatedCreatures = creatures.filter(
    (creature) => creature.curated && !creature.userCreated,
  );
  const curatedIds = new Set(curatedCreatures.map((creature) => creature.id));

  const curatedEntries = curatedCreatures.map((creature) => {
    const history = historyByCreatureId.get(creature.id);
    return {
      creature,
      ...(history ? { history } : {}),
      seen: Boolean(history),
    } satisfies CollectionGuideEntry;
  });

  // User-created creatures belong to the guide only once a dive actually
  // references them. listCreatures() can contain an abandoned custom entry
  // created during logging, so catalogue membership alone is not evidence of
  // an encounter.
  const userEntries = collection
    .filter(
      (history) =>
        history.creature.userCreated && !curatedIds.has(history.creature.id),
    )
    .map(
      (history) =>
        ({
          creature: history.creature,
          history,
          seen: true,
        }) satisfies CollectionGuideEntry,
    );

  const entries = [...curatedEntries, ...userEntries].sort((a, b) =>
    a.creature.commonName.localeCompare(b.creature.commonName, 'en'),
  );

  return {
    entries,
    curatedSeenCount: curatedEntries.filter((entry) => entry.seen).length,
    curatedTotalCount: curatedEntries.length,
  };
}

export function matchesCollectionDiscovery(
  entry: CollectionGuideEntry,
  discovery: CollectionDiscoveryFilter,
): boolean {
  if (discovery === 'seen') return entry.seen;
  if (discovery === 'not-seen') {
    return entry.creature.curated && !entry.creature.userCreated && !entry.seen;
  }
  return true;
}

export function filterCollectionGuide(
  entries: CollectionGuideEntry[],
  {
    query = '',
    category = ALL_COLLECTION_CATEGORIES,
    discovery = 'all',
  }: CollectionGuideFilter,
): CollectionGuideEntry[] {
  const needle = query.trim().toLocaleLowerCase('en');

  return entries.filter((entry) => {
    if (!matchesCollectionDiscovery(entry, discovery)) return false;
    if (
      category !== ALL_COLLECTION_CATEGORIES &&
      collectionCategory(entry.creature) !== category
    ) {
      return false;
    }
    if (!needle) return true;

    const haystack = [
      entry.creature.commonName,
      ...(entry.creature.aliases ?? []),
      entry.creature.scientificName ?? '',
    ];
    return haystack.some((value) =>
      value.toLocaleLowerCase('en').includes(needle),
    );
  });
}
