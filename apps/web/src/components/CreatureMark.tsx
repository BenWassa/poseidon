/**
 * The deliberate treatment for a creature with no finished artwork.
 *
 * Missing art is a first-class state in Poseidon, never an error: a curated
 * species without a painting gets its category mark, and a creature the diver
 * typed themselves gets a typographic monogram. Both sit on the same aquatic
 * washes as the rest of the collection so an unillustrated encounter still
 * belongs on the shelf.
 */
import type { Creature } from '@poseidon/domain';

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

const CATEGORY_SILHOUETTE = {
  'reef-fish': 'fish',
  shark: 'shark',
  ray: 'ray',
  'sea-turtle': 'turtle',
  eel: 'eel',
  cephalopod: 'octopus',
  crustacean: 'crustacean',
  seahorse: 'seahorse',
} as const;

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
  return `${(words[0] as string)[0] ?? ''}${(words[1] as string)[0] ?? ''}`.toUpperCase();
}

export interface CreatureMarkProps {
  creature: Pick<Creature, 'id' | 'commonName' | 'category' | 'userCreated'>;
  /** Roughly the rendered edge in pixels; drives glyph scale, not layout. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CreatureMark({
  creature,
  size = 'md',
  className = '',
}: CreatureMarkProps) {
  const { from, to, foreground } = washFor(creature.id);
  const silhouette = creature.category
    ? (CATEGORY_SILHOUETTE[
        creature.category as keyof typeof CATEGORY_SILHOUETTE
      ] ?? 'fish')
    : 'fish';
  const glyphSize = size === 'sm' ? 30 : size === 'lg' ? 116 : 62;

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
          className={`creature-silhouette creature-silhouette--${silhouette} ${foreground}`}
          style={{ fontSize: glyphSize }}
        />
      )}
      <span className="creature-mark-swell pointer-events-none absolute inset-x-0 bottom-0 h-1/4" />
    </div>
  );
}
