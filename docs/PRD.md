# Poseidon — Product Requirements Document

## Status

This document is the durable product-requirements authority for Poseidon’s first personal-use product.

The first coherent implementation is already merged. Current implementation architecture belongs in `docs/APPLICATION.md`; current programme progress and remaining work belong in `docs/PROJECT_STATUS.md` and issue #5.

Do not reinterpret this PRD as an invitation to restart stack selection or recreate the former external prototype. Product behavior here remains authoritative unless deliberately changed.

---

# 1. Product statement

Poseidon is a **beautiful personal atlas of your underwater life**.

It is a mobile-first recreational dive journal where every dive becomes part of a permanent history and every marine-life encounter contributes to a visual personal collection.

The app should be fast enough to use after a dive and delightful enough to revisit months or years later.

The canonical historical object is the **Dive**.

The strongest emotional object is the **Creature Encounter**.

---

# 2. Primary user

Initial primary user: the owner of the app and, potentially, a small number of close friends/family.

This is not initially optimized for public-market adoption.

The user:

- is a recreational scuba diver;
- may dive intensively on trips and then not dive for months;
- wants every dive recorded;
- cares about creatures and memorable encounters more than technical dive telemetry;
- uses a phone as the primary interface;
- may log immediately after surfacing or later that evening;
- may have weak or no network connectivity while logging.

---

# 3. Core jobs

## 3.1 Record a dive

The user can create a durable record of every dive with minimal friction.

Required core data:

- date;
- location / area;
- dive site name;
- maximum depth;
- dive duration;
- creatures seen.

Optional data:

- short notes;
- operator;
- buddies;
- highlight creature.

Do not require technical-diving fields such as gas mix, cylinder pressure, SAC/RMV, decompression information or equipment inventory.

## 3.2 Record creatures delightfully

Creature logging is a visual interaction, not a database form.

The creature picker should prioritize:

1. locally relevant creatures for the current region/location;
2. recent/familiar creatures from personal history;
3. broader browse/search.

Each curated creature tile should show:

- artwork or deliberate fallback;
- common name;
- clear selected/unselected state.

The user can tap creatures to add/remove them.

The user must always be able to add a creature by text even if Poseidon has no curated asset or metadata for it.

## 3.3 Revisit a dive

Dive Detail should feel like a memory artifact rather than a raw database row.

It emphasizes:

- site/location;
- date;
- highlight creature;
- other creatures seen;
- max depth;
- duration;
- notes;
- optional operator/buddies.

The dive remains editable and deletable behind an appropriate safeguard.

## 3.4 Browse lifetime dive history

The user can browse all dives chronologically and reach any dive quickly.

History should make accumulated diving life legible without becoming a dense analytics dashboard.

## 3.5 Browse the marine collection

The user can see the creatures personally encountered.

Each creature can accumulate:

- first-seen dive/date;
- most recent sighting;
- number of dives on which it was seen;
- locations/regions where it was seen;
- related dives;
- artwork where curated.

## 3.6 See the shape of the diving life

Over time Poseidon should expose:

- total dives;
- sites visited;
- regions/countries visited;
- creatures encountered;
- geographic history of dive locations.

The current Atlas/Places baseline is valid without a map where trustworthy coordinates do not exist. A real map must follow sourced geodata rather than guessed pins.

---

# 4. Product information architecture

Primary areas:

1. **Home**
2. **Journal**
3. **Log Dive**
4. **Atlas**
5. **Collection**

Do not turn navigation into a large settings/productivity shell.

## Home

Home represents the user’s underwater life as a whole.

Target hierarchy:

- latest dive / latest chapter as the visual hero;
- compact lifetime shape;
- recent/new creature discoveries;
- clear paths into history/places/collection;
- prominent Log Dive action.

Home is not an analytics dashboard.

## Journal

Chronological dive history.

Dive summaries prioritize:

- location/site;
- date;
- highlight encounter/artwork where available;
- supporting creatures;
- depth/duration as concise secondary data.

Trip grouping may refine this history, but the Dive remains canonical.

## Atlas

Geographic diving history.

Grouped places/regions are valid even when coordinates are incomplete. A map is additive and evidence-gated.

## Collection

Visual marine-life gallery built from actual encounters.

The user’s seen history remains the main character. Global catalogue completion is not the core framing.

## Log Dive

Fast, focused creation flow optimized for phone use.

---

# 5. Logging flow

## Principle

The flow should feel delightful and lightweight enough to use after every dive.

Target normal completion: roughly under one minute once common trip context is known.

Do not sacrifice delight merely to minimize taps; creature selection is intentionally rich.

## Step 1 — Where and when

- date defaults sensibly;
- location/area;
- dive site;
- suggestions may use prior history and curated content;
- manual entry always works;
- same-day trip/location context should be easy to reuse.

## Step 2 — Dive basics

- max depth;
- duration;
- optional operator;
- optional buddies.

Units should be remembered/inferred consistently rather than asked on every dive.

## Step 3 — What did you see?

This is the signature interaction.

Show a visual creature gallery with artwork/fallback + common name.

Ordering:

1. local relevance;
2. recent/familiar creatures;
3. broader curated library.

Controls:

- tap to select/deselect;
- search;
- add an unlisted creature;
- optional quantity;
- choose/confirm a highlight creature.

Quantity is optional. If used, low-friction buckets are preferred over false precision unless the user explicitly enters a number.

## Step 4 — Memory

- optional short note;
- review highlight creature;
- save dive.

The final save state should feel satisfying without slowing repeated logging.

---

# 6. Creature model and UX

## 6.1 Naming

Primary display uses diver-friendly common names.

Curated records may carry:

- canonical ID;
- common name;
- aliases;
- optional scientific name;
- category;
- region tags;
- asset references;
- provenance;
- optional encounter-significance metadata only when trustworthy.

Scientific terminology remains secondary.

## 6.2 Unknown/unlisted creature

A user may enter any creature name.

An uncurated entry must:

- save immediately;
- appear on the dive;
- appear in the personal collection;
- use a graceful generic/typographic representation;
- remain eligible for later normalization without rewriting historical meaning.

## 6.3 Creature highlight

A dive may have one primary highlight creature.

- one selected creature may become the highlight automatically;
- with multiple creatures, Poseidon may suggest one;
- the user can always change it;
- no rarity algorithm overrides the user’s own memory.

## 6.4 Quantity

Quantity is not essential to the core product.

If included, prefer buckets such as:

- `1`;
- `a few`;
- `several`;
- `many`.

Exact counts are not required.

---

# 7. Visual and interaction direction

## 7.1 Product ancestor

Liebestraum remains the strongest reference for information hierarchy and accumulated personal history.

Transfer principles such as:

- latest-memory hero;
- quick creation;
- history/timeline;
- geographic history;
- compact meaningful stats;
- accumulated collection;
- phone-first ergonomics;
- restrained but personal delight.

Do not clone Liebestraum’s styling or backend assumptions.

## 7.2 Poseidon character

Poseidon uses the locked **Sunlit Reef** colour system in [`BRAND.md`](BRAND.md): cool Mint Cream environmental canvas, Jet Black legibility/depth, Cerulean primary ocean/action, Coral expressive selection/delight, Ocean Mist support, and rare Tuscan Sun highlight. Floral White provides selective warm memory/detail surfaces. Creature artwork remains the primary source of visual variety.

The integrated application’s established layout and interaction language is documented in `docs/APPLICATION.md` and should not be casually replaced.

## 7.3 Creature gallery performance contract

The gallery stays visually rich without forcing full-resolution assets into dense surfaces.

Runtime artwork requires:

- thumbnail variant;
- normal gallery variant;
- hero/detail variant where justified;
- lazy loading;
- fixed/reserved geometry;
- graceful missing/broken-art fallback;
- offline caching appropriate to the starter library.

The current canonical runtime contract is implemented under `assets/creatures` and documented in `docs/ASSET_PIPELINE.md`.

---

# 8. MVP boundary and current status

## MVP-A — first genuinely usable personal log

The following MVP-A product capabilities are implemented on current `main`:

### App shell
- mobile-first responsive layout;
- aquatic light-mode foundation;
- reliable navigation;
- local/offline persistence;
- PWA shell.

### Dive logging
- create/edit/delete dive;
- date;
- area/site;
- max depth;
- duration;
- optional note/operator/buddies;
- creature selection/manual entry;
- highlight creature.

### Creature gallery
- sourced starter catalogue;
- artwork/fallback capability;
- regional relevance ordering;
- search;
- arbitrary creature entry;
- explicit selected-state interaction.

### Journal / memory
- chronological history;
- Dive Detail;
- empty/sparse states;
- latest dive surfaced on Home.

### Collection
- encountered creatures;
- first/most recent seen;
- dive history;
- artwork where available.

### Lifetime basics
- total dives;
- bottom time;
- distinct sites;
- creatures;
- countries where represented.

### Reliability
- core app works without network after cache establishment;
- persisted data survives restart;
- missing artwork does not block flows;
- versioned structured export exists.

The main remaining MVP-A **field-readiness** gap is safe restore plus deployed/installable real-device validation, tracked in #14.

## MVP-B / refinement

Remaining or partially implemented refinement includes:

- trip grouping (#15);
- restrained milestone system (#15);
- richer curated Creature Detail (#15);
- sourced coordinates and a real map (#16);
- broader reviewed creature artwork (#11/#12);
- safe restore from export (#14);
- legacy/third-party log import where practical (optional);
- rarity/encounter-significance only if trustworthy evidence eventually justifies it.

## Explicitly later / optional

- photos / GoPro ingestion;
- PADI integration;
- dive-computer sync;
- public/multi-tenant accounts (this remains a single-owner, admin-allowlisted personal app: see `docs/PROJECT_STATUS.md` for the Firebase auth gate now in place);
- social feeds;
- likes/comments/followers;
- leaderboards;
- shop/operator marketplace;
- technical diving metrics;
- AI photo recognition;
- broad global creature-art completeness.

---

# 9. Initial content scope

Initial rich region:

**Mexican Caribbean**, especially Cozumel and Playa del Carmen.

The implemented starter content pack contains region, site and creature records with aliases and provenance.

The content system must continue to support adding regions/creatures without requiring bespoke application logic wherever practical.

---

# 10. Stats and milestones

Stats describe history; they do not judge performance.

Safe stats include:

- total dives;
- total logged bottom time;
- sites;
- places/regions/countries;
- creatures encountered;
- dives per trip/year where useful;
- first/most recent encounter dates.

Do not frame maximum depth or duration as achievements.

Milestones are restrained, episodic and secondary to the Journal. No daily streak system is appropriate for diving.

Milestone implementation is tracked in #15.

---

# 11. Data ownership and persistence

Poseidon is intended to become a long-lived personal archive.

Requirements:

- no network requirement for core logging/browsing;
- versioned local persistence;
- clear migrations;
- account not required for the first personal product;
- structured export;
- data must not be trapped indefinitely;
- safe restore/recovery path before relying on Poseidon as the only canonical copy.

Current persistence/export architecture is documented in `docs/DOMAIN_ARCHITECTURE.md`. Restore/deployment field readiness is tracked in #14.

Potential later formats include JSON, CSV and UDDF; the current canonical export is versioned JSON.

---

# 12. Accessibility

From the first build:

- semantic controls;
- touch-friendly targets;
- sufficient contrast;
- selection meaning not dependent on colour alone;
- visible keyboard focus where applicable;
- reduced-motion-friendly behavior;
- readable common names with creature artwork;
- stable layouts while images load;
- safe-area-aware mobile composition.

These are ongoing contracts, not one-time acceptance items.

---

# 13. Key quality bar

Poseidon is not judged only by whether data saves.

It should answer yes to:

1. Can I log a real dive quickly on my phone?
2. Is selecting creatures enjoyable enough to be the memorable part of logging?
3. Can I log something even when curated content is incomplete?
4. Does a saved dive feel like a memory rather than a database row?
5. Does the collection make accumulated dives feel more valuable?
6. Does core use work when the network is absent?
7. Can I trust the record to persist and recover?

---

# 14. Representative acceptance scenario

The automated application suite covers the representative flow:

1. Open Poseidon.
2. Log a Cozumel/Playa-region dive.
3. Enter max depth and duration.
4. Browse the local creature gallery.
5. Select several creatures.
6. Add one unlisted creature manually.
7. Choose a highlight creature.
8. Add a note.
9. Save.
10. Verify Home and Journal.
11. Open Dive Detail and verify encounters.
12. Open Collection / Creature Detail.
13. Restart and confirm persistence.
14. Edit without corrupting derived collection/history.
15. Delete behind a safeguard and confirm derived consistency.

Automated success is necessary but not sufficient for owner-level v0 closeout. Issue #14 adds deployed/standalone Android, offline cold-start, restore and real-device/field validation.
