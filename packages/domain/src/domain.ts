export type Id = string;

export type DepthUnit = 'm' | 'ft';
export type SightingQuantity = 'one' | 'few' | 'several' | 'many';
export type ArtworkStatus = 'curated' | 'placeholder' | 'missing';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Depth {
  value: number;
  unit: DepthUnit;
}

export interface Sighting {
  id: Id;
  creatureId: Id;
  quantity?: SightingQuantity;
  note?: string;
}

export interface Dive {
  id: Id;
  date: string;
  siteName: string;
  areaName: string;
  countryCode?: string;
  regionId?: Id;
  coordinates?: Coordinates;
  maxDepth: Depth;
  durationMinutes: number;
  operator?: string;
  buddies?: string[];
  note?: string;
  sightings: Sighting[];
  highlightCreatureId?: Id;
  createdAt: string;
  updatedAt: string;
}

export interface CreatureArtwork {
  status: ArtworkStatus;
  thumb?: string;
  gallery?: string;
  hero?: string;
  aspectRatio?: number;
}

export interface ProvenanceEntry {
  source: string;
  url?: string;
  note?: string;
}

export interface Creature {
  id: Id;
  commonName: string;
  aliases?: string[];
  scientificName?: string;
  category?: string;
  regionIds?: Id[];
  curated: boolean;
  userCreated?: boolean;
  artwork?: CreatureArtwork;
  provenance?: ProvenanceEntry[];
}

export interface Region {
  id: Id;
  name: string;
  countryCode?: string;
  parentRegionId?: Id;
}

export type PlaceKind = 'country' | 'region' | 'area' | 'site';

export interface Place {
  id: Id;
  name: string;
  kind: PlaceKind;
  countryCode?: string;
  regionId?: Id;
  parentPlaceId?: Id;
  coordinates?: Coordinates;
  curated: boolean;
}

export interface SightingInput {
  creatureId: Id;
  quantity?: SightingQuantity;
  note?: string;
}

export interface CreateDiveInput {
  date: string;
  siteName: string;
  areaName: string;
  countryCode?: string;
  regionId?: Id;
  coordinates?: Coordinates;
  maxDepth: Depth;
  durationMinutes: number;
  operator?: string;
  buddies?: string[];
  note?: string;
  sightings: SightingInput[];
  highlightCreatureId?: Id;
}

type ClearableDiveInputKey =
  | 'countryCode'
  | 'regionId'
  | 'coordinates'
  | 'operator'
  | 'buddies'
  | 'note'
  | 'highlightCreatureId';

export type UpdateDiveInput = Partial<Omit<CreateDiveInput, ClearableDiveInputKey>> & {
  [K in ClearableDiveInputKey]?: CreateDiveInput[K] | undefined;
};

export interface LifetimeStats {
  totalDives: number;
  totalBottomTimeMinutes: number;
  distinctSites: number;
  distinctCreatures: number;
  distinctCountries: number;
}

export interface CreatureHistory {
  creature: Creature;
  firstSeenDate: string;
  mostRecentSeenDate: string;
  diveCount: number;
  sites: string[];
  areas: string[];
  relatedDiveIds: Id[];
}

export interface RecentDiscovery {
  creature: Creature;
  firstSeenDate: string;
  diveId: Id;
  siteName: string;
  areaName: string;
}

export interface PlaceSummary {
  key: string;
  label: string;
  countryCode?: string;
  diveCount: number;
  creatureCount: number;
  siteCount: number;
}

export interface CreatureSuggestionContext {
  areaName?: string;
  countryCode?: string;
  regionId?: Id;
  siteName?: string;
  date?: string;
}

export interface PoseidonContent {
  creatures?: Creature[];
  regions?: Region[];
  places?: Place[];
}

export interface PoseidonExportV1 {
  format: 'poseidon-personal-export';
  exportVersion: 1;
  exportedAt: string;
  schemaVersion: number;
  personal: {
    dives: Dive[];
    userCreatures: Creature[];
  };
  catalogSnapshots: {
    creatures: Creature[];
    regions: Region[];
    places: Place[];
  };
}

export interface PoseidonStore {
  listDives(): Promise<Dive[]>;
  getDive(id: Id): Promise<Dive | null>;
  createDive(input: CreateDiveInput): Promise<Dive>;
  updateDive(id: Id, input: UpdateDiveInput): Promise<Dive>;
  deleteDive(id: Id): Promise<void>;

  listCreatures(): Promise<Creature[]>;
  searchCreatures(query: string): Promise<Creature[]>;
  listSuggestedCreatures(context: CreatureSuggestionContext): Promise<Creature[]>;
  createUserCreature(name: string): Promise<Creature>;
  getCreatureHistory(creatureId: Id): Promise<CreatureHistory | null>;

  getLifetimeStats(): Promise<LifetimeStats>;
  listRecentDiscoveries(limit?: number): Promise<RecentDiscovery[]>;
  listCreatureCollection(): Promise<CreatureHistory[]>;
  listPlaceSummaries(): Promise<PlaceSummary[]>;

  exportData(): Promise<PoseidonExportV1>;
}
