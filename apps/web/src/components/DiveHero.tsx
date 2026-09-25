/**
 * A dive rendered as a memory rather than a row.
 *
 * The prototype leaned on stock underwater photography for this surface.
 * Poseidon has no photos, so the hero is built from deep ocean colour, the
 * bathymetric atlas motif, place typography and — when the dive has one — the
 * highlight creature's own artwork.
 */
import { ArrowDownToLine, Clock, MapPin } from 'lucide-react';

import type { Creature, Dive } from '@poseidon/domain';

import {
  formatDate,
  formatDepth,
  formatDuration,
  pluralize,
} from '../lib/format';
import { AtlasMotif } from './AtlasMotif';
import { CreatureImage } from './CreatureImage';

/**
 * Prefer the diver's chosen highlight when it has usable artwork; otherwise
 * show the first illustrated encounter. Fall back to the chosen creature only
 * when none of the sightings has artwork.
 */
export function heroCreature(
  dive: Dive,
  index: Map<string, Creature>,
  variant: 'gallery' | 'hero' = 'gallery',
): Creature | null {
  const hasArtwork = (creature: Creature | undefined): creature is Creature =>
    creature?.artwork?.status === 'curated' &&
    Boolean(creature.artwork[variant]);
  const chosen = dive.highlightCreatureId
    ? index.get(dive.highlightCreatureId)
    : undefined;
  if (hasArtwork(chosen)) return chosen;

  for (const sighting of dive.sightings) {
    const creature = index.get(sighting.creatureId);
    if (hasArtwork(creature)) return creature;
  }

  if (chosen) return chosen;
  for (const sighting of dive.sightings) {
    const creature = index.get(sighting.creatureId);
    if (creature) return creature;
  }
  return null;
}

function seedFrom(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1)
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash;
}

function Metric({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
      {icon}
      {children}
    </span>
  );
}

export function DiveHero({
  dive,
  creatureIndex,
  eyebrow,
  size = 'lg',
}: {
  dive: Dive;
  creatureIndex: Map<string, Creature>;
  eyebrow?: string;
  size?: 'lg' | 'sm';
}) {
  const creature = heroCreature(
    dive,
    creatureIndex,
    size === 'lg' ? 'hero' : 'gallery',
  );
  // Only finished artwork floats on the hero. A creature still waiting for its
  // painting is honoured elsewhere; here the motif and typography carry the
  // card, which is the whole point of not depending on imagery.
  const art = creature?.artwork?.status === 'curated' ? creature : null;
  const otherCreatures = dive.sightings
    .filter((sighting) => sighting.creatureId !== creature?.id)
    .map((sighting) => creatureIndex.get(sighting.creatureId))
    .filter((sighting): sighting is Creature => Boolean(sighting))
    .slice(0, 2);

  return (
    <div
      className={`tap-lift group relative overflow-hidden rounded-card bg-gradient-to-br from-marine to-abyss text-white shadow-lift ${
        size === 'lg' ? 'min-h-56 p-6' : 'h-64 p-5 min-[370px]:h-48'
      }`}
    >
      <AtlasMotif className="text-white" seed={seedFrom(dive.id)} />

      {art ? (
        <div
          className={`pointer-events-none absolute ${
            size === 'lg'
              ? '-right-3 -bottom-4 w-44'
              : 'right-4 bottom-4 w-24 min-[370px]:w-28'
          }`}
        >
          <CreatureImage
            creature={art}
            variant={size === 'lg' ? 'hero' : 'gallery'}
            priority={size === 'lg'}
            plate={false}
            className="opacity-95 transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-[1.025]"
          />
        </div>
      ) : null}

      <div
        className={`relative ${size === 'lg' ? (art ? 'pr-32' : '') : 'pr-24'}`}
      >
        {eyebrow ? (
          <span className="mb-3 inline-block rounded-full bg-coral px-3 py-1.5 text-[10px] font-black tracking-[0.16em] text-abyss uppercase">
            {eyebrow}
          </span>
        ) : null}
        <h2
          className={`leading-tight font-black ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}
        >
          {dive.siteName}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-white/80">
          <MapPin size={15} aria-hidden="true" />
          <span className="truncate">{dive.areaName}</span>
        </p>
        <p className="mt-0.5 text-sm font-medium text-white/65">
          {formatDate(dive.date)}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Metric icon={<ArrowDownToLine size={13} aria-hidden="true" />}>
            {formatDepth(dive.maxDepth)}
          </Metric>
          <Metric icon={<Clock size={13} aria-hidden="true" />}>
            {formatDuration(dive.durationMinutes)}
          </Metric>
          {dive.sightings.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 py-1.5 pr-2.5 pl-2 text-xs font-bold text-white backdrop-blur-sm">
              {otherCreatures.length > 0 ? (
                <span className="flex -space-x-1" aria-hidden="true">
                  {otherCreatures.map((other) => (
                    <CreatureImage
                      key={other.id}
                      creature={other}
                      variant="thumb"
                      className="h-5 w-5 shrink-0 ring-2 ring-abyss/70"
                    />
                  ))}
                </span>
              ) : null}
              <span className="whitespace-nowrap">
                {pluralize(dive.sightings.length, 'creature')}
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
