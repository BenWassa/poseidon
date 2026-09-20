/**
 * The marine collection is a regional field guide layered with personal
 * encounter history. Curated creatures are always browseable; Seen is derived
 * only from logged sightings, while user-created creatures appear only after
 * they have actually been logged.
 */
import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';

import { CreatureTile } from '../components/CreatureTile';
import { TopBar } from '../components/ui';
import { useCollection, useCreatures } from '../data/hooks';
import {
  ALL_COLLECTION_CATEGORIES,
  buildCollectionGuide,
  collectionCategory,
  filterCollectionGuide,
  matchesCollectionDiscovery,
  type CollectionDiscoveryFilter,
} from '../lib/collectionGuide';
import { formatCategory, formatDate } from '../lib/format';

const DISCOVERY_FILTERS: Array<{
  value: CollectionDiscoveryFilter;
  label: string;
}> = [
  { value: 'all', label: 'All' },
  { value: 'seen', label: 'Seen' },
  { value: 'not-seen', label: 'Not yet seen' },
];

export function Collection() {
  const { data: creatures, loading: creaturesLoading } = useCreatures();
  const { data: collection, loading: collectionLoading } = useCollection();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL_COLLECTION_CATEGORIES);
  const [discovery, setDiscovery] = useState<CollectionDiscoveryFilter>('all');

  const guide = useMemo(
    () => buildCollectionGuide(creatures ?? [], collection ?? []),
    [creatures, collection],
  );

  const discoveryEntries = useMemo(
    () =>
      guide.entries.filter((entry) =>
        matchesCollectionDiscovery(entry, discovery),
      ),
    [guide.entries, discovery],
  );

  const categories = useMemo(() => {
    const keys = new Set(
      guide.entries.map((entry) => collectionCategory(entry.creature)),
    );
    return [...keys]
      .map(
        (key) =>
          [
            key,
            discoveryEntries.filter(
              (entry) => collectionCategory(entry.creature) === key,
            ).length,
          ] as const,
      )
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [guide.entries, discoveryEntries]);

  const visible = useMemo(
    () =>
      filterCollectionGuide(guide.entries, {
        query,
        category,
        discovery,
      }),
    [guide.entries, query, category, discovery],
  );

  const discoveryCounts: Record<CollectionDiscoveryFilter, number> = {
    all: guide.entries.length,
    seen: guide.entries.filter((entry) => entry.seen).length,
    'not-seen': guide.curatedTotalCount - guide.curatedSeenCount,
  };
  const loading = creaturesLoading || collectionLoading;

  return (
    <div className="animate-rise">
      <TopBar title="Marine collection" />

      {!loading ? (
        <>
          <header className="px-6 pt-2 pb-5">
            <h2 className="text-[2.2rem] leading-tight font-black tracking-tight text-abyss">
              {guide.curatedSeenCount} of {guide.curatedTotalCount} seen
            </h2>
            <p className="mt-1 text-sm font-semibold text-abyss/70">
              Mexican Caribbean field guide · sightings come from your dive log
            </p>
          </header>

          <div className="px-6 pb-4">
            <div className="relative flex items-center">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 text-abyss/30"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search marine guide"
                aria-label="Search marine guide"
                className="w-full rounded-2xl bg-abyss/[0.04] py-3.5 pr-11 pl-11 text-base font-bold text-abyss transition-colors outline-none placeholder:font-medium placeholder:text-abyss/35 focus-visible:bg-abyss/[0.06] focus-visible:ring-2 focus-visible:ring-marine"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="tap-lift absolute right-1 flex h-11 w-11 items-center justify-center rounded-full text-abyss/65 active:bg-abyss/5"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>

          <div
            className="rail flex gap-2 overflow-x-auto px-6 pb-4"
            role="group"
            aria-label="Filter by discovery status"
          >
            {DISCOVERY_FILTERS.map((option) => {
              const active = discovery === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setDiscovery(option.value)}
                  aria-pressed={active}
                  className={`tap-lift flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-bold transition-colors ${
                    active
                      ? 'border-marine/35 bg-marine/10 text-abyss'
                      : 'border-border bg-surface text-abyss/65 hover:border-marine/25'
                  }`}
                >
                  {option.label}
                  <span className="ml-1.5 text-xs font-semibold opacity-60">
                    {discoveryCounts[option.value]}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            className="rail flex gap-6 overflow-x-auto px-6 pb-6"
            role="group"
            aria-label="Filter by category"
          >
            <button
              type="button"
              onClick={() => setCategory(ALL_COLLECTION_CATEGORIES)}
              className={`tap-lift relative flex min-h-11 items-center pb-1 ${
                category === ALL_COLLECTION_CATEGORIES
                  ? 'opacity-100'
                  : 'opacity-55 hover:opacity-80'
              }`}
              aria-pressed={category === ALL_COLLECTION_CATEGORIES}
            >
              <span className="text-[12px] font-black tracking-[0.12em] text-abyss uppercase">
                All{' '}
                <span className="ml-0.5 font-semibold opacity-60">
                  {discoveryEntries.length}
                </span>
              </span>
              {category === ALL_COLLECTION_CATEGORIES ? (
                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-marine" />
              ) : null}
            </button>
            {categories.map(([key, count]) => (
              <button
                type="button"
                key={key}
                onClick={() => setCategory(key)}
                className={`tap-lift relative flex min-h-11 items-center pb-1 ${
                  category === key
                    ? 'opacity-100'
                    : 'opacity-55 hover:opacity-80'
                }`}
                aria-pressed={category === key}
              >
                <span className="text-[12px] font-black tracking-[0.12em] text-abyss uppercase">
                  {formatCategory(key === 'unlisted' ? undefined : key)}{' '}
                  <span className="ml-0.5 font-semibold opacity-60">
                    {count}
                  </span>
                </span>
                {category === key ? (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-marine" />
                ) : null}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="px-6 py-12 text-center" role="status">
              <p className="text-sm font-medium text-abyss/70">
                No creatures match these filters.
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-4 px-6 pb-12">
              {visible.map((entry, position) => (
                <li key={entry.creature.id}>
                  <CreatureTile
                    creature={entry.creature}
                    to={`/collection/${entry.creature.id}`}
                    showCategory
                    seen={entry.seen}
                    priority={position < 4}
                    caption={
                      entry.history
                        ? entry.history.diveCount > 1
                          ? `Seen on ${entry.history.diveCount} dives`
                          : `First seen ${formatDate(entry.history.firstSeenDate)}`
                        : 'Not yet seen'
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}
