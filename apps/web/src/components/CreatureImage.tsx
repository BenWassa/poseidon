/**
 * The single place the application touches creature artwork.
 *
 * It honours the asset contract from the pipeline in `tools/creature_assets`:
 * dense surfaces request `thumb`, galleries request `gallery`, only hero
 * surfaces request `hero`; geometry is reserved from the manifest aspect ratio
 * before anything loads, images outside the first screen are lazy; and a
 * missing, placeholder or failed asset falls back to `CreatureMark` so a broken
 * image can never reach the screen.
 */
import { useState } from 'react';

import type { Creature } from '@poseidon/domain';

import { CreatureMark } from './CreatureMark';

export type CreatureImageVariant = 'thumb' | 'gallery' | 'hero';

const MARK_SIZE: Record<CreatureImageVariant, 'sm' | 'md' | 'lg'> = {
  thumb: 'sm',
  gallery: 'md',
  hero: 'lg',
};

/** Intrinsic size of each generated variant; used to reserve exact geometry. */
const VARIANT_PIXELS: Record<CreatureImageVariant, number> = {
  thumb: 192,
  gallery: 512,
  hero: 1024,
};

export interface CreatureImageProps {
  creature: Creature;
  variant?: CreatureImageVariant;
  className?: string;
  /** Set on above-the-fold artwork so the hero does not wait for lazy loading. */
  priority?: boolean;
  /**
   * Creature art is transparent, so by default it sits on its own aquatic wash
   * — that plate is what gives the collection its colour. Surfaces that already
   * have a background of their own (the dive hero) turn it off so the artwork
   * floats. The wash still appears whenever the art is missing or fails.
   */
  plate?: boolean;
  /**
   * Square source artwork is always deliberately masked at the component
   * boundary. Dense thumbnails become circular tokens; larger artwork uses
   * the softer editorial tile shape.
   */
  shape?: 'tile' | 'circle';
}

export function CreatureImage({
  creature,
  variant = 'gallery',
  className = '',
  priority = false,
  plate = true,
  shape,
}: CreatureImageProps) {
  const [failed, setFailed] = useState(false);
  const artwork = creature.artwork;
  const source = artwork?.status === 'curated' ? artwork[variant] : undefined;
  const aspectRatio =
    artwork?.aspectRatio && artwork.aspectRatio > 0 ? artwork.aspectRatio : 1;
  const edge = VARIANT_PIXELS[variant];

  const showArtwork = Boolean(source) && !failed;
  const showMark = !showArtwork || plate;
  const resolvedShape = shape ?? (variant === 'thumb' ? 'circle' : 'tile');
  const mask = resolvedShape === 'circle' ? 'rounded-full' : 'rounded-tile';

  return (
    <div
      className={`relative overflow-hidden ${plate ? 'bg-aqua-soft' : ''} ${className} ${mask}`}
      style={{ aspectRatio: `${aspectRatio}` }}
      data-creature-image-shape={resolvedShape}
    >
      {/* Painted underneath, so a tile is never empty and never shifts. */}
      {showMark ? (
        <div className="absolute inset-0">
          <CreatureMark creature={creature} size={MARK_SIZE[variant]} />
        </div>
      ) : null}
      {showArtwork ? (
        <img
          src={source}
          alt=""
          width={edge}
          height={Math.round(edge / aspectRatio)}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-contain"
          data-testid="creature-artwork"
        />
      ) : null}
    </div>
  );
}
