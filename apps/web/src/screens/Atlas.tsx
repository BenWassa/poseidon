/** Personal geography: sourced site positions complement the existing offline history. */
import { useMemo } from 'react';
import { ArrowRight, Map as MapIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AtlasMap } from '../components/AtlasMap';
import { ACTION_PRIMARY, EmptyState, TopBar } from '../components/ui';
import { curatedSites } from '../data/content';
import { useDives, useLifetimeStats, usePlaceSummaries } from '../data/hooks';
import { buildAtlasMapModel } from '../lib/atlas';
import { formatDate, pluralize } from '../lib/format';
import { normalizePlaceName } from '../lib/suggestions';

export function Atlas() {
  const { data: places, loading } = usePlaceSummaries();
  const { data: stats } = useLifetimeStats();
  const { data: dives } = useDives();

  const entries = places ?? [];
  const mapModel = useMemo(
    () => buildAtlasMapModel(dives ?? [], curatedSites),
    [dives],
  );
  const lastDiveAt = (label: string): string | null => {
    const target = normalizePlaceName(label);
    const match = (dives ?? []).find(
      (dive) => normalizePlaceName(dive.areaName) === target,
    );
    return match ? match.date : null;
  };

  return (
    <div className="animate-rise">
      <TopBar title="Ocean atlas" />

      {!loading && entries.length === 0 ? (
        <EmptyState
          icon={<MapIcon size={34} aria-hidden="true" />}
          title="No places yet"
          body="Your atlas fills in as you dive. Each new area you log becomes part of the geographic shape of your diving life."
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
            <h2 className="text-[2.2rem] leading-tight font-black tracking-tight text-ocean">
              {pluralize(entries.length, 'place')}
            </h2>
            <p className="mt-1 text-sm font-semibold text-lagoon">
              {pluralize(stats?.distinctSites ?? 0, 'site')} across{' '}
              {pluralize(stats?.distinctCountries ?? 0, 'country', 'countries')}{' '}
              in {pluralize(stats?.totalDives ?? 0, 'dive')}
            </p>
          </header>

          {mapModel.sites.length > 0 ? (
            <section className="pb-10" aria-labelledby="atlas-map-heading">
              <h2 id="atlas-map-heading" className="sr-only">
                Sourced dive-site map
              </h2>
              <div className="px-6">
                <div className="overflow-hidden rounded-card bg-surface shadow-card">
                  <AtlasMap sites={mapModel.sites} />
                </div>
              </div>
              <div className="mt-5 px-8">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-black tracking-[0.14em] text-ocean/55 uppercase">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full bg-ocean"
                      aria-hidden="true"
                    />
                    In your history
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full border-[1.5px] border-ocean bg-white"
                      aria-hidden="true"
                    />
                    Sourced site
                  </span>
                </div>
                <p className="mt-3 text-xs leading-relaxed font-medium text-ocean/50">
                  {pluralize(mapModel.sites.length, 'site')} with published
                  positions. Approximate reef and site anchors are labelled as
                  such; no drop point or mooring is implied.
                </p>
                {mapModel.unmappedHistoryDiveCount > 0 ? (
                  <p className="mt-1.5 text-xs leading-relaxed font-medium text-ocean/40">
                    {pluralize(
                      mapModel.unmappedHistoryDiveCount,
                      'logged dive',
                    )}{' '}
                    without a sourced position remain in the history below.
                  </p>
                ) : null}
              </div>
            </section>
          ) : null}

          <section aria-labelledby="atlas-places">
            <div className="px-6 pb-2">
              <h2 id="atlas-places" className="text-lg font-black text-ocean">
                Index
              </h2>
            </div>
            <ul className="flex flex-col">
              {entries.map((place) => {
                const last = lastDiveAt(place.label);
                return (
                  <li
                    key={place.key}
                    className="border-t border-ocean/5 first:border-0"
                  >
                    <Link
                      to={`/atlas/${encodeURIComponent(place.key)}`}
                      className="flex items-center gap-4 px-6 py-5 transition-colors active:bg-ocean/5"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="block truncate text-xl font-black text-ocean">
                            {place.label}
                          </span>
                          {place.countryCode ? (
                            <span className="shrink-0 rounded bg-ocean/5 px-2 py-0.5 text-[10px] font-black tracking-widest text-ocean/60 uppercase">
                              {place.countryCode}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-2.5 text-[13px] font-bold text-ocean/50">
                          <span>{pluralize(place.diveCount, 'dive')}</span>
                          <span>·</span>
                          <span>{pluralize(place.siteCount, 'site')}</span>
                          <span>·</span>
                          <span>
                            {pluralize(place.creatureCount, 'creature')}
                          </span>
                        </div>
                        {last ? (
                          <span className="mt-2.5 block text-[10px] font-black tracking-[0.14em] text-lagoon uppercase">
                            Last visited {formatDate(last)}
                          </span>
                        ) : null}
                      </div>
                      <ArrowRight
                        size={18}
                        className="shrink-0 text-ocean/20"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <p className="px-8 pb-8 text-center text-xs leading-relaxed font-medium text-ocean/45">
            Poseidon does not plot dive sites it cannot source. Sites without
            trustworthy coordinates remain fully usable in logging and history.
          </p>
        </>
      ) : null}
    </div>
  );
}
