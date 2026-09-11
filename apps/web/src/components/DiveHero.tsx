/**
 * A dive rendered as a memory rather than a row.
 *
 * The prototype leaned on stock underwater photography for this surface.
 * Poseidon has no photos, so the hero is built from deep ocean colour, the
 * bathymetric atlas motif, place typography and — when the dive has one — the
 * highlight creature's own artwork.
 */
import { Clock, Gauge, MapPin } from 'lucide-react';

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
 * The creature that best represents a dive: the diver's own choice first, and
 * only then a fallback so the card is never blank. Poseidon never overrules a
 * chosen highlight.
 */
export function heroCreature(
  dive: Dive,
  index: Map<string, Creature>,
): Creature | null {
  if (dive.highlightCreatureId) {
    const chosen = index.get(dive.highlightCreatureId);
    if (chosen) return chosen;
  }
  for (const sighting of dive.sightings) {
    const creature = index.get(sighting.creatureId);
    if (creature?.artwork?.status === 'curated') return creature;
  }
  const first = dive.sightings[0];
  return first ? (index.get(first.creatureId) ?? null) : null;
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
  const creature = heroCreature(dive, creatureIndex);
  // Only finished artwork floats on the hero. A creature still waiting for its
  // painting is honoured elsewhere; here the motif and typography carry the
  // card, which is the whole point of not depending on imagery.
  const art = creature?.artwork?.status === 'curated' ? creature : null;

  return (
    <div
      className={`relative overflow-hidden rounded-card bg-gradient-to-br from-marine via-ocean to-abyss text-white shadow-lift ${
        size === 'lg' ? 'min-h-56 p-6' : 'min-h-40 p-5'
      }`}
    >
      <AtlasMotif className="text-white" seed={seedFrom(dive.id)} />

      {art ? (
        <div
          className={`pointer-events-none absolute ${
            size === 'lg'
              ? '-right-3 -bottom-4 w-44'
              : '-right-2 -bottom-3 w-28'
          }`}
        >
          <CreatureImage
            creature={art}
            variant={size === 'lg' ? 'hero' : 'gallery'}
            priority={size === 'lg'}
            plate={false}
            className="opacity-95"
          />
        </div>
      ) : null}

      <div
        className={`relative ${art ? (size === 'lg' ? 'pr-32' : 'pr-24') : ''}`}
      >
        {eyebrow ? (
          <span className="mb-3 inline-block rounded-full bg-coral px-3 py-1.5 text-[10px] font-black tracking-[0.16em] text-white uppercase">
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
          <Metric icon={<Gauge size={13} aria-hidden="true" />}>
            {formatDepth(dive.maxDepth)}
          </Metric>
          <Metric icon={<Clock size={13} aria-hidden="true" />}>
            {formatDuration(dive.durationMinutes)}
          </Metric>
          {dive.sightings.length > 0 ? (
            <Metric icon={null}>
              {pluralize(dive.sightings.length, 'creature')}
            </Metric>
          ) : null}
        </div>
      </div>
    </div>
  );
}
