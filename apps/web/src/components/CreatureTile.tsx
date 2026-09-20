import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import type { Creature } from '@poseidon/domain';

import { formatCategory } from '../lib/format';
import { CreatureImage, type CreatureImageVariant } from './CreatureImage';

interface TileBodyProps {
  creature: Creature;
  variant: CreatureImageVariant;
  selected: boolean;
  highlight: boolean;
  seen: boolean | undefined;
  caption?: string;
  showCategory: boolean;
  priority: boolean;
}

function TileBody({
  creature,
  variant,
  selected,
  highlight,
  seen,
  caption,
  showCategory,
  priority,
}: TileBodyProps) {
  return (
    <>
      <div className="relative">
        <CreatureImage
          creature={creature}
          variant={variant}
          priority={priority}
        />
        {selected ? (
          // Selection is carried by the ring, the badge and aria-pressed, so it
          // never depends on colour alone.
          <span className="animate-pop absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-coral text-abyss shadow-float">
            <Check size={18} strokeWidth={4} />
          </span>
        ) : null}
        {highlight ? (
          <span className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-sun text-abyss shadow-card">
            <Star size={16} strokeWidth={3} fill="currentColor" />
          </span>
        ) : null}
        {!selected && seen ? (
          // A quiet mark that this creature has been logged before — never a
          // gate on the artwork itself, just a fact about personal history.
          <span
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-marine text-white shadow-card"
            title="Seen"
          >
            <Check size={14} strokeWidth={3.5} />
          </span>
        ) : null}
      </div>
      <div className="px-2 pt-2.5 pb-1 text-left">
        {showCategory ? (
          <p className="mb-0.5 text-xs font-bold tracking-[0.08em] text-abyss/70 uppercase">
            {formatCategory(creature.category)}
          </p>
        ) : null}
        <p className="text-sm leading-tight font-bold text-abyss">
          {creature.commonName}
        </p>
        {caption ? (
          <p className="mt-0.5 text-xs font-medium text-abyss/70">{caption}</p>
        ) : null}
      </div>
    </>
  );
}

export interface CreatureTileProps {
  creature: Creature;
  variant?: CreatureImageVariant;
  selected?: boolean;
  highlight?: boolean;
  seen?: boolean;
  caption?: string;
  showCategory?: boolean;
  priority?: boolean;
  onClick?: () => void;
  to?: string;
  className?: string;
}

const SHELL = 'tap-lift group block rounded-card p-2';

export function CreatureTile({
  creature,
  variant = 'gallery',
  selected = false,
  highlight = false,
  seen,
  caption,
  showCategory = false,
  priority = false,
  onClick,
  to,
  className = '',
}: CreatureTileProps) {
  const skin = selected
    ? 'bg-surface ring-4 ring-coral shadow-float'
    : 'border border-border bg-surface shadow-card hover:border-marine/25 hover:shadow-lift';
  const body = (
    <TileBody
      creature={creature}
      variant={variant}
      selected={selected}
      highlight={highlight}
      seen={seen}
      {...(caption !== undefined ? { caption } : {})}
      showCategory={showCategory}
      priority={priority}
    />
  );

  if (to) {
    return (
      <Link to={to} className={`${SHELL} ${skin} ${className}`}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`${SHELL} w-full ${skin} ${className}`}
    >
      {body}
    </button>
  );
}
