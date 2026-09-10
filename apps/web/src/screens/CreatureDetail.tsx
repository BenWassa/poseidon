/**
 * A creature page grounded in personal encounter history.
 *
 * Common name leads; the scientific name is quiet metadata underneath. What
 * the page is really about is where and when this animal has appeared in the
 * owner's diving life. Curated regional/source context stays secondary.
 */
import { ArrowRight, CalendarDays, ExternalLink, Fish, MapPin, Waves } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { CreatureImage } from '../components/CreatureImage';
import { Card, EmptyState, SectionHeader, TopBar } from '../components/ui';
import { regions } from '../data/content';
import { useCreatureHistory, useCreatureIndex, useDives } from '../data/hooks';
import { formatCategory, formatDate, formatDepth, formatDuration, pluralize } from '../lib/format';

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card className="flex flex-1 flex-col gap-1 p-4">
      <span className="text-marine">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ocean/55">{label}</span>
      <span className="text-sm font-black leading-tight text-ocean">{value}</span>
    </Card>
  );
}

export function CreatureDetail() {
  const { creatureId } = useParams<{ creatureId: string }>();
  const navigate = useNavigate();
  const { data: history, loading } = useCreatureHistory(creatureId);
  const { index } = useCreatureIndex();
  const { data: dives } = useDives();

  const creature = history?.creature ?? (creatureId ? index.get(creatureId) : undefined);

  if (!loading && !creature) {
    return (
      <div>
        <TopBar title="Creature" onBack={() => navigate('/collection')} />
        <EmptyState
          icon={<Fish size={32} aria-hidden="true" />}
          title="Not in your collection"
          body="This creature is not part of your encounter history yet."
        />
      </div>
    );
  }

  if (!creature) return <TopBar title="Creature" onBack={() => navigate('/collection')} />;

  const relatedDives = (dives ?? []).filter((dive) => history?.relatedDiveIds.includes(dive.id));
  const regionNames = [...new Set(
    (creature.regionIds ?? [])
      .map((regionId) => regions.find((region) => region.id === regionId)?.name)
      .filter((name): name is string => Boolean(name)),
  )];
  const provenance = creature.provenance ?? [];
  const hasCuratedContext = regionNames.length > 0 || provenance.length > 0;

  return (
    <div className="animate-rise pb-10">
      <TopBar
        title={creature.commonName}
        onBack={() => navigate(-1)}
        backLabel="Back to collection"
        asHeading={false}
      />

      <div className="px-5">
        <Card className="overflow-hidden p-4">
          <CreatureImage creature={creature} variant="hero" priority className="rounded-tile" />
          <div className="px-1 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-lagoon">
              {formatCategory(creature.category)}
              {creature.userCreated ? ' · added by you' : ''}
            </p>
            <h1 className="mt-1 text-2xl font-black leading-tight text-ocean">{creature.commonName}</h1>
            {creature.scientificName ? (
              <p className="mt-1 text-sm font-medium italic text-ocean/50">{creature.scientificName}</p>
            ) : null}
            {creature.aliases?.length ? (
              <p className="mt-2 text-xs font-medium text-ocean/55">Also called {creature.aliases.join(', ')}</p>
            ) : null}
            {creature.artwork?.status !== 'curated' ? (
              <p className="mt-3 rounded-2xl bg-foam px-3 py-2 text-xs font-medium text-ocean/60">
                Artwork for this creature is still to come. The encounter is recorded either way.
              </p>
            ) : null}
          </div>
        </Card>
      </div>

      {history ? (
        <>
          <div className="mt-5 flex gap-3 px-5">
            <Fact
              icon={<Waves size={20} aria-hidden="true" />}
              label="Encounters"
              value={pluralize(history.diveCount, 'dive')}
            />
            <Fact
              icon={<CalendarDays size={20} aria-hidden="true" />}
              label="First seen"
              value={formatDate(history.firstSeenDate)}
            />
          </div>
          <div className="mt-3 flex gap-3 px-5">
            <Fact
              icon={<CalendarDays size={20} aria-hidden="true" />}
              label="Most recent"
              value={formatDate(history.mostRecentSeenDate)}
            />
            <Fact
              icon={<MapPin size={20} aria-hidden="true" />}
              label="Places"
              value={history.areas.join(', ') || '—'}
            />
          </div>

          {history.sites.length > 0 ? (
            <section className="mt-7 px-5">
              <SectionHeader title="Sites" />
              <div className="flex flex-wrap gap-2">
                {history.sites.map((site) => (
                  <span
                    key={site}
                    className="rounded-full border border-shallows bg-surface px-3 py-1.5 text-sm font-bold text-ocean/75"
                  >
                    {site}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {relatedDives.length > 0 ? (
            <section className="mt-7 px-5" aria-labelledby="creature-dives">
              <SectionHeader title="Seen on these dives" />
              <h2 id="creature-dives" className="sr-only">
                Dives where this creature was seen
              </h2>
              <ul className="space-y-3">
                {relatedDives.map((dive) => (
                  <li key={dive.id}>
                    <Link to={`/journal/${dive.id}`}>
                      <Card className="flex items-center gap-3 p-4 active:scale-[0.99]">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base font-bold text-ocean">{dive.siteName}</span>
                          <span className="block text-xs font-medium text-ocean/55">
                            {formatDate(dive.date)} · {dive.areaName} · {formatDepth(dive.maxDepth)} ·{' '}
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
        </>
      ) : (
        <div className="px-5 pt-6">
          <Card className="p-6 text-center">
            <p className="text-sm font-medium text-ocean/60">
              You have not logged this creature yet. It will gain a history the first time you do.
            </p>
          </Card>
        </div>
      )}

      {hasCuratedContext ? (
        <section className="mt-8 px-5" aria-label="Curated creature context">
          <SectionHeader title="Curated context" />
          <Card className="p-4">
            {regionNames.length > 0 ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ocean/45">Regional relevance</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {regionNames.map((name) => (
                    <span
                      key={name}
                      className="rounded-full border border-shallows bg-foam px-3 py-1.5 text-xs font-bold text-ocean/70"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {provenance.length > 0 ? (
              <div className={regionNames.length > 0 ? 'mt-4 border-t border-shallows pt-4' : ''}>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ocean/45">Sources</p>
                <ul className="mt-2 space-y-2">
                  {provenance.map((entry) => (
                    <li key={`${entry.source}:${entry.url ?? ''}`}>
                      {entry.url ? (
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-h-11 items-center gap-3 rounded-2xl bg-foam px-3 py-2 text-left"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold leading-snug text-ocean">{entry.source}</span>
                            {entry.note ? (
                              <span className="mt-0.5 block text-xs font-medium text-ocean/50">{entry.note}</span>
                            ) : null}
                          </span>
                          <ExternalLink size={16} className="shrink-0 text-marine" aria-hidden="true" />
                        </a>
                      ) : (
                        <div className="rounded-2xl bg-foam px-3 py-2">
                          <p className="text-sm font-bold leading-snug text-ocean">{entry.source}</p>
                          {entry.note ? <p className="mt-0.5 text-xs font-medium text-ocean/50">{entry.note}</p> : null}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
        </section>
      ) : null}
    </div>
  );
}
