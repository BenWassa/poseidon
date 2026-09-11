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
  caption?: string;
  showCategory: boolean;
  priority: boolean;
}

function TileBody({
  creature,
  variant,
  selected,
  highlight,
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
          className="rounded-tile"
        />
        {selected ? (
          // Selection is carried by the ring, the badge and aria-pressed, so it
          // never depends on colour alone.
          <span className="animate-pop absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-coral text-white shadow-float">
            <Check size={18} strokeWidth={4} />
          </span>
        ) : null}
        {highlight ? (
          <span className="absolute top-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-sand text-white shadow-card">
            <Star size={16} strokeWidth={3} fill="currentColor" />
          </span>
        ) : null}
      </div>
      <div className="px-2 pt-2.5 pb-1 text-left">
        {showCategory ? (
          <p className="mb-0.5 text-[10px] font-bold tracking-[0.12em] text-lagoon uppercase">
            {formatCategory(creature.category)}
          </p>
        ) : null}
        <p className="text-sm leading-tight font-bold text-ocean">
          {creature.commonName}
        </p>
        {caption ? (
          <p className="mt-0.5 text-xs font-medium text-ocean/55">{caption}</p>
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
  caption?: string;
  showCategory?: boolean;
  priority?: boolean;
  onClick?: () => void;
  to?: string;
  className?: string;
}

const SHELL = 'block rounded-card p-2 transition-transform active:scale-[0.97]';

export function CreatureTile({
  creature,
  variant = 'gallery',
  selected = false,
  highlight = false,
  caption,
  showCategory = false,
  priority = false,
  onClick,
  to,
  className = '',
}: CreatureTileProps) {
  const skin = selected
    ? 'bg-surface ring-4 ring-coral shadow-float'
    : 'border border-shallows bg-surface shadow-card';
  const body = (
    <TileBody
      creature={creature}
      variant={variant}
      selected={selected}
      highlight={highlight}
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
