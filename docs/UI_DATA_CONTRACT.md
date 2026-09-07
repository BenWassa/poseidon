# Poseidon — UI Data Contract

## Status

This is the stable application-facing domain/service boundary for the integrated Poseidon application.

The former external-front-end/backend parallel-development phase is complete. The real implementation now lives in `packages/domain` and is consumed by `apps/web`.

The TypeScript source in `packages/domain/src/domain.ts` is executable authority when this document and code differ. This document records the product/architecture contract that later changes should preserve deliberately.

---

# 1. Canonical principle

The **Dive** is the canonical historical record.

Marine Collection, lifetime stats, recent discoveries, place summaries, and future derived history views such as trips or milestones should be recomputed from dives + creature/content metadata wherever practical.

Avoid competing persisted sources of truth for the same personal history.

Curated content is enrichment. It is not canonical personal data.

---

# 2. UI / persistence boundary

Application components use `PoseidonStore` rather than importing persistence internals.

Today the production app injects a local persistence implementation. The boundary is intentionally stable enough that a future IndexedDB/native/optional-sync adapter does not require a UI rewrite.

The UI must not:

- import a persistence SDK directly;
- assume cloud/auth is required;
- treat curated content as user-owned canonical history;
- assume every dive has coordinates;
- assume every creature has curated art;
- assume every user-entered creature is scientifically normalized.

---

# 3. Core domain types

The implemented shapes are defined in `packages/domain/src/domain.ts`. The important product-facing concepts are:

```ts
type Id = string;
type DepthUnit = 'm' | 'ft';
type SightingQuantity = 'one' | 'few' | 'several' | 'many';
type ArtworkStatus = 'curated' | 'placeholder' | 'missing';

type Coordinates = {
  lat: number;
  lng: number;
};

type Dive = {
  id: Id;
  date: string; // ISO local date
  siteName: string;
  areaName: string;
  countryCode?: string;
  regionId?: Id;
  coordinates?: Coordinates;
  maxDepth: { value: number; unit: DepthUnit };
  durationMinutes: number;
  operator?: string;
  buddies?: string[];
  note?: string;
  sightings: Sighting[];
  highlightCreatureId?: Id;
  createdAt: string;
  updatedAt: string;
};

type Sighting = {
  id: Id;
  creatureId: Id;
  quantity?: SightingQuantity;
  note?: string;
};

type Creature = {
  id: Id;
  commonName: string;
  aliases?: string[];
  scientificName?: string;
  category?: string;
  regionIds?: Id[];
  curated: boolean;
  userCreated?: boolean;
  artwork?: {
    status: ArtworkStatus;
    thumb?: string;
    gallery?: string;
    hero?: string;
    aspectRatio?: number;
  };
  provenance?: Array<{
    source: string;
    url?: string;
    note?: string;
  }>;
};

type Region = {
  id: Id;
  name: string;
  countryCode?: string;
  parentRegionId?: Id;
};

type Place = {
  id: Id;
  name: string;
  kind: 'country' | 'region' | 'area' | 'site';
  countryCode?: string;
  regionId?: Id;
  parentPlaceId?: Id;
  coordinates?: Coordinates;
  curated: boolean;
};
```

A user-created creature is intentionally allowed to be much less enriched than a curated creature while still flowing through the same normalized UI shape.

---

# 4. Derived UI models

The implemented store exposes derived history rather than separately persisted copies:

```ts
type LifetimeStats = {
  totalDives: number;
  totalBottomTimeMinutes: number;
  distinctSites: number;
  distinctCreatures: number;
  distinctCountries: number;
};

type CreatureHistory = {
  creature: Creature;
  firstSeenDate: string;
  mostRecentSeenDate: string;
  diveCount: number;
  sites: string[];
  areas: string[];
  relatedDiveIds: Id[];
};

type RecentDiscovery = {
  creature: Creature;
  firstSeenDate: string;
  diveId: Id;
  siteName: string;
  areaName: string;
};

type PlaceSummary = {
  key: string;
  label: string;
  countryCode?: string;
  diveCount: number;
  creatureCount: number;
  siteCount: number;
};
```

New derived views should follow the same rule unless there is a strong reason to persist them.

---

# 5. PoseidonStore

The current application boundary is:

```ts
interface PoseidonStore {
  // Dives
  listDives(): Promise<Dive[]>;
  getDive(id: Id): Promise<Dive | null>;
  createDive(input: CreateDiveInput): Promise<Dive>;
  updateDive(id: Id, input: UpdateDiveInput): Promise<Dive>;
  deleteDive(id: Id): Promise<void>;

  // Creatures/content
  listCreatures(): Promise<Creature[]>;
  searchCreatures(query: string): Promise<Creature[]>;
  listSuggestedCreatures(context: CreatureSuggestionContext): Promise<Creature[]>;
  createUserCreature(name: string): Promise<Creature>;
  getCreatureHistory(creatureId: Id): Promise<CreatureHistory | null>;

  // Derived personal history
  getLifetimeStats(): Promise<LifetimeStats>;
  listRecentDiscoveries(limit?: number): Promise<RecentDiscovery[]>;
  listCreatureCollection(): Promise<CreatureHistory[]>;
  listPlaceSummaries(): Promise<PlaceSummary[]>;

  // Durability
  exportData(): Promise<PoseidonExportV1>;
}
```

Issue #14 is the planned place to add a safe restore/import counterpart to the existing export contract.

---

# 6. Create/update contract

A dive is assembled in the UI and committed through the store as one canonical record.

```ts
type CreateDiveInput = {
  date: string;
  siteName: string;
  areaName: string;
  countryCode?: string;
  regionId?: Id;
  coordinates?: Coordinates;
  maxDepth: { value: number; unit: 'm' | 'ft' };
  durationMinutes: number;
  operator?: string;
  buddies?: string[];
  note?: string;
  sightings: Array<{
    creatureId: Id;
    quantity?: 'one' | 'few' | 'several' | 'many';
    note?: string;
  }>;
  highlightCreatureId?: Id;
};
```

`UpdateDiveInput` is a partial update form of the same contract, with optional fields explicitly clearable.

Store validation guarantees the highlight references a current sighting and keeps stable sighting IDs for retained creatures across edits.

---

# 7. Creature suggestion contract

The gallery combines regional relevance with personal familiarity.

```ts
type CreatureSuggestionContext = {
  areaName?: string;
  countryCode?: string;
  regionId?: Id;
  siteName?: string;
  date?: string;
};
```

The current deterministic ranking uses:

1. region/content relevance;
2. the user's own encounter recency/frequency;
3. common-name ordering for unseen content.

It is not a probabilistic rarity engine and makes no encounter-likelihood percentage claim.

---

# 8. Content and artwork boundary

Production content is loaded from the sourced content pack and normalized into the domain catalogue.

Artwork exposed to the UI uses only canonical runtime metadata:

- `status`;
- `thumb`;
- `gallery`;
- `hero`;
- `aspectRatio`.

Application code must not consume source-generation files directly.

The source-art work in #11 / PR #13 introduces an editorial input layer under `assets/source/creatures`; canonical runtime output remains `assets/creatures/<id>/...`.

Missing artwork remains valid product state and must render through a deliberate fallback.

---

# 9. Fixtures and tests

Synthetic fixtures remain useful for deterministic development and acceptance tests, but they are not product authority or sourced marine content.

Fixture exports are isolated behind the explicit `@poseidon/domain/fixtures` subpath.

Production behavior should be tested against the same `PoseidonStore` boundary used by the app.

---

# 10. Integration rule going forward

Later work should integrate through existing contracts rather than recreating parallel implementations.

When changing this boundary:

1. start from current `packages/domain` types/store;
2. preserve stable concepts unless the product requirement genuinely changes;
3. add migrations when canonical personal data changes;
4. update this document, `DOMAIN_ARCHITECTURE.md`, and application tests together when the contract changes materially;
5. avoid visual redesign merely because persistence/content internals change.

The current architecture and application decisions are documented in `docs/APPLICATION.md`; current programme state lives in `docs/PROJECT_STATUS.md`.
