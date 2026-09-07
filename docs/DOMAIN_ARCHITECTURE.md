# Poseidon domain and persistence architecture

## Status

This document records the foundation implemented for issue #2. It is intentionally independent of the external front-end implementation.

The application-facing authority remains `docs/UI_DATA_CONTRACT.md`.

## Boundary

UI code consumes `PoseidonStore`. It does not import a persistence SDK or know where data is stored.

The domain package provides:

- canonical `Dive`, `Sighting`, `Creature`, `Region` and `Place` types;
- create/read/update/delete for dives;
- stable user-created creature records;
- derived lifetime stats, collection/history, discoveries and place summaries;
- deterministic creature suggestion ordering;
- versioned local persistence;
- structured JSON export.

Curated content is supplied to the store as a catalogue. It is not copied into the canonical personal persistence envelope.

## Canonical data rule

The Dive is the source of truth for personal history.

Persisted personal state contains only:

- dives (including sighting references);
- user-created creatures needed to resolve those references.

Collection entries, encounter history, lifetime stats, recent discoveries and place summaries are recomputed from dives plus creature metadata. There is no separately persisted collection or stats table that can drift after an edit or deletion.

Curated creature/region/place data is content, not personal history. The content streams can replace or expand the catalogue without migrating every user's dive record, provided stable curated IDs are preserved.

## Persistence choice

The first production adapter is `LocalStoragePersistence` using one stable key: `poseidon.personal`.

This is a deliberate v0 choice for the current scope:

- the canonical payload is small structured metadata, not photos or dive-computer telemetry;
- local storage is universally available in the intended mobile-first web/PWA shell;
- a single serialized envelope gives simple all-or-nothing replacement semantics for each mutation;
- there is no runtime persistence dependency for the front end to inherit;
- deterministic tests can exercise the same adapter contract without browser-specific test infrastructure;
- the adapter boundary leaves IndexedDB, SQLite or an optional sync layer replaceable without changing `PoseidonStore` or UI components.

The store serializes writes so concurrent mutations cannot overwrite one another. A failed persistence write does not replace the in-memory committed state and is surfaced as `PoseidonPersistenceError` rather than silently reported as success.

### Limits of the choice

Browser-managed local storage is not an infinite or device-level backup. The current no-photo metadata scope is intentionally kept well inside normal quota expectations, and JSON export exists from the beginning because Poseidon is meant to become a long-lived personal archive.

If the canonical payload later expands materially (photos, large imported telemetry, large offline content, etc.), add a new `PersistenceAdapter` such as IndexedDB or native SQLite. Do not expose that change to UI components.

## Schema and migrations

`CURRENT_SCHEMA_VERSION` is `2`.

- **v1** is the supported earliest envelope shape: dives plus lightweight user-created creature records.
- **v2** is the first foundation schema: it adds an envelope `updatedAt` timestamp and normalizes user-created creatures into the application-facing `Creature` shape with explicit `curated: false`, `userCreated: true`, and missing-art fallback metadata.

On open:

1. raw storage is read;
2. the schema version is inspected;
3. known older schemas are migrated deterministically in memory;
4. the migrated current schema is written back before the store becomes available;
5. malformed, unversioned or future-version data throws instead of being discarded.

Future schema changes should add one explicit migration step per version and retain migration fixtures in tests.

## IDs and relationships

Dives, sightings and user-created creatures receive stable generated IDs. The default generator uses `crypto.randomUUID()` when available and is injectable for deterministic tests.

A sighting is a stable child record of a dive. When a dive is edited, sightings for retained creature IDs keep their existing sighting IDs; only newly added creatures receive new sighting IDs.

`highlightCreatureId` is validated against the dive's current sightings. If an edit removes the highlighted creature and does not explicitly choose a new highlight, the invalid highlight is cleared.

User-created creatures are retained even if their last referencing dive is deleted. Their stable IDs therefore remain available for future logging and later normalization work.

## Derived state

### Lifetime stats

Derived from current dives:

- total dives;
- total bottom time in minutes;
- distinct sites (area + site name);
- distinct creature IDs;
- distinct country codes.

### Creature collection/history

For each encountered creature:

- first seen date;
- most recent seen date;
- number of dives on which it was seen;
- unique sites;
- unique areas;
- related dive IDs.

Only one encounter per creature per dive contributes to `diveCount`.

### Recent discoveries

A discovery is the first chronological dive containing a creature. Results are ordered newest-first and limited by the caller.

### Place summaries

The v0 selector groups personal history by normalized `areaName` + country and derives dive, creature and site counts. This intentionally works for arbitrary manual locations without requiring curated place content.

### Suggested creatures

Ordering is deterministic and uses two evidence sources only:

1. regional content tags;
2. the user's own dive history.

Local creatures sort first. Within a tier, previously encountered creatures sort by most-recent encounter and then frequency; unseen content falls back to common-name order.

Region hierarchy is respected: a specific region inherits parent tags, while a broad region includes descendant tags. A specific child region does not make its sibling regions local.

No rarity or encounter-probability claim is generated.

## Export

`exportData()` returns versioned JSON-compatible data with:

- format identifier and export version;
- export timestamp and current persistence schema version;
- complete canonical personal dives;
- all user-created creatures;
- snapshots of curated creatures referenced by those dives;
- relevant region snapshots including ancestors;
- relevant curated place snapshots where available.

This separates canonical personal records from replaceable catalogue enrichment while keeping the export interpretable outside the live application.

## Fixture isolation

`packages/domain/src/fixtures.ts` is exported only through the explicit `@poseidon/domain/fixtures` subpath. Its data is synthetic and exists for contract/dev testing only. It must not be treated as sourced production marine content.

Production content belongs to the dedicated content stream (#4).

## Test contract

The foundation tests cover:

- local persistence across store re-instantiation;
- create/edit/delete semantics;
- stable sighting IDs through edits;
- concurrent write serialization;
- v1 → v2 migration and write-back;
- rejection of malformed/future schemas;
- persistence error propagation;
- derived stats/collection/discoveries/place summaries after mutations;
- deterministic region + recency suggestion ordering;
- common-name/alias/scientific-name search;
- portable export contents;
- invalid creature/highlight references.
