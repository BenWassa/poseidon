# Poseidon — Product Requirements Document

## Status

Initial product definition for the first personal-use build.

This PRD is intentionally more specific about product behavior than technical implementation. The first implementation agent may propose stack choices, but it must preserve the experience contracts here and in `PRODUCT.md`.

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

The initial user:

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

The form should not require technical diving fields such as gas mix, cylinder pressure, SAC/RMV, decompression information or equipment inventory.

## 3.2 Record creatures delightfully

Creature logging is a visual interaction, not a database form.

The default creature picker should present:

1. **likely creatures for the current location/region**;
2. then creatures recently/frequently logged by the user;
3. then broader browse/search.

Each curated creature tile should show:

- artwork;
- common name;
- clear selected/unselected state.

The user can tap creatures to add/remove them from the dive.

The user must always be able to add a creature by text even if Poseidon has no curated asset or metadata for it.

## 3.3 Revisit a dive

A dive detail view should feel like a memory artifact rather than a raw row of data.

It should emphasize:

- site/location;
- date;
- highlight creature;
- other creatures seen;
- max depth;
- duration;
- notes.

The dive must remain editable.

## 3.4 Browse lifetime dive history

The user can browse all dives chronologically and reach any dive detail quickly.

The journal should make accumulated history legible without becoming a dense analytics dashboard.

## 3.5 Browse the marine collection

The user can see the creatures they have personally encountered.

Each creature should accumulate:

- first-seen dive/date;
- most recent sighting;
- number of dives on which it was seen;
- locations/regions where it was seen;
- artwork where curated.

## 3.6 See the shape of the diving life

Over time Poseidon should expose:

- total dives;
- sites visited;
- regions/countries visited;
- creatures encountered;
- a geographic atlas of dive locations.

The full map experience may follow the first usable logging build, but the data model must not prevent it.

---

# 4. Product information architecture

Long-term primary areas:

1. **Home**
2. **Journal**
3. **Atlas**
4. **Collection**
5. **Log Dive**

Do not turn navigation into a large settings/productivity shell.

## Home

Home represents the user's underwater life as a whole.

Target composition:

- latest dive / latest chapter as the visual hero;
- compact lifetime shape: dives, sites, places, creatures;
- recent/new creature discoveries;
- clear paths to Journal, Atlas and Collection;
- prominent route into Log Dive.

Home is not an analytics dashboard.

## Journal

Chronological dive history.

Each dive summary should prioritize:

- location/site;
- date;
- highlight creature artwork if available;
- small supporting creature indicators;
- depth/duration as concise secondary data.

## Atlas

Long-term geographic history.

Initial implementation may begin as grouped places/regions and evolve into a map once enough location data exists.

## Collection

Visual marine-life gallery built from actual encounters.

Unseen content may be shown later for discovery, but the first collection view should make the user's seen history the main character.

## Log Dive

Fast, focused creation flow optimized for phone use.

---

# 5. Logging flow

## Principle

The flow should feel delightful and lightweight enough to use after every dive.

Target normal completion: roughly under one minute once the user's common context is known.

Do not sacrifice delight simply to minimize taps; the creature-selection step is intentionally rich.

## Recommended flow

### Step 1 — Where and when

- date defaults to today;
- location/area;
- dive site;
- location/site may use suggestions from prior dives and curated local content;
- manual entry always works.

If the user has already logged a dive on the same date, prior trip/location context should be easy to reuse.

### Step 2 — Dive basics

- max depth;
- duration;
- optional operator;
- optional buddies.

Units should be configurable or inferred consistently. Do not require the user to choose units on every dive.

### Step 3 — What did you see?

This is the signature interaction.

Show a visual creature gallery with artwork + common name.

Ordering:

1. likely local creatures;
2. recent/familiar creatures;
3. broader curated library.

Controls:

- tap to select/deselect;
- search;
- add an unlisted creature;
- optional quantity after selection or on a lightweight detail affordance;
- choose/confirm a highlight creature before saving or allow automatic suggestion that is always editable.

Quantity is optional in MVP. If implemented, use low-friction buckets rather than false precision unless the user explicitly enters a number.

### Step 4 — Memory

- optional short note;
- review highlight creature;
- save dive.

The final save state should feel satisfying but not theatrical enough to slow repeated logging.

---

# 6. Creature model and UX

## 6.1 Naming

Primary display uses diver-friendly common names.

Internally a curated creature may later carry:

- canonical ID;
- display/common name;
- aliases;
- optional scientific name;
- broader category;
- region tags;
- asset references;
- provenance/source metadata;
- optional encounter-frequency/rarity data.

The main UI must not require scientific terminology.

## 6.2 Unknown/unlisted creature

A user may enter any creature name.

An uncurated entry must:

- save immediately;
- appear on the dive;
- appear in the personal collection;
- use a graceful generic/typographic representation;
- be eligible for later normalization to a curated creature without rewriting historical dive meaning.

## 6.3 Creature highlight

A dive may have one primary highlight creature.

Default behavior:

- if one creature is selected, it can become the highlight automatically;
- if multiple are selected, Poseidon may suggest one;
- the user can always change it;
- no rarity algorithm may override the user's own memory of what was special.

## 6.4 Quantity

Quantity is not essential to the first build.

If included, prefer one of:

- `1`;
- `a few`;
- `several`;
- `many`;

or a similarly low-friction model.

Do not require exact counts.

---

# 7. Visual and interaction direction

## 7.1 Product ancestor

Liebestraum is the strongest product reference for information hierarchy and the treatment of accumulated personal history.

Transfer:

- latest-memory hero;
- quick creation;
- history/timeline;
- geographic view;
- compact meaningful stats;
- accumulated collection;
- phone-first ergonomics;
- restrained but personal delight.

Do not clone Liebestraum's styling.

## 7.2 Poseidon character

- light mode first;
- rich ocean blues;
- aquatic greens;
- coral and tropical accent colours;
- generous breathing room;
- fluid transitions;
- tactile selection states;
- polished creature artwork;
- premium but playful;
- alive rather than technical.

## 7.3 Creature gallery performance contract

The gallery must remain visually rich without forcing full-resolution assets into the initial render.

The product requires an asset pipeline capable of:

- low-resolution thumbnails/placeholders;
- lazy loading;
- responsive image sizes or equivalent variants;
- higher-resolution art only where the screen justifies it;
- graceful handling of uncached/missing art;
- offline caching appropriate to the curated starter library.

Exact implementation belongs to engineering, but the experience contract is fixed: **delightful imagery without sluggish gallery interaction**.

---

# 8. MVP boundary

## MVP-A — first genuinely usable personal log

Must include:

### App shell
- mobile-first responsive layout;
- light aquatic visual foundation;
- reliable navigation;
- local/offline-capable persistence.

### Dive logging
- create dive;
- date;
- location/area;
- dive site;
- max depth;
- duration;
- optional note;
- add/select creatures;
- edit/delete dive.

### Creature gallery
- curated starter creatures with names and artwork/placeholder capability;
- local-likelihood ordering where data exists;
- search;
- arbitrary creature entry;
- selected-state interaction;
- highlight creature.

### Journal
- chronological list;
- dive detail;
- meaningful empty state;
- recent/latest dive surfaced on Home.

### Collection
- seen creatures;
- first/most recent seen;
- dives encountered on;
- artwork where available.

### Lifetime basics
- total dives;
- total distinct sites;
- total distinct creatures.

### Reliability
- app works without network for core creation/browsing;
- persisted data survives restart;
- missing creature artwork does not break flows;
- all user-created data can be exported in at least a simple structured format before the app becomes the canonical long-term log.

## MVP-B — completes the personal atlas proposition

Add after the core log is solid:

- richer Home composition;
- geographic Atlas/map;
- country/region/site rollups;
- trip grouping;
- milestone system;
- richer creature detail;
- curated rarity/encounter-significance only if trustworthy source data is available;
- refined region-aware creature recommendations;
- import from earlier logs where practical.

## Explicitly later / optional

- photos;
- GoPro ingestion;
- PADI integration;
- dive-computer sync;
- public accounts;
- social feeds;
- likes/comments/followers;
- public leaderboards;
- shop/operator marketplace;
- technical diving metrics;
- AI photo recognition;
- broad global creature art coverage.

---

# 9. Initial content scope

Initial rich region:

**Mexican Caribbean**, especially Cozumel and Playa del Carmen.

The initial content pack should include:

- common dive areas/sites where practical;
- a curated set of locally plausible marine-life common names;
- aliases where useful;
- region tags;
- a first batch of polished creature art;
- fallbacks for every creature without finished art.

Aim for enough content that the gallery feels alive, not for biological completeness.

The content system must support adding new creatures and regions without code changes wherever practical.

---

# 10. Stats and milestones

Stats should describe the user's history, not judge performance.

Safe initial stats:

- total dives;
- total logged bottom time;
- sites;
- locations/regions/countries;
- creatures encountered;
- dives per year/trip;
- first/most recent encounter dates.

Do not frame maximum depth or duration as achievements.

Milestones should be restrained and meaningful. No daily streak system is required; diving is episodic and travel-driven.

---

# 11. Data ownership and persistence

Poseidon is intended to become a long-lived personal archive.

Requirements:

- no network requirement for basic logging;
- clear local persistence contract;
- backup/sync may be added when appropriate;
- an account should not be required merely to evaluate/use the first local build unless engineering shows a compelling reliability reason;
- user data must not be trapped indefinitely;
- export should be designed early enough that accumulated dives are recoverable.

Potential later formats include JSON, CSV and UDDF, but MVP export may begin with a well-structured JSON/CSV representation.

---

# 12. Accessibility

From the first build:

- semantic controls;
- touch-friendly targets;
- sufficient contrast;
- selection meaning not dependent on colour alone;
- visible keyboard focus where applicable;
- reduced-motion-friendly behavior;
- readable common names beneath/alongside creature artwork;
- performant enough that image loading does not make controls unstable.

---

# 13. Key quality bar

The first build should not be judged only by whether data saves.

It should answer yes to these questions:

1. Can I log a real dive quickly on my phone?
2. Is selecting creatures enjoyable enough to be the memorable part of logging?
3. Can I log something even when the curated content library is incomplete?
4. Does a saved dive feel like a memory rather than a database record?
5. Does seeing the collection make accumulated dives feel more valuable?
6. Does it work when the network is bad or absent?
7. Can I trust it not to lose the record?

---

# 14. First-build acceptance scenario

A representative test should be possible entirely on a phone:

1. Open Poseidon with weak/no network.
2. Log a dive at a Cozumel site.
3. Enter max depth and duration.
4. Browse a visually rich local creature gallery.
5. Select several creatures.
6. Add one unlisted creature manually.
7. Choose a highlight creature.
8. Add a short note.
9. Save.
10. See the dive immediately reflected on Home and Journal.
11. Open the dive and see the highlight/encounters clearly.
12. Open Collection and see the newly encountered creatures.
13. Close/reopen the app and confirm the dive remains.
14. Edit the dive without corrupting collection/history state.

If this flow is not excellent, broader Atlas/gamification work should not distract from fixing it.
