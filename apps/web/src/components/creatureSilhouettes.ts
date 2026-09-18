import type { Creature } from '@poseidon/domain';

export const SILHOUETTE_KINDS = [
  'fish-general',
  'shark',
  'sea-turtle',
  'ray',
  'eel',
  'octopus',
  'squid',
  'crustacean',
  'seahorse',
  'sea-star',
  'sea-urchin',
  'conch',
  'long-fish',
] as const;

export type SilhouetteKind = (typeof SILHOUETTE_KINDS)[number];

const CATEGORY_SILHOUETTE: Record<string, SilhouetteKind> = {
  'reef-fish': 'fish-general',
  shark: 'shark',
  ray: 'ray',
  'sea-turtle': 'sea-turtle',
  eel: 'eel',
  cephalopod: 'octopus',
  crustacean: 'crustacean',
  seahorse: 'seahorse',
  echinoderm: 'sea-urchin',
  mollusk: 'conch',
};

/**
 * The content taxonomy is intentionally broad. Narrow overrides are used only
 * where a generated silhouette is materially more truthful than the category
 * default; they never imply species-level identification.
 */
const CREATURE_SILHOUETTE_OVERRIDE: Record<string, SilhouetteKind> = {
  'caribbean-cushion-sea-star': 'sea-star',
  'caribbean-reef-squid': 'squid',
  'great-barracuda': 'long-fish',
  trumpetfish: 'long-fish',
};

const SILHOUETTE_ROOT = 'assets/fallbacks/marine-life';

export function silhouetteForCreature(
  creature: Pick<Creature, 'id' | 'category'>,
): SilhouetteKind {
  return (
    CREATURE_SILHOUETTE_OVERRIDE[creature.id] ??
    (creature.category ? CATEGORY_SILHOUETTE[creature.category] : undefined) ??
    'fish-general'
  );
}

export function silhouetteUrl(kind: SilhouetteKind): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base}${SILHOUETTE_ROOT}/${kind}.webp`;
}
