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

/**
 * A derived travel episode. Dives remain canonical; a trip is rebuilt from
 * history every time it is requested and is never persisted independently.
 */
export interface DiveTrip {
  id: string;
  areaName: string;
  countryCode?: string;
  regionId?: string;
  firstDate: string;
  lastDate: string;
  dives: Dive[];
}

export type HistoryMilestoneKind =
  | 'first-dive'
  | 'dive-count'
  | 'new-country'
  | 'new-region'
  | 'creature-group';

/** A safe, factual history marker derived from canonical dives. */
export interface HistoryMilestone {
  id: string;
  kind: HistoryMilestoneKind;
  diveId: string;
  date: string;
  count?: 10 | 25 | 50;
  countryCode?: string;
  areaName?: string;
  category?: string;
}

/**
 * Seven calendar days is deliberately simple enough to explain: consecutive
 * dives in the same region/area belong to one trip while the gap is at most a
 * week. A location change always starts a new episode, even when dates overlap.
 */
export const TRIP_MAX_GAP_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;
const DIVE_COUNT_MILESTONES = new Set<number>([10, 25, 50]);
const MAJOR_CREATURE_GROUPS = ['sea-turtle', 'shark', 'ray', 'cephalopod'] as const;

type MajorCreatureGroup = (typeof MAJOR_CREATURE_GROUPS)[number];

function compareDiveOldestFirst(a: Dive, b: Dive): number {
  return compareDiveNewestFirst(b, a);
}

function calendarDay(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`) / DAY_MS;
}

function sameTripLocation(a: Dive, b: Dive): boolean {
  if (a.regionId && b.regionId) return a.regionId === b.regionId;

  const aCountry = a.countryCode?.toUpperCase() ?? '';
  const bCountry = b.countryCode?.toUpperCase() ?? '';
  return aCountry === bCountry && normalizeText(a.areaName) === normalizeText(b.areaName);
}

function canContinueTrip(previous: Dive, next: Dive): boolean {
  if (!sameTripLocation(previous, next)) return false;
  const gapDays = calendarDay(next.date) - calendarDay(previous.date);
  return Number.isFinite(gapDays) && gapDays >= 0 && gapDays <= TRIP_MAX_GAP_DAYS;
}

/**
 * Groups chronological, contiguous dives into travel episodes, then returns
 * the episodes newest-first for Journal rendering. Exact region IDs win when
 * both dives have them; otherwise the normalized area/country pair is used.
 */
export function groupDivesIntoTrips(dives: Dive[]): DiveTrip[] {
  const chronological = [...dives].sort(compareDiveOldestFirst);
  const trips: DiveTrip[] = [];

  for (const dive of chronological) {
    const current = trips.at(-1);
    const previous = current?.dives.at(-1);
    if (!current || !previous || !canContinueTrip(previous, dive)) {
      trips.push({
        id: `trip:${dive.id}`,
        areaName: dive.areaName,
        ...(dive.countryCode ? { countryCode: dive.countryCode.toUpperCase() } : {}),
        ...(dive.regionId ? { regionId: dive.regionId } : {}),
        firstDate: dive.date,
        lastDate: dive.date,
        dives: [dive],
      });
      continue;
    }

    current.lastDate = dive.date;
    current.dives.push(dive);
  }

  return trips
    .map((trip) => ({ ...trip, dives: [...trip.dives].sort(compareDiveNewestFirst) }))
    .sort(
      (a, b) =>
        b.lastDate.localeCompare(a.lastDate) ||
        b.firstDate.localeCompare(a.firstDate) ||
        b.id.localeCompare(a.id),
    );
}

function regionMilestoneKey(dive: Dive): string {
  if (dive.regionId) return `region:${dive.regionId}`;
  return `area:${dive.countryCode?.toUpperCase() ?? '--'}:${normalizeText(dive.areaName)}`;
}

function majorGroupsOnDive(dive: Dive, creatureById: Map<string, Creature>): MajorCreatureGroup[] {
  const present = new Set(
    dive.sightings
      .map((sighting) => creatureById.get(sighting.creatureId)?.category)
      .filter((category): category is string => Boolean(category)),
  );
  return MAJOR_CREATURE_GROUPS.filter((category) => present.has(category));
}

/**
 * Builds a small set of safe history markers. Nothing here rewards depth,
 * duration, decompression exposure, streaks or wildlife interaction. The set is
 * intentionally finite: first journalled dive, 10/25/50 dives, first later
 * country/region, and first encounter with four broad creature groups.
 */
export function deriveHistoryMilestones(
  dives: Dive[],
  creatureById: Map<string, Creature>,
): HistoryMilestone[] {
  const chronological = [...dives].sort(compareDiveOldestFirst);
  const milestones: HistoryMilestone[] = [];
  const seenCountries = new Set<string>();
  const seenRegions = new Set<string>();
  const seenCreatureGroups = new Set<MajorCreatureGroup>();

  chronological.forEach((dive, index) => {
    const ordinal = index + 1;

    if (ordinal === 1) {
      milestones.push({
        id: `first-dive:${dive.id}`,
        kind: 'first-dive',
        diveId: dive.id,
        date: dive.date,
      });
    }

    if (DIVE_COUNT_MILESTONES.has(ordinal)) {
      const count = ordinal as 10 | 25 | 50;
      milestones.push({
        id: `dive-count:${count}:${dive.id}`,
        kind: 'dive-count',
        diveId: dive.id,
        date: dive.date,
        count,
      });
    }

    const countryCode = dive.countryCode?.toUpperCase();
    const regionKey = regionMilestoneKey(dive);
    const newCountry = Boolean(countryCode && !seenCountries.has(countryCode));
    const newRegion = !seenRegions.has(regionKey);

    // The first dive already has a history marker. Later location changes get
    // at most one marker: country takes precedence over its first child region.
    if (index > 0) {
      if (newCountry && countryCode) {
        milestones.push({
          id: `new-country:${countryCode}:${dive.id}`,
          kind: 'new-country',
          diveId: dive.id,
          date: dive.date,
          countryCode,
          areaName: dive.areaName,
        });
      } else if (newRegion) {
        milestones.push({
          id: `new-region:${regionKey}:${dive.id}`,
          kind: 'new-region',
          diveId: dive.id,
          date: dive.date,
          areaName: dive.areaName,
        });
      }
    }

    if (countryCode) seenCountries.add(countryCode);
    seenRegions.add(regionKey);

    for (const category of majorGroupsOnDive(dive, creatureById)) {
      if (seenCreatureGroups.has(category)) continue;
      seenCreatureGroups.add(category);
      milestones.push({
        id: `creature-group:${category}:${dive.id}`,
        kind: 'creature-group',
        diveId: dive.id,
        date: dive.date,
        category,
      });
    }
  });

  return milestones;
}

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
