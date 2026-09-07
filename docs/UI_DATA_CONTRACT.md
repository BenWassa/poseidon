# Poseidon — UI Data Contract

## Purpose

This document defines the application-facing data and service boundary that allows front-end design/prototyping and persistence/backend work to proceed in parallel.

The contract is product-oriented, not database-oriented.

The UI must not import or depend directly on a specific persistence SDK.

The implementation may refine names/types, but should preserve these concepts and flows unless the product documents change.

---

# 1. Canonical principle

The **Dive** is the canonical historical record.

Marine Collection, lifetime stats, recent discoveries and most Atlas summaries are derived from dives + creature metadata wherever practical.

Avoid creating competing sources of truth for the same personal history.

---

# 2. Core domain types

Conceptual TypeScript shape:

```ts
type Id = string;

type Dive = {
  id: Id;
  date: string; // ISO local date, e.g. 2026-09-06
  siteName: string;
  areaName: string;
  countryCode?: string;
  regionId?: Id;
  coordinates?: {
    lat: number;
    lng: number;
  };
  maxDepth: {
    value: number;
    unit: 'm' | 'ft';
  };
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
  quantity?: 'one' | 'few' | 'several' | 'many';
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
    status: 'curated' | 'placeholder' | 'missing';
    thumb?: string;
    gallery?: string;
    hero?: string;
    aspectRatio?: number;
  };
};

type Region = {
  id: Id;
  name: string;
  countryCode?: string;
  parentRegionId?: Id;
};
```

A user-created creature may be much simpler internally, but the UI should receive it in a normalized `Creature` shape.

---

# 3. Derived UI models

The backend/persistence layer may expose raw entities plus selectors, or directly expose derived view models.

Useful derived shapes:

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

---

# 4. Application service boundary

Front-end components should use an application service/repository interface rather than database calls.

Conceptual interface:

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
  exportData(): Promise<unknown>;
}
```

Exact sync/reactive signatures may differ. The important boundary is that components do not know whether data comes from fixtures, IndexedDB, SQLite, Firestore, Supabase or another implementation.

---

# 5. Creature suggestion context

Creature gallery ordering needs enough context to combine local relevance with personal familiarity.

```ts
type CreatureSuggestionContext = {
  areaName?: string;
  countryCode?: string;
  regionId?: Id;
  siteName?: string;
  date?: string;
};
```

Recommended UI grouping:

1. local / likely here;
2. recent / familiar to the user;
3. all/browse/search.

The service does not need a probabilistic recommendation engine for v0. Deterministic region tags + recency are sufficient.

---

# 6. Create/update input

The UI should be able to build a dive incrementally across multiple steps without persisting partial invalid records unless the chosen persistence strategy deliberately supports drafts.

Conceptual input:

```ts
type CreateDiveInput = {
  date: string;
  siteName: string;
  areaName: string;
  countryCode?: string;
  regionId?: Id;
  coordinates?: { lat: number; lng: number };
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

type UpdateDiveInput = Partial<CreateDiveInput>;
```

---

# 7. Fixture package for front-end work

Gemini/front-end work should have realistic fixtures that include at least:

## Personal history

- 8–12 dives;
- multiple dives on the same day;
- Cozumel + Playa del Carmen;
- several repeated sites;
- varied depth/duration;
- one dive with no notes;
- one dive with only one creature;
- one dive with many creatures;
- one user-created/unillustrated creature.

## Creature catalogue

At least 16–24 creatures for realistic gallery density, including:

- Green sea turtle
- Hawksbill turtle
- Spotted eagle ray
- Southern stingray
- Nurse shark
- Barracuda
- Green moray eel or generic Moray eel
- Pufferfish
- Porcupinefish
- French angelfish
- Queen angelfish
- Parrotfish
- Sergeant major
- Trumpetfish
- Grouper
- Hogfish
- Lionfish
- Caribbean reef squid
- Octopus
- Lobster

Some should have `curated` art; some should deliberately use placeholders to prove fallback behavior.

## Derived states

Fixture history should yield:

- meaningful latest dive;
- several recent discoveries;
- repeated creatures across dives;
- multiple sites/areas;
- sparse but non-empty Atlas summaries.

Also provide an empty-profile fixture and a one-dive fixture.

---

# 8. Persistence/backend requirements

The production persistence implementation must eventually satisfy:

- local/offline creation, editing and deletion;
- durable restart persistence;
- schema versioning/migrations;
- stable IDs;
- safe relationship between dives and creature references;
- later normalization of user-created creature records;
- export of canonical personal data;
- ability to add optional sync later without rewriting the UI/domain model.

The first backend agent should optimize for reliability and simplicity, not cloud feature count.

---

# 9. Front-end assumptions allowed before backend exists

Gemini may safely assume:

- all `PoseidonStore` operations work;
- creature assets can expose thumbnail/gallery/hero variants;
- loading/error/empty states can be simulated;
- offline status can be represented in fixtures;
- location-aware suggestions can be deterministic fixture data;
- maps/coordinates may be partial.

Gemini should **not**:

- directly wire components to Firebase/Supabase/etc.;
- invent account/auth requirements;
- make cloud sync mandatory;
- assume every dive has coordinates;
- assume every creature has art;
- assume every creature is scientifically normalized.

---

# 10. Integration rule

The UI branch and persistence branch can diverge temporarily as long as both preserve this boundary.

Integration should primarily mean:

1. replace fixture store with real store;
2. preserve component APIs and domain shapes;
3. reconcile only evidence-backed contract differences;
4. avoid visual redesign during backend integration.

This contract exists specifically to keep visual design and engineering parallel rather than sequential.