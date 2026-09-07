/**
 * Screen-facing reads. Every one of these goes through the `PoseidonStore`
 * boundary and reloads automatically after a mutation commits.
 */
import { useMemo } from 'react';

import type { Creature, Id } from '@poseidon/domain';

import { useStoreQuery } from './provider';

export function useDives() {
  return useStoreQuery('dives', (store) => store.listDives());
}

export function useDive(id: Id | undefined) {
  return useStoreQuery(`dive:${id ?? ''}`, (store) => (id ? store.getDive(id) : Promise.resolve(null)));
}

export function useCreatures() {
  return useStoreQuery('creatures', (store) => store.listCreatures());
}

/** Creature lookup for resolving the IDs stored on a dive's sightings. */
export function useCreatureIndex(): { index: Map<Id, Creature>; loading: boolean } {
  const { data, loading } = useCreatures();
  const index = useMemo(() => new Map((data ?? []).map((creature) => [creature.id, creature])), [data]);
  return { index, loading };
}

export function useLifetimeStats() {
  return useStoreQuery('stats', (store) => store.getLifetimeStats());
}

export function useCollection() {
  return useStoreQuery('collection', (store) => store.listCreatureCollection());
}

export function useRecentDiscoveries(limit = 8) {
  return useStoreQuery(`discoveries:${limit}`, (store) => store.listRecentDiscoveries(limit));
}

export function usePlaceSummaries() {
  return useStoreQuery('places', (store) => store.listPlaceSummaries());
}

export function useCreatureHistory(creatureId: Id | undefined) {
  return useStoreQuery(`creature-history:${creatureId ?? ''}`, (store) =>
    creatureId ? store.getCreatureHistory(creatureId) : Promise.resolve(null),
  );
}
