/**
 * Deterministic place suggestions.
 *
 * Ordering is "what I already dive" first, then curated local content, then the
 * rest of the pack. There is no recommendation engine here and there does not
 * need to be one: personal recency plus region tags is enough, and it behaves
 * identically offline.
 */
import type { Dive } from '@poseidon/domain';

import { curatedAreas, curatedSites, type CuratedSite } from '../data/content';

export function normalizePlaceName(value: string): string {
  return normalize(value);
}

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('en');
}

function matches(query: string, ...fields: Array<string | undefined>): boolean {
  const needle = normalize(query);
  if (!needle) return true;
  return fields.some((field) => field && normalize(field).includes(needle));
}

export interface AreaSuggestion {
  areaName: string;
  regionId: string | undefined;
  countryCode: string | undefined;
  fromHistory: boolean;
  diveCount: number;
}

export function suggestAreas(dives: Dive[], query = ''): AreaSuggestion[] {
  const byName = new Map<string, AreaSuggestion>();

  for (const dive of [...dives].sort((a, b) => b.date.localeCompare(a.date))) {
    const key = normalize(dive.areaName);
    const existing = byName.get(key);
    if (existing) {
      existing.diveCount += 1;
      continue;
    }
    byName.set(key, {
      areaName: dive.areaName,
      regionId: dive.regionId,
      countryCode: dive.countryCode,
      fromHistory: true,
      diveCount: 1,
    });
  }

  for (const area of curatedAreas) {
    const key = normalize(area.name);
    if (byName.has(key)) continue;
    byName.set(key, {
      areaName: area.name,
      regionId: area.regionId,
      countryCode: area.countryCode,
      fromHistory: false,
      diveCount: 0,
    });
  }

  return [...byName.values()]
    .filter((area) => matches(query, area.areaName))
    .sort(
      (a, b) =>
        Number(b.fromHistory) - Number(a.fromHistory) ||
        b.diveCount - a.diveCount,
    );
}

export interface SiteSuggestion {
  siteName: string;
  areaName: string;
  regionId: string | undefined;
  countryCode: string | undefined;
  fromHistory: boolean;
  lastDivedOn: string | null;
  diveCount: number;
}

function siteFromCurated(site: CuratedSite): SiteSuggestion {
  return {
    siteName: site.name,
    areaName: site.areaName,
    regionId: site.regionId,
    countryCode: site.countryCode,
    fromHistory: false,
    lastDivedOn: null,
    diveCount: 0,
  };
}

/**
 * Sites for the currently chosen area come first; anything the diver has
 * actually visited outranks curated content at the same location.
 */
export function suggestSites(
  dives: Dive[],
  areaName: string,
  query = '',
): SiteSuggestion[] {
  const area = normalize(areaName);
  const bySite = new Map<string, SiteSuggestion>();

  for (const dive of [...dives].sort((a, b) => b.date.localeCompare(a.date))) {
    const key = `${normalize(dive.areaName)} ${normalize(dive.siteName)}`;
    const existing = bySite.get(key);
    if (existing) {
      existing.diveCount += 1;
      continue;
    }
    bySite.set(key, {
      siteName: dive.siteName,
      areaName: dive.areaName,
      regionId: dive.regionId,
      countryCode: dive.countryCode,
      fromHistory: true,
      lastDivedOn: dive.date,
      diveCount: 1,
    });
  }

  for (const site of curatedSites) {
    const key = `${normalize(site.areaName)} ${normalize(site.name)}`;
    if (bySite.has(key)) continue;
    bySite.set(key, siteFromCurated(site));
  }

  const curatedAliases = new Map(
    curatedSites.map((site) => [normalize(site.name), site.aliases]),
  );

  return [...bySite.values()]
    .filter((site) =>
      matches(
        query,
        site.siteName,
        ...(curatedAliases.get(normalize(site.siteName)) ?? []),
      ),
    )
    .sort((a, b) => {
      const aLocal = area && normalize(a.areaName) === area ? 1 : 0;
      const bLocal = area && normalize(b.areaName) === area ? 1 : 0;
      if (aLocal !== bLocal) return bLocal - aLocal;
      if (a.fromHistory !== b.fromHistory)
        return Number(b.fromHistory) - Number(a.fromHistory);
      if (a.lastDivedOn && b.lastDivedOn && a.lastDivedOn !== b.lastDivedOn) {
        return b.lastDivedOn.localeCompare(a.lastDivedOn);
      }
      return a.siteName.localeCompare(b.siteName);
    });
}

/**
 * A second dive on the same day almost always shares the trip context, so the
 * flow offers to reuse it rather than making the diver retype it.
 */
export function sameDayContext(dives: Dive[], date: string): Dive | null {
  const sameDay = dives
    .filter((dive) => dive.date === date)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return sameDay[0] ?? null;
}

/** The most recent dive overall, used to pre-fill a fresh trip's first dive. */
export function mostRecentDive(dives: Dive[]): Dive | null {
  return (
    [...dives].sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    )[0] ?? null
  );
}
