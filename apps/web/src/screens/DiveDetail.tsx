/**
 * One dive as a memory artifact.
 *
 * Canonical values only: date, place, max depth, duration, the diver's own
 * highlight and every creature met. The prototype's water temperature and
 * clock time are not part of Poseidon's model and are deliberately absent.
 */
import { useState } from 'react';
import { Clock, Gauge, Pencil, Ship, Trash2, Users } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { CreatureTile } from '../components/CreatureTile';
import { DiveHero } from '../components/DiveHero';
import {
  ACTION_QUIET,
  Card,
  DangerAction,
  EmptyState,
  QuietAction,
  SectionHeader,
  TopBar,
} from '../components/ui';
import { useCreatureIndex, useDive } from '../data/hooks';
import { useMutation } from '../data/provider';
import {
  formatDate,
  formatDepth,
  formatDuration,
  formatQuantity,
  pluralize,
} from '../lib/format';

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex flex-1 flex-col items-center gap-1 px-2 py-4">
      <span className="text-marine">{icon}</span>
      <span className="text-[10px] font-bold tracking-[0.12em] text-abyss/55 uppercase">
        {label}
      </span>
      <span className="text-lg font-black text-abyss">{value}</span>
    </Card>
  );
}

export function DiveDetail() {
  const { diveId } = useParams<{ diveId: string }>();
  const navigate = useNavigate();
  const { data: dive, loading } = useDive(diveId);
  const { index } = useCreatureIndex();
  const { run, pending } = useMutation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!loading && !dive) {
    return (
      <div>
        <TopBar title="Dive" onBack={() => navigate('/journal')} />
        <EmptyState
          icon={<Gauge size={32} aria-hidden="true" />}
          title="This dive is no longer here"
          body="It may have been deleted. Your other dives are safe in the journal."
        />
      </div>
    );
  }

  if (!dive) return <TopBar title="Dive" onBack={() => navigate('/journal')} />;

  const sightings = dive.sightings
    .map((sighting) => ({ sighting, creature: index.get(sighting.creatureId) }))
    .filter(
      (
        entry,
      ): entry is {
        sighting: typeof entry.sighting;
        creature: NonNullable<typeof entry.creature>;
      } => Boolean(entry.creature),
    );

  const remove = async () => {
    await run((store) => store.deleteDive(dive.id));
    navigate('/journal', { replace: true });
  };

  return (
    <div className="animate-rise pb-10">
      <TopBar
        title={formatDate(dive.date)}
        onBack={() => navigate(-1)}
        backLabel="Back to journal"
      />

      <div className="px-5">
        <DiveHero dive={dive} creatureIndex={index} />
      </div>

      <div className="mt-5 flex gap-3 px-5">
        <Metric
          icon={<Gauge size={22} aria-hidden="true" />}
          label="Max depth"
          value={formatDepth(dive.maxDepth)}
        />
        <Metric
          icon={<Clock size={22} aria-hidden="true" />}
          label="Duration"
          value={formatDuration(dive.durationMinutes)}
        />
      </div>

      {dive.operator || dive.buddies?.length ? (
        <div className="mt-3 flex gap-3 px-5">
          {dive.operator ? (
            <Card className="flex flex-1 items-center gap-3 p-4">
              <Ship
                size={20}
                className="shrink-0 text-marine"
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block text-[10px] font-bold tracking-[0.12em] text-abyss/55 uppercase">
                  Operator
                </span>
                <span className="block truncate text-sm font-bold text-abyss">
                  {dive.operator}
                </span>
              </span>
            </Card>
          ) : null}
          {dive.buddies?.length ? (
            <Card className="flex flex-1 items-center gap-3 p-4">
              <Users
                size={20}
                className="shrink-0 text-marine"
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block text-[10px] font-bold tracking-[0.12em] text-abyss/55 uppercase">
                  Buddies
                </span>
                <span className="block truncate text-sm font-bold text-abyss">
                  {dive.buddies.join(', ')}
                </span>
              </span>
            </Card>
          ) : null}
        </div>
      ) : null}

      {dive.note ? (
        <section className="mt-7 px-5">
          <SectionHeader title="Memory" />
          <Card className="bg-shell p-5">
            <p className="text-[15px] leading-relaxed font-medium text-abyss/85">
              {dive.note}
            </p>
          </Card>
        </section>
      ) : null}

      <section className="mt-7 px-5" aria-labelledby="dive-creatures">
        <SectionHeader
          title="Creatures met"
          action={
            <span className="rounded-full bg-aqua-soft px-3 py-1 text-sm font-bold text-abyss/75">
              {dive.sightings.length}
            </span>
          }
        />
        <h2 id="dive-creatures" className="sr-only">
          Creatures met on this dive
        </h2>
        {sightings.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm font-medium text-abyss/60">
              No creatures were logged on this dive. That is a complete record
              too.
            </p>
          </Card>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {sightings.map(({ sighting, creature }) => (
              <li key={sighting.id}>
                <CreatureTile
                  creature={creature}
                  to={`/collection/${creature.id}`}
                  highlight={dive.highlightCreatureId === creature.id}
                  showCategory
                  {...(formatQuantity(sighting.quantity)
                    ? { caption: formatQuantity(sighting.quantity) as string }
                    : {})}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-9 space-y-3 px-5">
        <Link to={`/journal/${dive.id}/edit`} className={ACTION_QUIET}>
          <Pencil size={18} aria-hidden="true" />
          Edit this dive
        </Link>

        {confirmingDelete ? (
          <Card className="border-danger/25 bg-danger-soft p-5">
            <p className="mb-1 text-base font-black text-abyss">
              Delete this dive?
            </p>
            <p className="mb-4 text-sm font-medium text-abyss/70">
              {dive.siteName} on {formatDate(dive.date)} and its{' '}
              {pluralize(dive.sightings.length, 'sighting')} will be removed
              from your history. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <QuietAction
                type="button"
                onClick={() => setConfirmingDelete(false)}
              >
                Keep it
              </QuietAction>
              <DangerAction type="button" onClick={remove} disabled={pending}>
                <Trash2 size={18} aria-hidden="true" />
                Delete
              </DangerAction>
            </div>
          </Card>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="mx-auto flex min-h-[2.75rem] items-center gap-2 rounded-full px-4 text-sm font-bold text-danger"
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete dive
          </button>
        )}
      </section>
    </div>
  );
}
