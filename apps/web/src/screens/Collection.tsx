/**
 * The marine collection is what the owner has actually encountered.
 *
 * The prototype framed this as `Ocean Explorer · Level 4 · 150 Total Known`,
 * which measures the diver against a catalogue rather than showing their own
 * history. Poseidon shows the encountered life, when it was first met and how
 * often it has been seen since. There is no level, no global denominator and
 * no rarity.
 */
import { useMemo, useState } from 'react';
import { Fish, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { CreatureTile } from '../components/CreatureTile';
import { ACTION_PRIMARY, EmptyState, TopBar } from '../components/ui';
import { useCollection } from '../data/hooks';
import { formatCategory, formatDate, pluralize } from '../lib/format';

const ALL = '**all**';

export function Collection() {
  const { data: collection, loading } = useCollection();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(ALL);

  const entries = useMemo(() => collection ?? [], [collection]);

  const categories = useMemo(() => {
    const seen = new Map<string, number>();
    for (const entry of entries) {
      const key = entry.creature.category ?? 'unlisted';
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    return [...seen.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [entries]);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('en');
    return entries.filter((entry) => {
      const inCategory =
        category === ALL ||
        (entry.creature.category ?? 'unlisted') === category;
      if (!inCategory) return false;
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
  }, [entries, query, category]);

  const placesCount = useMemo(
    () => new Set(entries.flatMap((entry) => entry.areas)).size,
    [entries],
  );
  const divesCount = useMemo(
    () => new Set(entries.flatMap((entry) => entry.relatedDiveIds)).size,
    [entries],
  );

  return (
    <div className="animate-rise">
      <TopBar title="Marine collection" />

      {!loading && entries.length === 0 ? (
        <EmptyState
          icon={<Fish size={34} aria-hidden="true" />}
          title="Nothing collected yet"
          body="Your collection grows from the creatures you actually meet. Log a dive and they start appearing here."
          action={
            <Link to="/log" className={ACTION_PRIMARY}>
              Log a dive
            </Link>
          }
        />
      ) : null}

      {entries.length > 0 ? (
        <>
          <header className="px-6 pt-2 pb-6">
            <h2 className="text-[2.2rem] leading-tight font-black tracking-tight text-abyss">
              {pluralize(entries.length, 'creature')}
            </h2>
            <p className="mt-1 text-sm font-semibold text-abyss/70">
              Encountered across {pluralize(placesCount, 'place')} and{' '}
              {pluralize(divesCount, 'dive')}
            </p>
          </header>

          <div className="px-6 pb-6">
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
                placeholder="Search your collection"
                aria-label="Search your collection"
                className="w-full rounded-2xl bg-abyss/[0.04] py-3.5 pr-11 pl-11 text-base font-bold text-abyss transition-colors outline-none placeholder:font-medium placeholder:text-abyss/35 focus-visible:bg-abyss/[0.06] focus-visible:ring-2 focus-visible:ring-marine"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full text-abyss/40 transition-colors active:bg-abyss/5"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="rail flex gap-6 overflow-x-auto px-6 pb-6">
            <button
              type="button"
              onClick={() => setCategory(ALL)}
              className={`relative pb-2 transition-opacity ${
                category === ALL ? 'opacity-100' : 'opacity-40 hover:opacity-70'
              }`}
              aria-pressed={category === ALL}
            >
              <span className="text-[12px] font-black tracking-[0.12em] text-abyss uppercase">
                All{' '}
                <span className="ml-0.5 font-semibold opacity-60">
                  {entries.length}
                </span>
              </span>
              {category === ALL ? (
                <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-marine" />
              ) : null}
            </button>
            {categories.map(([key, count]) => (
              <button
                type="button"
                key={key}
                onClick={() => setCategory(key)}
                className={`relative pb-2 transition-opacity ${
                  category === key
                    ? 'opacity-100'
                    : 'opacity-40 hover:opacity-70'
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
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-abyss/55">
                Nothing in your collection matches that yet.
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
                    priority={position < 4}
                    caption={
                      entry.diveCount > 1
                        ? `Seen on ${entry.diveCount} dives`
                        : `First seen ${formatDate(entry.firstSeenDate)}`
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
