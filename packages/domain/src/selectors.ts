import type {
  Creature,
  CreatureHistory,
  CreatureSuggestionContext,
  Dive,
  LifetimeStats,
  PlaceSummary,
  RecentDiscovery,
  Region,
} from './domain.js';
import { compareCreatureName, compareDiveNewestFirst, normalizeText, uniqueStable } from './utils.js';

export function getLifetimeStats(dives: Dive[]): LifetimeStats {
  const siteKeys = new Set<string>();
  const creatureIds = new Set<string>();
  const countries = new Set<string>();
  let totalBottomTimeMinutes = 0;

  for (const dive of dives) {
    totalBottomTimeMinutes += dive.durationMinutes;
    siteKeys.add(`${normalizeText(dive.areaName)}\u0000${normalizeText(dive.siteName)}`);
    for (const sighting of dive.sightings) creatureIds.add(sighting.creatureId);
    if (dive.countryCode) countries.add(dive.countryCode.toUpperCase());
  }

  return {
    totalDives: dives.length,
    totalBottomTimeMinutes,
    distinctSites: siteKeys.size,
    distinctCreatures: creatureIds.size,
    distinctCountries: countries.size,
  };
}

function unresolvedCreature(id: string): Creature {
  return {
    id,
    commonName: `Unresolved creature (${id})`,
    curated: false,
    artwork: { status: 'missing' },
  };
}

export function buildCreatureCollection(dives: Dive[], creatureById: Map<string, Creature>): CreatureHistory[] {
  const aggregate = new Map<
    string,
    {
      firstSeenDate: string;
      mostRecentSeenDate: string;
      diveIds: string[];
      sites: string[];
      areas: string[];
    }
  >();

  const chronological = [...dives].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
  );

  for (const dive of chronological) {
    const seenOnDive = new Set<string>();
    for (const sighting of dive.sightings) {
      if (seenOnDive.has(sighting.creatureId)) continue;
      seenOnDive.add(sighting.creatureId);
      const current = aggregate.get(sighting.creatureId);
      if (!current) {
        aggregate.set(sighting.creatureId, {
          firstSeenDate: dive.date,
          mostRecentSeenDate: dive.date,
          diveIds: [dive.id],
          sites: [dive.siteName],
          areas: [dive.areaName],
        });
      } else {
        current.mostRecentSeenDate = dive.date;
        current.diveIds.push(dive.id);
        current.sites.push(dive.siteName);
        current.areas.push(dive.areaName);
      }
    }
  }

  return [...aggregate.entries()]
    .map(([creatureId, value]) => ({
      creature: creatureById.get(creatureId) ?? unresolvedCreature(creatureId),
      firstSeenDate: value.firstSeenDate,
      mostRecentSeenDate: value.mostRecentSeenDate,
      diveCount: value.diveIds.length,
      sites: uniqueStable(value.sites),
      areas: uniqueStable(value.areas),
      relatedDiveIds: [...value.diveIds],
    }))
    .sort(
      (a, b) =>
        b.mostRecentSeenDate.localeCompare(a.mostRecentSeenDate) ||
        a.creature.commonName.localeCompare(b.creature.commonName, undefined, { sensitivity: 'base' }),
    );
}

export function listRecentDiscoveries(
  dives: Dive[],
  creatureById: Map<string, Creature>,
  limit: number,
): RecentDiscovery[] {
  const oldestFirst = [...dives].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
  );
  const first = new Map<string, RecentDiscovery>();

  for (const dive of oldestFirst) {
    for (const sighting of dive.sightings) {
      if (!first.has(sighting.creatureId)) {
        first.set(sighting.creatureId, {
          creature: creatureById.get(sighting.creatureId) ?? unresolvedCreature(sighting.creatureId),
          firstSeenDate: dive.date,
          diveId: dive.id,
          siteName: dive.siteName,
          areaName: dive.areaName,
        });
      }
    }
  }

  return [...first.values()]
    .sort(
      (a, b) =>
        b.firstSeenDate.localeCompare(a.firstSeenDate) ||
        b.diveId.localeCompare(a.diveId) ||
        a.creature.commonName.localeCompare(b.creature.commonName, undefined, { sensitivity: 'base' }),
    )
    .slice(0, limit);
}

export function listPlaceSummaries(dives: Dive[]): PlaceSummary[] {
  const aggregates = new Map<
    string,
    {
      label: string;
      countryCode?: string;
      diveCount: number;
      creatures: Set<string>;
      sites: Set<string>;
      latestDate: string;
    }
  >();

  for (const dive of dives) {
    const country = dive.countryCode?.toUpperCase();
    const key = `area:${country ?? '--'}:${normalizeText(dive.areaName)}`;
    let current = aggregates.get(key);
    if (!current) {
      current = {
        label: dive.areaName,
        ...(country ? { countryCode: country } : {}),
        diveCount: 0,
        creatures: new Set<string>(),
        sites: new Set<string>(),
        latestDate: dive.date,
      };
      aggregates.set(key, current);
    }
    current.diveCount += 1;
    if (dive.date > current.latestDate) current.latestDate = dive.date;
    current.sites.add(normalizeText(dive.siteName));
    for (const sighting of dive.sightings) current.creatures.add(sighting.creatureId);
  }

  return [...aggregates.entries()]
    .map(([key, value]) => ({
      key,
      label: value.label,
      ...(value.countryCode ? { countryCode: value.countryCode } : {}),
      diveCount: value.diveCount,
      creatureCount: value.creatures.size,
      siteCount: value.sites.size,
      latestDate: value.latestDate,
    }))
    .sort((a, b) => b.latestDate.localeCompare(a.latestDate) || a.label.localeCompare(b.label))
    .map(({ latestDate: _latestDate, ...summary }) => summary);
}

export function rankSuggestedCreatures(
  creatures: Creature[],
  dives: Dive[],
  regions: Region[],
  context: CreatureSuggestionContext,
): Creature[] {
  const contextRegionIds = resolveContextRegionIds(regions, context);

  const familiarity = new Map<string, { mostRecentDate: string; diveCount: number }>();
  for (const dive of [...dives].sort(compareDiveNewestFirst)) {
    const seenOnDive = new Set<string>();
    for (const sighting of dive.sightings) {
      if (seenOnDive.has(sighting.creatureId)) continue;
      seenOnDive.add(sighting.creatureId);
      const current = familiarity.get(sighting.creatureId);
      if (!current) {
        familiarity.set(sighting.creatureId, { mostRecentDate: dive.date, diveCount: 1 });
      } else {
        current.diveCount += 1;
      }
    }
  }

  const isLocal = (creature: Creature): boolean =>
    (creature.regionIds ?? []).some((regionId) => contextRegionIds.has(regionId));

  return [...creatures].sort((a, b) => {
    const aLocal = isLocal(a) ? 1 : 0;
    const bLocal = isLocal(b) ? 1 : 0;
    if (aLocal !== bLocal) return bLocal - aLocal;

    const aSeen = familiarity.get(a.id);
    const bSeen = familiarity.get(b.id);
    if (Boolean(aSeen) !== Boolean(bSeen)) return bSeen ? 1 : -1;
    if (aSeen && bSeen) {
      const recent = bSeen.mostRecentDate.localeCompare(aSeen.mostRecentDate);
      if (recent !== 0) return recent;
      if (aSeen.diveCount !== bSeen.diveCount) return bSeen.diveCount - aSeen.diveCount;
    }

    return compareCreatureName(a, b);
  });
}

function resolveContextRegionIds(regions: Region[], context: CreatureSuggestionContext): Set<string> {
  const byId = new Map(regions.map((region) => [region.id, region]));
  const children = new Map<string, string[]>();
  for (const region of regions) {
    if (!region.parentRegionId) continue;
    const entries = children.get(region.parentRegionId) ?? [];
    entries.push(region.id);
    children.set(region.parentRegionId, entries);
  }

  const seeds = new Set<string>();
  if (context.regionId) {
    seeds.add(context.regionId);
  } else {
    const normalizedArea = context.areaName ? normalizeText(context.areaName) : null;
    if (normalizedArea) {
      for (const region of regions) {
        if (normalizeText(region.name) === normalizedArea) seeds.add(region.id);
      }
    }
    if (seeds.size === 0 && context.countryCode) {
      const country = context.countryCode.toUpperCase();
      for (const region of regions) {
        if (region.countryCode?.toUpperCase() === country) seeds.add(region.id);
      }
    }
  }

  const resolved = new Set(seeds);

  // A broad seed (for example Mexican Caribbean) includes its descendants.
  const descendantStack = [...seeds];
  while (descendantStack.length > 0) {
    const id = descendantStack.pop()!;
    for (const child of children.get(id) ?? []) {
      if (!resolved.has(child)) {
        resolved.add(child);
        descendantStack.push(child);
      }
    }
  }

  // A specific seed also inherits parent tags, but parent inclusion must not
  // make sibling regions local (Cozumel must not imply Playa del Carmen).
  for (const seed of seeds) {
    let parent = byId.get(seed)?.parentRegionId;
    while (parent) {
      resolved.add(parent);
      parent = byId.get(parent)?.parentRegionId;
    }
  }

  return resolved;
}
