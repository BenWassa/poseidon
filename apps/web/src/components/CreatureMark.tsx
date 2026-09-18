/**
 * The deliberate treatment for a creature with no finished artwork.
 *
 * Missing art is a first-class state in Poseidon, never an error: a curated
 * species without usable runtime art gets a neutral generated raster
 * silhouette, and a creature the diver typed themselves gets a typographic
 * monogram. Neither fallback is species artwork or part of the curated art
 * inventory.
 */
import type { Creature } from '@poseidon/domain';

import { silhouetteForCreature, silhouetteUrl } from './creatureSilhouettes';

type Wash = { from: string; to: string; foreground: string };

const WASHES: Wash[] = [
  {
    from: 'var(--color-aqua-soft)',
    to: 'var(--color-lagoon)',
    foreground: 'text-abyss/85',
  },
  {
    from: 'var(--color-lagoon)',
    to: 'var(--color-aqua-soft)',
    foreground: 'text-abyss/85',
  },
  {
    from: 'var(--color-marine)',
    to: 'var(--color-abyss)',
    foreground: 'text-white/90',
  },
  {
    from: 'var(--color-abyss)',
    to: 'var(--color-marine)',
    foreground: 'text-white/90',
  },
];

/** Stable per-creature wash so the same species always looks the same. */
function washFor(id: string): Wash {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1)
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  return WASHES[hash % WASHES.length] as Wash;
}

function monogram(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return (words[0] as string).slice(0, 2).toUpperCase();
  return `${(words[0] as string)[0] ?? ''}${
    (words[1] as string)[0] ?? ''
  }`.toUpperCase();
}

export interface CreatureMarkProps {
  creature: Pick<Creature, 'id' | 'commonName' | 'category' | 'userCreated'>;
  /** Roughly the rendered edge in pixels; drives mark scale, not layout. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CreatureMark({
  creature,
  size = 'md',
  className = '',
}: CreatureMarkProps) {
  const { from, to, foreground } = washFor(creature.id);
  const silhouette = silhouetteForCreature(creature);
  const url = silhouetteUrl(silhouette);
  const glyphSize = size === 'sm' ? 34 : size === 'lg' ? 148 : 78;

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
      data-testid="creature-mark"
      aria-hidden="true"
    >
      {creature.userCreated ? (
        <span
          className={`font-black tracking-tight ${foreground}`}
          style={{ fontSize: glyphSize, lineHeight: 1 }}
        >
          {monogram(creature.commonName)}
        </span>
      ) : (
        <span
          className={`pointer-events-none block ${foreground}`}
          style={{
            width: glyphSize,
            height: glyphSize,
            backgroundColor: 'currentColor',
            WebkitMaskImage: `url("${url}")`,
            maskImage: `url("${url}")`,
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
          }}
          data-testid="creature-silhouette"
          data-silhouette-kind={silhouette}
          data-silhouette-src={url}
        />
      )}
      <span className="creature-mark-swell pointer-events-none absolute inset-x-0 bottom-0 h-1/4" />
    </div>
  );
}
