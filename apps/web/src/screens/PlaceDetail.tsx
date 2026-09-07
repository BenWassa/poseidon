/**
 * One place, as a chapter of the diving life: its sites, its dives and the
 * creatures met there.
 */
import { useMemo } from 'react';
import { ArrowRight, Compass, MapPin } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { AtlasMotif } from '../components/AtlasMotif';
import { CreatureTile } from '../components/CreatureTile';
import { Card, EmptyState, SectionHeader, TopBar } from '../components/ui';
import { useCollection, useCreatureIndex, useDives, usePlaceSummaries } from '../data/hooks';
import { formatDate, formatDepth, formatDuration, pluralize } from '../lib/format';

export function PlaceDetail() {
  const { placeKey } = useParams<{ placeKey: string }>();
  const navigate = useNavigate();
  const { data: places, loading } = usePlaceSummaries();
  const { data: dives } = useDives();
  const { data: collection } = useCollection();
  const { index } = useCreatureIndex();

  const decoded = placeKey ? decodeURIComponent(placeKey) : '';
  const place = (places ?? []).find((entry) => entry.key === decoded);

  const placeDives = useMemo(
    () => (place ? (dives ?? []).filter((dive) => dive.areaName === place.label) : []),
    [dives, place],
  );

  const creatures = useMemo(() => {
    if (!place) return [];
    const diveIds = new Set(placeDives.map((dive) => dive.id));
    return (collection ?? []).filter((entry) => entry.relatedDiveIds.some((id) => diveIds.has(id)));
  }, [collection, place, placeDives]);

  const sites = useMemo(() => {
    const seen = new Map<string, { name: string; diveCount: number; lastDate: string }>();
    for (const dive of placeDives) {
      const existing = seen.get(dive.siteName);
      if (existing) {
        existing.diveCount += 1;
        if (dive.date > existing.lastDate) existing.lastDate = dive.date;
      } else {
        seen.set(dive.siteName, { name: dive.siteName, diveCount: 1, lastDate: dive.date });
      }
    }
    return [...seen.values()].sort((a, b) => b.lastDate.localeCompare(a.lastDate) || a.name.localeCompare(b.name));
  }, [placeDives]);

  if (!loading && !place) {
    return (
      <div>
        <TopBar title="Place" onBack={() => navigate('/atlas')} />
        <EmptyState
          icon={<Compass size={32} aria-hidden="true" />}
          title="No such place"
          body="This place is not part of your diving history."
        />
      </div>
    );
  }

  if (!place) return <TopBar title="Place" onBack={() => navigate('/atlas')} />;

  return (
    <div className="animate-rise pb-10">
      <TopBar title={place.label} onBack={() => navigate(-1)} backLabel="Back to atlas" asHeading={false} />

      <div className="px-5">
        <Card className="relative overflow-hidden bg-gradient-to-br from-marine to-abyss p-6 text-white shadow-lift">
          <AtlasMotif className="text-white" seed={place.label.length} />
          <div className="relative">
            <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white/70">
              <MapPin size={13} aria-hidden="true" />
              {place.countryCode ?? 'Place'}
            </p>
            <h1 className="mt-1.5 text-3xl font-black leading-tight">{place.label}</h1>
            <p className="mt-1 text-sm font-medium text-white/75">
              {pluralize(place.diveCount, 'dive')} · {pluralize(place.siteCount, 'site')} ·{' '}
              {pluralize(place.creatureCount, 'creature')}
            </p>
          </div>
        </Card>
      </div>

      {sites.length > 0 ? (
        <section className="mt-7 px-5">
          <SectionHeader title="Sites" />
          <ul className="space-y-2">
            {sites.map((site) => (
              <li key={site.name}>
                <Card className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-ocean">{site.name}</span>
                    <span className="block text-xs font-medium text-ocean/50">
                      {pluralize(site.diveCount, 'dive')} · last {formatDate(site.lastDate)}
                    </span>
                  </span>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {creatures.length > 0 ? (
        <section className="mt-7 px-5" aria-labelledby="place-creatures">
          <SectionHeader title="Met here" />
          <h2 id="place-creatures" className="sr-only">
            Creatures met at this place
          </h2>
          <ul className="grid grid-cols-3 gap-2.5">
            {creatures.map((entry) => (
              <li key={entry.creature.id}>
                <CreatureTile
                  creature={index.get(entry.creature.id) ?? entry.creature}
                  variant="thumb"
                  to={`/collection/${entry.creature.id}`}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {placeDives.length > 0 ? (
        <section className="mt-7 px-5" aria-labelledby="place-dives">
          <SectionHeader title="Dives here" />
          <h2 id="place-dives" className="sr-only">
            Dives at this place
          </h2>
          <ul className="space-y-3">
            {placeDives.map((dive) => (
              <li key={dive.id}>
                <Link to={`/journal/${dive.id}`}>
                  <Card className="flex items-center gap-3 p-4 active:scale-[0.99]">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-bold text-ocean">{dive.siteName}</span>
                      <span className="block text-xs font-medium text-ocean/55">
                        {formatDate(dive.date)} · {formatDepth(dive.maxDepth)} ·{' '}
                        {formatDuration(dive.durationMinutes)}
                      </span>
                    </span>
                    <ArrowRight size={18} className="shrink-0 text-ocean/35" aria-hidden="true" />
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
