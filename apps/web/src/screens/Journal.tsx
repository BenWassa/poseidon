/**
 * The complete chronological record. Every dive belongs here — an ordinary
 * shore dive earns the same row as the one with the eagle ray.
 */
import { ArrowRight, BookOpen, Clock, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Dive } from '@poseidon/domain';

import { CreatureImage } from '../components/CreatureImage';
import { heroCreature } from '../components/DiveHero';
import { ACTION_PRIMARY, Card, EmptyState, TopBar } from '../components/ui';
import { useCreatureIndex, useDives } from '../data/hooks';
import { formatDate, formatDepth, formatDuration, formatMonthYear, monthKey, pluralize } from '../lib/format';

function groupByMonth(dives: Dive[]): Array<{ key: string; label: string; dives: Dive[] }> {
  const groups = new Map<string, Dive[]>();
  for (const dive of dives) {
    const key = monthKey(dive.date);
    const bucket = groups.get(key);
    if (bucket) bucket.push(dive);
    else groups.set(key, [dive]);
  }
  return [...groups.entries()].map(([key, entries]) => ({
    key,
    label: formatMonthYear(entries[0]?.date ?? key),
    dives: entries,
  }));
}

export function Journal() {
  const { data: dives, loading } = useDives();
  const { index } = useCreatureIndex();
  const groups = groupByMonth(dives ?? []);

  return (
    <div className="animate-rise">
      <TopBar title="Dive journal" />

      {!loading && (dives?.length ?? 0) === 0 ? (
        <EmptyState
          icon={<BookOpen size={34} aria-hidden="true" />}
          title="No dives yet"
          body="Every dive belongs in the record — even the quiet ones. Your journal fills up from the first entry."
          action={
            <Link to="/log" className={ACTION_PRIMARY}>
              Log a dive
            </Link>
          }
        />
      ) : null}

      <div className="px-5 pb-6">
        {groups.map((group) => (
          <section key={group.key} className="mb-7" aria-labelledby={`month-${group.key}`}>
            <h2
              id={`month-${group.key}`}
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ocean/45"
            >
              {group.label}
            </h2>
            <ul className="space-y-3">
              {group.dives.map((dive) => {
                const hero = heroCreature(dive, index);
                const others = dive.sightings
                  .map((sighting) => index.get(sighting.creatureId))
                  .filter((creature): creature is NonNullable<typeof creature> => Boolean(creature))
                  .filter((creature) => creature.id !== hero?.id)
                  .slice(0, 4);

                return (
                  <li key={dive.id}>
                    <Link to={`/journal/${dive.id}`} className="block">
                      <Card className="overflow-hidden p-3 active:scale-[0.985]">
                        <div className="flex gap-3">
                          {hero ? (
                            <CreatureImage
                              creature={hero}
                              variant="gallery"
                              className="w-24 shrink-0 rounded-tile"
                            />
                          ) : (
                            <div className="flex w-24 shrink-0 items-center justify-center rounded-tile bg-shallows text-marine">
                              <Gauge size={26} aria-hidden="true" />
                            </div>
                          )}
                          <div className="flex min-w-0 flex-1 flex-col justify-center">
                            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-lagoon">
                              {formatDate(dive.date)}
                            </p>
                            <h3 className="truncate text-lg font-bold leading-tight text-ocean">
                              {dive.siteName}
                            </h3>
                            <p className="truncate text-sm font-medium text-ocean/55">{dive.areaName}</p>
                            <p className="mt-1.5 flex items-center gap-3 text-xs font-bold text-ocean/60">
                              <span className="inline-flex items-center gap-1">
                                <Gauge size={13} aria-hidden="true" />
                                {formatDepth(dive.maxDepth)}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock size={13} aria-hidden="true" />
                                {formatDuration(dive.durationMinutes)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-foam px-3 py-2.5">
                          {dive.sightings.length > 0 ? (
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="shrink-0 text-xs font-semibold text-ocean/55">Met</span>
                              <span className="flex -space-x-2">
                                {others.map((creature) => (
                                  <CreatureImage
                                    key={creature.id}
                                    creature={creature}
                                    variant="thumb"
                                    className="w-8 rounded-full border-2 border-foam"
                                  />
                                ))}
                              </span>
                              <span className="truncate text-xs font-semibold text-ocean/55">
                                {pluralize(dive.sightings.length, 'creature')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-ocean/45">No creatures logged</span>
                          )}
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-shallows text-marine">
                            <ArrowRight size={16} aria-hidden="true" />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
