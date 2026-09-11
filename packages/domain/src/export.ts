import type { Creature, Place, PoseidonExportV1, Region } from './domain.js';
import type { PersistedPersonalStateV2 } from './persistence.js';
import { CURRENT_SCHEMA_VERSION } from './persistence.js';
import {
  compareCreatureName,
  compareDiveNewestFirst,
  deepClone,
  normalizeText,
} from './utils.js';

export function buildPoseidonExport(
  state: PersistedPersonalStateV2,
  creatureById: Map<string, Creature>,
  regions: Region[],
  places: Place[],
  exportedAt: string,
): PoseidonExportV1 {
  const userIds = new Set(state.userCreatures.map((creature) => creature.id));
  const referencedIds = new Set(
    state.dives.flatMap((dive) =>
      dive.sightings.map((sighting) => sighting.creatureId),
    ),
  );
  const creatures = [...referencedIds]
    .filter((id) => !userIds.has(id))
    .map((id) => creatureById.get(id))
    .filter((creature): creature is Creature => creature !== undefined)
    .map(deepClone)
    .sort(compareCreatureName);
  const regionIds = new Set<string>();
  for (const dive of state.dives)
    if (dive.regionId) regionIds.add(dive.regionId);
  for (const creature of creatures)
    for (const regionId of creature.regionIds ?? []) regionIds.add(regionId);
  const exportRegions = includeRegionAncestors(regions, regionIds);
  const placeNames = new Set(
    state.dives.flatMap((dive) => [
      normalizeText(dive.areaName),
      normalizeText(dive.siteName),
    ]),
  );
  const exportPlaces = places.filter(
    (place) =>
      (place.regionId && regionIds.has(place.regionId)) ||
      placeNames.has(normalizeText(place.name)),
  );
  return {
    format: 'poseidon-personal-export',
    exportVersion: 1,
    exportedAt,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    personal: {
      dives: deepClone(state.dives).sort(compareDiveNewestFirst),
      userCreatures: deepClone(state.userCreatures).sort(compareCreatureName),
    },
    catalogSnapshots: {
      creatures,
      regions: deepClone(exportRegions),
      places: deepClone(exportPlaces),
    },
  };
}

function includeRegionAncestors(
  regions: Region[],
  initialIds: Set<string>,
): Region[] {
  const byId = new Map(regions.map((region) => [region.id, region]));
  const ids = new Set(initialIds);
  const stack = [...initialIds];
  while (stack.length) {
    const region = byId.get(stack.pop()!);
    if (region?.parentRegionId && !ids.has(region.parentRegionId)) {
      ids.add(region.parentRegionId);
      stack.push(region.parentRegionId);
    }
  }
  return regions.filter((region) => ids.has(region.id));
}
