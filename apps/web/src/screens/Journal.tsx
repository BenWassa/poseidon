/**
 * The complete chronological record. Every dive belongs here — an ordinary
 * shore dive earns the same row as the one with the eagle ray.
 */
import { ArrowRight, BookOpen, Clock, Gauge } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  deriveHistoryMilestones,
  groupDivesIntoTrips,
  type DiveTrip,
  type HistoryMilestone,
} from '@poseidon/domain';

import { CreatureImage } from '../components/CreatureImage';
import { heroCreature } from '../components/DiveHero';
import { ACTION_PRIMARY, Card, EmptyState, TopBar } from '../components/ui';
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

function tripDateRange(trip: DiveTrip): string {
  if (trip.firstDate === trip.lastDate) return formatDate(trip.firstDate);
  return `${formatDate(trip.firstDate)} – ${formatDate(trip.lastDate)}`;
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

      <div className="px-5 pb-6">
        {trips.map((trip) => {
          const id = `trip-${headingId(trip)}`;
          return (
            <section key={trip.id} className="mb-8" aria-labelledby={id}>
              <div className="mb-3 flex items-end justify-between gap-3 px-0.5">
                <div className="min-w-0">
                  <h2
                    id={id}
                    className="text-[11px] font-bold tracking-[0.14em] text-ocean/55 uppercase"
                  >
                    {trip.areaName} — {tripPeriodLabel(trip)}
                  </h2>
                  <p className="mt-0.5 text-xs font-semibold text-ocean/40">
                    {tripDateRange(trip)}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-bold text-ocean/40">
                  {pluralize(trip.dives.length, 'dive')}
                </span>
              </div>

              <ul className="space-y-3">
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
                              <p className="text-[11px] font-bold tracking-[0.14em] text-lagoon uppercase">
                                {formatDate(dive.date)}
                              </p>
                              <h3 className="truncate text-lg leading-tight font-bold text-ocean">
                                {dive.siteName}
                              </h3>
                              <p className="truncate text-sm font-medium text-ocean/55">
                                {dive.areaName}
                              </p>
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
                                <span className="shrink-0 text-xs font-semibold text-ocean/55">
                                  Met
                                </span>
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
                              <span className="text-xs font-semibold text-ocean/45">
                                No creatures logged
                              </span>
                            )}
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-shallows text-marine">
                              <ArrowRight size={16} aria-hidden="true" />
                            </span>
                          </div>

                          {milestones.length > 0 ? (
                            <div
                              className="mt-2 flex flex-wrap gap-1.5 px-0.5"
                              aria-label="History milestones"
                            >
                              {milestones.map((milestone) => (
                                <span
                                  key={milestone.id}
                                  className="rounded-full border border-shallows bg-foam px-2.5 py-1 text-[11px] font-bold text-marine"
                                >
                                  {milestoneLabel(milestone)}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </Card>
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
