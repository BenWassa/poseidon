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
import {
  ACTION_PRIMARY,
  Card,
  Chip,
  EmptyState,
  TextInput,
  TopBar,
} from '../components/ui';
import { useCollection } from '../data/hooks';
import { formatCategory, formatDate, pluralize } from '../lib/format';

const ALL = '__all__';

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
          <div className="px-5 pb-4">
            <Card className="overflow-hidden bg-gradient-to-br from-marine to-abyss p-6 text-white shadow-lift">
              <p className="text-[11px] font-black tracking-[0.16em] text-white/70 uppercase">
                Encountered
              </p>
              <p className="mt-1 text-3xl leading-tight font-black">
                {pluralize(entries.length, 'creature')}
              </p>
              <p className="mt-1 text-sm font-medium text-white/75">
                across{' '}
                {pluralize(
                  new Set(entries.flatMap((entry) => entry.areas)).size,
                  'place',
                )}{' '}
                and{' '}
                {pluralize(
                  new Set(entries.flatMap((entry) => entry.relatedDiveIds))
                    .size,
                  'dive',
                )}
              </p>
            </Card>
          </div>

          <div className="px-5 pb-3">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ocean/40"
                aria-hidden="true"
              />
              <TextInput
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your collection"
                aria-label="Search your collection"
                className="pl-11"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ocean/45"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="rail -mx-0 flex gap-2 overflow-x-auto px-5 pb-4">
            <Chip selected={category === ALL} onClick={() => setCategory(ALL)}>
              All {entries.length}
            </Chip>
            {categories.map(([key, count]) => (
              <Chip
                key={key}
                selected={category === key}
                onClick={() => setCategory(key)}
              >
                {formatCategory(key === 'unlisted' ? undefined : key)} {count}
              </Chip>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm font-medium text-ocean/55">
              Nothing in your collection matches that yet.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 px-5 pb-8">
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
