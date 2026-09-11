/**
 * Loads the repository's marine content pack and creature asset manifests into
 * the `PoseidonContent` shape the domain store consumes.
 *
 * Adding a creature, a site or a region is a content operation: drop it in
 * `content/`, run the asset pipeline if there is artwork, and it appears here
 * with no application change.
 */
import type {
  Creature,
  CreatureArtwork,
  Place,
  PoseidonContent,
  ProvenanceEntry,
  Region,
} from '@poseidon/domain';

import manifestJson from '../../../../content/mexican-caribbean/manifest.json';
import sitesJson from '../../../../content/mexican-caribbean/sites.json';

interface PackRegion {
  id: string;
  name: string;
  countryCode?: string;
  parentRegionId?: string;
}

export type CoordinatePrecision =
  'exact-site' | 'approximate-site' | 'reef-area';

export interface CuratedCoordinates {
  lat: number;
  lng: number;
  precision: CoordinatePrecision;
  sourceIds: string[];
  note: string;
}

interface PackSite {
  id: string;
  name: string;
  aliases: string[];
  regionId: string;
  recordType: 'site' | 'area';
  coordinates?: CuratedCoordinates;
}

interface PackCreature {
  id: string;
  commonName: string;
  aliases: string[];
  scientificName?: string;
  category?: string;
  regionIds: string[];
  sourceIds?: string[];
}

interface PackSource {
  id: string;
  title: string;
  publisher: string;
  url?: string;
  accessedOn: string;
}

interface AssetManifest {
  creatureId: string;
  artwork: {
    status: 'curated' | 'placeholder' | 'missing';
    aspectRatio: number;
    thumb: string | null;
    gallery: string | null;
    hero: string | null;
  };
}

const creatureFiles = import.meta.glob<{ creatures: PackCreature[] }>(
  '../../../../content/mexican-caribbean/creatures/*.json',
  { eager: true, import: 'default' },
);

const assetManifests = import.meta.glob<AssetManifest>(
  '../../../../assets/creatures/*/manifest.json',
  {
    eager: true,
    import: 'default',
  },
);

const base = import.meta.env.BASE_URL ?? '/';

function assetUrl(creatureId: string, file: string): string {
  return `${base.replace(/\/$/, '')}/assets/creatures/${creatureId}/${file}`;
}

function buildArtworkIndex(): Map<string, CreatureArtwork> {
  const index = new Map<string, CreatureArtwork>();
  for (const manifest of Object.values(assetManifests)) {
    const { creatureId, artwork } = manifest;
    if (
      artwork.status !== 'curated' ||
      !artwork.thumb ||
      !artwork.gallery ||
      !artwork.hero
    ) {
      // A placeholder/missing manifest is a deliberate state, not an error. The
      // UI renders the same considered fallback it uses for unmanifested IDs.
      index.set(creatureId, {
        status: artwork.status,
        aspectRatio: artwork.aspectRatio,
      });
      continue;
    }
    index.set(creatureId, {
      status: 'curated',
      aspectRatio: artwork.aspectRatio,
      thumb: assetUrl(creatureId, artwork.thumb),
      gallery: assetUrl(creatureId, artwork.gallery),
      hero: assetUrl(creatureId, artwork.hero),
    });
  }
  return index;
}

const artworkById = buildArtworkIndex();
const packSources = (manifestJson.sources as PackSource[]) ?? [];
const sourceById = new Map(packSources.map((source) => [source.id, source]));

function buildProvenance(sourceIds: string[] | undefined): ProvenanceEntry[] {
  return (sourceIds ?? []).flatMap((sourceId) => {
    const source = sourceById.get(sourceId);
    if (!source) return [];
    return [
      {
        source: source.title,
        ...(source.url ? { url: source.url } : {}),
        note: `${source.publisher} · accessed ${source.accessedOn}`,
      },
    ];
  });
}

const packRegions = (manifestJson.regions as PackRegion[]) ?? [];

export const regions: Region[] = packRegions.map((region) => ({
  id: region.id,
  name: region.name,
  ...(region.countryCode ? { countryCode: region.countryCode } : {}),
  ...(region.parentRegionId ? { parentRegionId: region.parentRegionId } : {}),
}));

const regionById = new Map(regions.map((region) => [region.id, region]));

export const creatures: Creature[] = Object.keys(creatureFiles)
  .sort()
  .flatMap((key) => creatureFiles[key]?.creatures ?? [])
  .map((entry) => {
    const provenance = buildProvenance(entry.sourceIds);
    return {
      id: entry.id,
      commonName: entry.commonName,
      ...(entry.aliases.length > 0 ? { aliases: entry.aliases } : {}),
      ...(entry.scientificName ? { scientificName: entry.scientificName } : {}),
      ...(entry.category ? { category: entry.category } : {}),
      ...(entry.regionIds.length > 0 ? { regionIds: entry.regionIds } : {}),
      curated: true,
      artwork: artworkById.get(entry.id) ?? {
        status: 'missing',
        aspectRatio: 1,
      },
      ...(provenance.length > 0 ? { provenance } : {}),
    };
  });

const packSites = (sitesJson.sites as PackSite[]) ?? [];

export const places: Place[] = packSites.map((site) => {
  const region = regionById.get(site.regionId);
  return {
    id: site.id,
    name: site.name,
    kind: site.recordType,
    ...(region?.countryCode ? { countryCode: region.countryCode } : {}),
    regionId: site.regionId,
    ...(site.coordinates
      ? {
          coordinates: { lat: site.coordinates.lat, lng: site.coordinates.lng },
        }
      : {}),
    curated: true,
  };
});

/** Curated dive sites keyed for the Log Dive site suggestions and Atlas map. */
export interface CuratedSite {
  id: string;
  name: string;
  aliases: string[];
  regionId: string;
  areaName: string;
  countryCode: string | undefined;
  coordinates: CuratedCoordinates | undefined;
}

export const curatedSites: CuratedSite[] = packSites.map((site) => ({
  id: site.id,
  name: site.name,
  aliases: site.aliases,
  regionId: site.regionId,
  areaName: regionById.get(site.regionId)?.name ?? '',
  countryCode: regionById.get(site.regionId)?.countryCode,
  coordinates: site.coordinates,
}));

/** Curated areas a diver can pick as `areaName` — the leaf regions of the pack. */
export const curatedAreas = regions
  .filter((region) => region.parentRegionId !== undefined)
  .map((region) => ({
    regionId: region.id,
    name: region.name,
    countryCode: region.countryCode,
    parentName: region.parentRegionId
      ? (regionById.get(region.parentRegionId)?.name ?? null)
      : null,
  }));

export const contentPack: PoseidonContent = { creatures, regions, places };

export const contentMeta = {
  packId: manifestJson.packId,
  name: manifestJson.name,
  lastReviewed: manifestJson.lastReviewed,
  creatureCount: creatures.length,
  curatedArtworkCount: creatures.filter(
    (creature) => creature.artwork?.status === 'curated',
  ).length,
  siteCount: packSites.length,
  geolocatedSiteCount: packSites.filter(
    (site) => site.coordinates !== undefined,
  ).length,
  sourceCount: packSources.length,
};
