import type { Dive } from '@poseidon/domain';

import type { CoordinatePrecision, CuratedSite } from '../data/content';
import { normalizePlaceName } from './suggestions';

export interface AtlasSiteMarker {
  id: string;
  name: string;
  areaName: string;
  lat: number;
  lng: number;
  precision: CoordinatePrecision;
  provenanceNote: string;
  diveCount: number;
  lastDivedOn: string | null;
}

export interface AtlasMapModel {
  sites: AtlasSiteMarker[];
  mappedHistoryDiveCount: number;
  unmappedHistoryDiveCount: number;
}

function siteKey(areaName: string, siteName: string): string {
  return `${normalizePlaceName(areaName)}\u0000${normalizePlaceName(siteName)}`;
}

/**
 * Build a deterministic map model without geocoding or fuzzy location guesses.
 * A history dive is associated with curated geodata only when its normalized
 * area and exact canonical/alias site name match a curated record.
 */
export function buildAtlasMapModel(dives: Dive[], sites: CuratedSite[]): AtlasMapModel {
  const byTerm = new Map<string, CuratedSite>();
  for (const site of sites) {
    for (const term of [site.name, ...site.aliases]) byTerm.set(siteKey(site.areaName, term), site);
  }

  const visits = new Map<string, { diveCount: number; lastDivedOn: string | null }>();
  let mappedHistoryDiveCount = 0;
  let unmappedHistoryDiveCount = 0;

  for (const dive of dives) {
    const site = byTerm.get(siteKey(dive.areaName, dive.siteName));
    if (!site?.coordinates) {
      unmappedHistoryDiveCount += 1;
      continue;
    }
    mappedHistoryDiveCount += 1;
    const current = visits.get(site.id) ?? { diveCount: 0, lastDivedOn: null };
    current.diveCount += 1;
    if (!current.lastDivedOn || dive.date > current.lastDivedOn) current.lastDivedOn = dive.date;
    visits.set(site.id, current);
  }

  const mappedSites = sites
    .filter((site): site is CuratedSite & { coordinates: NonNullable<CuratedSite['coordinates']> } => Boolean(site.coordinates))
    .map((site) => {
      const visit = visits.get(site.id) ?? { diveCount: 0, lastDivedOn: null };
      return {
        id: site.id,
        name: site.name,
        areaName: site.areaName,
        lat: site.coordinates.lat,
        lng: site.coordinates.lng,
        precision: site.coordinates.precision,
        provenanceNote: site.coordinates.note,
        diveCount: visit.diveCount,
        lastDivedOn: visit.lastDivedOn,
      };
    })
    .sort((a, b) => a.areaName.localeCompare(b.areaName) || a.name.localeCompare(b.name));

  return { sites: mappedSites, mappedHistoryDiveCount, unmappedHistoryDiveCount };
}
