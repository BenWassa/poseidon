/**
 * The complete chronological record. Every dive belongs here — an ordinary
 * shore dive earns the same row as the one with the eagle ray.
 */
import { ArrowRight, BookOpen, Clock, Gauge, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  deriveHistoryMilestones,
  groupDivesIntoTrips,
  type DiveTrip,
  type HistoryMilestone,
} from '@poseidon/domain';

import { CreatureImage } from '../components/CreatureImage';
import { heroCreature } from '../components/DiveHero';
import { ACTION_PRIMARY, EmptyState, TopBar } from '../components/ui';
import { useCreatureIndex, useDives } from '../data/hooks';
import {
  formatCategory,
  formatDate,
  formatDepth,
  formatDuration,
  formatMonthYear,
  monthKey,
  pluralize,
} from '../lib/format';

function tripPeriodLabel(trip: DiveTrip): string {
  if (monthKey(trip.firstDate) === monthKey(trip.lastDate))
    return formatMonthYear(trip.firstDate);
  return `${formatMonthYear(trip.firstDate)} – ${formatMonthYear(trip.lastDate)}`;
}

function milestoneLabel(milestone: HistoryMilestone): string {
  switch (milestone.kind) {
    case 'first-dive':
      return 'First dive in this journal';
    case 'dive-count':
      return `${milestone.count ?? ''} dives in this journal`.trim();
    case 'new-country':
      return 'First dive in a new country';
    case 'new-region':
      return milestone.areaName
        ? `First dive in ${milestone.areaName}`
        : 'First dive in a new region';
    case 'creature-group':
      return milestone.category
        ? `First ${formatCategory(milestone.category).toLowerCase()} encounter`
        : 'First creature-group encounter';
  }
}

function headingId(trip: DiveTrip): string {
  return trip.id.replace(/[^a-zA-Z0-9_-]/g, '-');
}

export function Journal() {
  const { data: dives, loading } = useDives();
  const { index } = useCreatureIndex();
  const trips = groupDivesIntoTrips(dives ?? []);
  const milestonesByDive = new Map<string, HistoryMilestone[]>();
  for (const milestone of deriveHistoryMilestones(dives ?? [], index)) {
    const entries = milestonesByDive.get(milestone.diveId) ?? [];
    entries.push(milestone);
    milestonesByDive.set(milestone.diveId, entries);
  }

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

      <div className="pb-10">
        {trips.map((trip, position) => {
          const id = `trip-${headingId(trip)}`;
          return (
            <section key={trip.id} aria-labelledby={id}>
              <div className={`px-6 pb-3 ${position === 0 ? 'pt-4' : 'pt-12'}`}>
                <h2
                  id={id}
                  className="text-[1.65rem] leading-tight font-black tracking-tight text-ocean"
                >
                  {trip.areaName}
                </h2>
                <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-lagoon">
                  {tripPeriodLabel(trip)}
                  <span
                    className="h-1 w-1 rounded-full bg-lagoon/40"
                    aria-hidden="true"
                  />
                  {pluralize(trip.dives.length, 'dive')}
                </p>
              </div>

              <ul className="flex flex-col">
                {trip.dives.map((dive) => {
                  const hero = heroCreature(dive, index);
                  const others = dive.sightings
                    .map((sighting) => index.get(sighting.creatureId))
                    .filter(
                      (creature): creature is NonNullable<typeof creature> =>
                        Boolean(creature),
                    )
                    .filter((creature) => creature.id !== hero?.id)
                    .slice(0, 4);
                  const milestones = (
                    milestonesByDive.get(dive.id) ?? []
                  ).slice(0, 2);

                  return (
                    <li
                      key={dive.id}
                      className="border-b border-ocean/5 last:border-0"
                    >
                      <Link
                        to={`/journal/${dive.id}`}
                        className="block px-6 py-6 transition-colors active:bg-ocean/5"
                      >
                        <div className="flex gap-4">
                          {hero ? (
                            <CreatureImage
                              creature={hero}
                              variant="gallery"
                              className="h-28 w-24 shrink-0 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="flex h-28 w-24 shrink-0 items-center justify-center rounded-2xl bg-shallows text-marine">
                              <Waves size={26} aria-hidden="true" />
                            </div>
                          )}
                          <div className="flex min-w-0 flex-1 flex-col py-0.5">
                            <p className="text-[11px] font-bold tracking-[0.14em] text-ocean/50 uppercase">
                              {formatDate(dive.date)}
                            </p>
                            <h3 className="mt-1 truncate text-xl leading-tight font-black text-ocean">
                              {dive.siteName}
                            </h3>
                            <p className="truncate text-sm font-medium text-ocean/60">
                              {dive.areaName}
                            </p>
                            <div className="mt-auto flex items-center gap-3 pt-3 text-[13px] font-bold text-ocean/50">
                              <span className="flex items-center gap-1.5">
                                <Gauge size={14} aria-hidden="true" />
                                {formatDepth(dive.maxDepth)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock size={14} aria-hidden="true" />
                                {formatDuration(dive.durationMinutes)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {dive.sightings.length > 0 || milestones.length > 0 ? (
                          <div className="mt-5 flex items-end justify-between gap-3">
                            <div className="flex min-w-0 flex-1 flex-col gap-3">
                              {milestones.length > 0 ? (
                                <div
                                  className="flex flex-wrap gap-1.5"
                                  aria-label="History milestones"
                                >
                                  {milestones.map((milestone) => (
                                    <span
                                      key={milestone.id}
                                      className="inline-flex items-center rounded border border-sand/40 bg-sand/10 px-2 py-1 text-[10px] font-bold tracking-[0.1em] text-ocean/80 uppercase"
                                    >
                                      {milestoneLabel(milestone)}
                                    </span>
                                  ))}
                                </div>
                              ) : null}

                              {dive.sightings.length > 0 ? (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-semibold text-ocean/55">
                                    Met
                                  </span>
                                  <div className="flex -space-x-1.5">
                                    {others.map((creature) => (
                                      <CreatureImage
                                        key={creature.id}
                                        creature={creature}
                                        variant="thumb"
                                        className="h-7 w-7 rounded-full ring-2 ring-canvas"
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs font-semibold text-ocean/55">
                                    {pluralize(
                                      dive.sightings.length,
                                      'creature',
                                    )}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs font-semibold text-ocean/40">
                                  No creatures logged
                                </span>
                              )}
                            </div>
                            <ArrowRight
                              size={18}
                              className="mb-0.5 shrink-0 text-ocean/20"
                              aria-hidden="true"
                            />
                          </div>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
