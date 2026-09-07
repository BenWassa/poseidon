/**
 * The deliberate treatment for a creature with no finished artwork.
 *
 * Missing art is a first-class state in Poseidon, never an error: a curated
 * species without a painting gets its category mark, and a creature the diver
 * typed themselves gets a typographic monogram. Both sit on the same aquatic
 * washes as the rest of the collection so an unillustrated encounter still
 * belongs on the shelf.
 */
import { Fish, FishSymbol, Shell, Shrimp, Snail, Turtle, Waves } from 'lucide-react';
import type { Creature } from '@poseidon/domain';

const WASHES: Array<[string, string]> = [
  ['#7FD8E8', '#118AB2'],
  ['#9FE3C8', '#17C3B2'],
  ['#A8D8F0', '#3B7EA1'],
  ['#BFE7E2', '#0E7C8A'],
  ['#C7DCF2', '#4A6FA5'],
  ['#9BD4D8', '#2E8FA8'],
];

const CATEGORY_ICON = {
  'reef-fish': Fish,
  shark: FishSymbol,
  ray: Waves,
  'sea-turtle': Turtle,
  eel: Snail,
  cephalopod: Shell,
  crustacean: Shrimp,
  seahorse: Snail,
} as const;

/** Stable per-creature wash so the same species always looks the same. */
function washFor(id: string): [string, string] {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  return WASHES[hash % WASHES.length] as [string, string];
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

export function CreatureMark({ creature, size = 'md', className = '' }: CreatureMarkProps) {
  const [from, to] = washFor(creature.id);
  const Icon = creature.category
    ? (CATEGORY_ICON[creature.category as keyof typeof CATEGORY_ICON] ?? Fish)
    : Fish;
  const glyphSize = size === 'sm' ? 22 : size === 'lg' ? 92 : 44;

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
      data-testid="creature-mark"
      aria-hidden="true"
    >
      {creature.userCreated ? (
        <span
          className="font-black tracking-tight text-white/90"
          style={{ fontSize: glyphSize, lineHeight: 1 }}
        >
          {monogram(creature.commonName)}
        </span>
      ) : (
        <Icon size={glyphSize} strokeWidth={1.6} className="text-white/85" />
      )}
      {/* A shared swell across every fallback keeps the set coherent. */}
      <svg
        viewBox="0 0 100 24"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 w-full text-white/25"
      >
        <path d="M0 16 C 18 4, 34 4, 50 12 C 66 20, 82 20, 100 10 L 100 24 L 0 24 Z" fill="currentColor" />
      </svg>
    </div>
  );
}
