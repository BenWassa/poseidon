/** Personal geography: sourced site positions complement the existing offline history. */
import { useMemo } from 'react';
import { ArrowRight, Compass, Map as MapIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { AtlasMap } from '../components/AtlasMap';
import { AtlasMotif } from '../components/AtlasMotif';
import { ACTION_PRIMARY, Card, EmptyState, SectionHeader, TopBar } from '../components/ui';
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
  const mapModel = useMemo(() => buildAtlasMapModel(dives ?? [], curatedSites), [dives]);
  const lastDiveAt = (label: string): string | null => {
    const target = normalizePlaceName(label);
    const match = (dives ?? []).find((dive) => normalizePlaceName(dive.areaName) === target);
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
          <div className="px-5 pb-5">
            <Card className="relative overflow-hidden bg-gradient-to-br from-ocean to-abyss p-6 text-white shadow-lift">
              <AtlasMotif className="text-white" seed={entries.length} />
              <div className="relative">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/70">Explored</p>
                <p className="mt-1 text-3xl font-black leading-tight">{pluralize(entries.length, 'place')}</p>
                <p className="mt-1 text-sm font-medium text-white/75">
                  {pluralize(stats?.distinctSites ?? 0, 'site')} ·{' '}
                  {pluralize(stats?.distinctCountries ?? 0, 'country', 'countries')} ·{' '}
                  {pluralize(stats?.totalDives ?? 0, 'dive')}
                </p>
              </div>
            </Card>
          </div>

          {mapModel.sites.length > 0 ? (
            <section className="px-5 pb-8" aria-labelledby="atlas-map-heading">
              <SectionHeader title="Mapped sites" />
              <h2 id="atlas-map-heading" className="sr-only">
                Sourced dive-site map
              </h2>
              <AtlasMap sites={mapModel.sites} />
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] font-bold text-ocean/55">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-ocean" aria-hidden="true" />
                  In your history
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-ocean bg-white" aria-hidden="true" />
                  Sourced site
                </span>
              </div>
              <p className="mt-2 px-1 text-xs font-medium leading-relaxed text-ocean/50">
                {pluralize(mapModel.sites.length, 'site')} with published positions. Approximate reef and site anchors are labelled as such; no drop point or mooring is implied.
              </p>
              {mapModel.unmappedHistoryDiveCount > 0 ? (
                <p className="mt-1 px-1 text-xs font-medium leading-relaxed text-ocean/45">
                  {pluralize(mapModel.unmappedHistoryDiveCount, 'logged dive')} without a sourced position remain in the history below.
                </p>
              ) : null}
            </section>
          ) : null}

          <section className="px-5 pb-8" aria-labelledby="atlas-places">
            <SectionHeader title="Places" />
            <h2 id="atlas-places" className="sr-only">
              Places you have dived
            </h2>
            <ul className="space-y-3">
              {entries.map((place) => {
                const last = lastDiveAt(place.label);
                return (
                  <li key={place.key}>
                    <Link to={`/atlas/${encodeURIComponent(place.key)}`}>
                      <Card className="flex items-center gap-4 p-4 active:scale-[0.99]">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-shallows text-marine">
                          <Compass size={22} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-2">
                            <span className="truncate text-base font-bold text-ocean">{place.label}</span>
                            {place.countryCode ? (
                              <span className="shrink-0 rounded-full bg-shallows px-2 py-0.5 text-[10px] font-black tracking-widest text-marine">
                                {place.countryCode}
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block text-xs font-medium text-ocean/55">
                            {pluralize(place.diveCount, 'dive')} · {pluralize(place.siteCount, 'site')} ·{' '}
                            {pluralize(place.creatureCount, 'creature')}
                          </span>
                          {last ? (
                            <span className="mt-0.5 block text-xs font-medium text-ocean/40">
                              Last dived {formatDate(last)}
                            </span>
                          ) : null}
                        </span>
                        <ArrowRight size={18} className="shrink-0 text-ocean/35" aria-hidden="true" />
                      </Card>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <p className="px-8 pb-8 text-center text-xs font-medium leading-relaxed text-ocean/45">
            Poseidon does not plot dive sites it cannot source. Sites without trustworthy coordinates remain fully usable in logging and history.
          </p>
        </>
      ) : null}
    </div>
  );
}
