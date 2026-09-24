/**
 * Home represents the owner's underwater life, not a KPI dashboard.
 *
 * The latest dive is the dominant object; lifetime shape is quiet and derived;
 * discoveries and places are invitations into the deeper surfaces. Every
 * number here comes from the store — there are no decorative totals.
 */
import { ArrowRight, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  useCreatureIndex,
  useDives,
  useLifetimeStats,
  usePlaceSummaries,
  useRecentDiscoveries,
} from '../data/hooks';
import { formatDate, pluralize } from '../lib/format';
import { CreatureTile } from '../components/CreatureTile';
import { DiveHero } from '../components/DiveHero';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { ACTION_PRIMARY, Card, Eyebrow, SectionHeader } from '../components/ui';
import { useOptionalAuth } from '../auth/AuthContext';

function SeeAll({ to, children }: { to: string; children: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm font-bold text-marine"
    >
      {children}
      <ArrowRight size={15} aria-hidden="true" />
    </Link>
  );
}

function FirstDiveInvitation() {
  return (
    <div className="px-5 pb-10">
      <Card className="relative overflow-hidden p-7 text-center">
        <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-aqua-soft text-marine">
          <Waves size={36} aria-hidden="true" />
        </span>
        <h2 className="mb-2 text-2xl font-black text-abyss">
          Your atlas starts here
        </h2>
        <p className="mb-6 text-sm leading-relaxed font-medium text-abyss/60">
          Log your first dive and Poseidon begins keeping the record: where you
          went, how long you stayed and every creature you met.
        </p>
        <Link to="/log" className={ACTION_PRIMARY}>
          Log your first dive
        </Link>
      </Card>
    </div>
  );
}

export function Home() {
  const auth = useOptionalAuth();
  const { data: dives, loading } = useDives();
  const { index } = useCreatureIndex();
  const { data: stats } = useLifetimeStats();
  const { data: discoveries } = useRecentDiscoveries(8);
  const { data: places } = usePlaceSummaries();

  const latest = dives?.[0];
  const recent = (dives ?? []).slice(1, 6);

  return (
    <div className="animate-rise">
      <header className="safe-top px-6 pb-7">
        <div className="flex items-start justify-between gap-4">
          <Eyebrow>Poseidon</Eyebrow>
          <Link
            to="/profile"
            aria-label="Open profile"
            className="press-ring flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-marine/15 bg-aqua-soft text-marine shadow-sm"
          >
            <ProfileAvatar photoURL={auth?.user?.photoURL} />
          </Link>
        </div>
        <h1 className="mt-1 max-w-[12ch] text-[2.25rem] leading-[1.04] font-black tracking-[-0.035em] text-abyss">
          Your underwater life
        </h1>
        {stats && stats.totalDives > 0 ? (
          <p className="mt-3 max-w-[34ch] text-base leading-relaxed font-semibold text-abyss/65">
            A permanent record of {stats.totalDives} dives exploring{' '}
            {places?.length ?? 0} places, with {stats.distinctCreatures}{' '}
            creatures met along the way.
          </p>
        ) : (
          <p className="mt-3 max-w-[34ch] text-base leading-relaxed font-semibold text-abyss/65">
            A beautifully kept record, waiting for its first entry.
          </p>
        )}
      </header>

      {!loading && !latest ? <FirstDiveInvitation /> : null}

      {latest ? (
        <>
          <section className="pb-10">
            <Link to={`/journal/${latest.id}`} className="block px-5">
              <DiveHero
                dive={latest}
                creatureIndex={index}
                eyebrow="Latest dive"
              />
            </Link>
          </section>

          {discoveries && discoveries.length > 0 ? (
            <section className="pb-12" aria-labelledby="home-discoveries">
              <div className="px-6">
                <SectionHeader
                  title="Newly met"
                  action={<SeeAll to="/collection">Collection</SeeAll>}
                  className="mb-4"
                />
              </div>
              <h2 id="home-discoveries" className="sr-only">
                Recently discovered creatures
              </h2>
              <ul className="rail flex gap-3 overflow-x-auto px-5 pb-2">
                {discoveries.map((discovery) => (
                  <li key={discovery.creature.id} className="w-36 shrink-0">
                    <CreatureTile
                      creature={discovery.creature}
                      to={`/collection/${discovery.creature.id}`}
                      caption={`First seen ${formatDate(discovery.firstSeenDate)}`}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {recent.length > 0 ? (
            <section className="px-6 pb-12" aria-labelledby="home-recent">
              <SectionHeader
                title="Past entries"
                action={<SeeAll to="/journal">Journal</SeeAll>}
              />
              <h2 id="home-recent" className="sr-only">
                Recent dives
              </h2>
              <ul className="space-y-4">
                {recent.map((dive) => (
                  <li key={dive.id}>
                    <Link to={`/journal/${dive.id}`} className="block">
                      <DiveHero dive={dive} creatureIndex={index} size="sm" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {places && places.length > 0 ? (
            <section className="px-6 pb-12" aria-labelledby="home-places">
              <SectionHeader
                title="Explored"
                action={<SeeAll to="/atlas">Atlas</SeeAll>}
              />
              <h2 id="home-places" className="sr-only">
                Places
              </h2>
              <ul className="-mx-4">
                {places.slice(0, 3).map((place) => (
                  <li key={place.key}>
                    <Link
                      to={`/atlas/${encodeURIComponent(place.key)}`}
                      className="flex items-center gap-4 border-b border-abyss/5 px-4 py-4 transition-colors active:bg-abyss/5"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[1.1rem] font-bold text-abyss">
                          {place.label}
                        </span>
                        <span className="mt-0.5 block text-sm font-medium text-abyss/50">
                          {pluralize(place.diveCount, 'dive')} ·{' '}
                          {pluralize(place.siteCount, 'site')}
                        </span>
                      </span>
                      <ArrowRight
                        size={18}
                        className="shrink-0 text-abyss/20"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
