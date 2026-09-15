# Poseidon — current project status

Last reconciled: **2026-09-15**

This is the living programme-status companion to the durable product contracts. It records current implementation and remaining work; it does not replace `PRODUCT.md` or `docs/PRD.md`.

## Current integrated baseline

Issue #51 implementation started from current `main` authority:

`b5583718638401110c8449021de459436e0acced`

Poseidon is a deployed React/Vite/TypeScript PWA with Firebase-backed approved-user persistence, local/offline shadow persistence, canonical marine content and a guarded creature-asset pipeline.

Production deployment:

`https://benwassa.github.io/poseidon/`

The full repository gate is:

```bash
npm run gate
```

It covers canonical content/assets, lint/format, typechecks, domain/application tests, production build, PWA precache-budget verification and automated field-readiness acceptance.

## Product baseline

Implemented product capability includes Home, four-step Log Dive, site/context reuse, dive metadata, visual and unlisted creature selection, highlights, Journal/Dive Detail edit/delete, the full curated Marine Collection guide with sighting-derived `Seen / Not yet seen` state and runtime progress, derived trips and milestones, sourced Creature Detail, Atlas/Places plus evidence-backed map coordinates, derived stats/discoveries, offline persistence and migrations, JSON export/validated restore, accessibility/mobile composition, GitHub Pages deployment and PWA install/update/offline behavior.

Core architecture remains:

- npm workspaces;
- `apps/web` — React 19 + Vite + TypeScript + Tailwind CSS v4;
- React Router and Lucide React;
- `packages/domain` — framework-independent `PoseidonStore`, persistence and selectors;
- Firebase Google sign-in plus Firestore `approvedUsers` allowlist;
- `FirestorePersistence` with `LocalStoragePersistence` offline/write-through shadow;
- Vite PWA/offline shell;
- Vitest + Testing Library + Playwright production acceptance.

Do not restart stack selection or recreate the former external prototype architecture.

## Content and artwork baseline

Current `main` contains:

- Mexican-Caribbean content pack: **3 regions, 24 dive sites/areas, 56 creatures**;
- **30 mapped HD source-catalog entries** from the original art batch;
- editorial state: **30 keep / 0 provisional / 0 remake**;
- all **30 original-batch entries are promoted and live** as canonical runtime HD artwork;
- **26 content species** still have no HD source candidate; #33 owns that exact queue.

Original source revisions remain immutable. #38 / PR #42 supplied and promoted four accepted v2 replacements (spotted eagle ray, spotted trunkfish, Atlantic blue tang and Spanish hogfish). #39 completed the final four immutable v2 replacements (Caribbean cushion sea star, porkfish, queen conch and Caribbean reef octopus). The original 30-entry batch is now **30/30 keep and live**, with no remaining remake state.

PR #43 also locked species-specific generation/review diagnostics for all 26 #33 targets and corrected `honeycomb-cowfish` to accepted **`Acanthostracion polygonium`** before new art metadata is created.

Human art ledger: `docs/CREATURE_ASSET_LIBRARY.md`.
Machine authority: `assets/source/creatures/catalog.json`.
Biological QA authority: `docs/CREATURE_ART_QA_REFERENCES.md`.

## Completed enhancement streams

### #21 — Sunlit Reef brand-system migration — complete

Migrated live UI, PWA chrome and generated icon to the locked Sunlit Reef palette while preserving auth, persistence, domain behavior and navigation.

### #24 — seeded mock-data dev mode — complete

`npm run dev` supports deterministic `0 / 3 / 5 / 15 / 30` personal-history presets through the development badge while preserving a hard zero-Firebase boundary in mock mode.

### #30 — promote approved HD creature art — complete

PR #32 promoted the 18 already-mapped `keep` source candidates through the guarded pipeline.

### #31 mapping and approved-source promotion — complete

PR #35 resolved every former `creatureId: null` candidate through explicit sourced content authority. PR #36 promoted the four newly mapped `keep` sources. The only remaining #31 work is the four #39 biological replacements.

### #38 — remake batch A — complete

PR #42 replaced and promoted spotted eagle ray, spotted trunkfish, Atlantic blue tang and Spanish hogfish. Source/runtime validation and the full repository gate were green.

### #39 / #31 — original HD creature batch — complete

The final Caribbean cushion sea star, porkfish, queen conch and Caribbean reef octopus remakes now use reviewed immutable v2 sources, are `keep`, and are promoted through the guarded runtime pipeline. The original 30-entry source batch is fully resolved at **30 keep / 0 provisional / 0 remake**.

### #11 — source-art system — complete

The original source ZIP was hash-verified and imported. Source byte/SHA metadata, explicit ingestion modes and strict source/runtime validation remain the promotion authority.

### #12 — creature-art curation — complete

Biological/style QA established the original keep/remake split and the rule that wrong or ambiguous art remains blocked rather than being promoted for coverage.

### #15 — personal-history refinement — complete

Derived trip grouping, restrained milestones and richer sourced Creature Detail are merged. Dive history remains canonical; redundant derived state is not persisted.

### #16 — Atlas geodata/map — complete

The first truthful map and sourced starter-region coordinates are merged. Coordinate precision is explicit and missing-coordinate sites remain valid.

### #51 — full curated Marine Collection guide — complete in this change

Collection now joins the full curated creature catalogue from `useCreatures()` with sighting-derived history from `useCollection()` instead of treating history as catalogue membership. All curated creatures are visible by default; `Seen` is derived only from logged sightings; `All / Seen / Not yet seen` composes with search/category; unseen cards use a muted artwork-only field-guide treatment while names remain fully legible; unseen Creature Detail remains open and unmuted; progress uses the runtime curated denominator; user-created creatures appear only with actual history and never affect that denominator. No discovery/unlock state or schema change was added.

The #51 matrix covers zero-history guide rendering, repeated sightings, edit/delete reversion to unseen, search/category/status composition, user-created denominator rules, unseen-detail access and missing-art fallback.

## Active enhancement streams

### #33 — complete HD starter-library coverage

Generate, QA, ingest and promote the exact 26 content species with no HD source candidate. Work in the four diagnostic batches recorded in the issue and `docs/CREATURE_ART_QA_REFERENCES.md`. Biological identity outranks completion percentage.

### #34 — derive transparent creature masters

Only after HD source coverage is stable, batch-remove backgrounds from approved opaque masters into versioned transparent raster specimen revisions. Preserve original masters and manually QA fins, antennae, spines, tentacles, translucent margins and other high-risk edges. Do not auto-trace creature illustrations to SVG.

### #26 — versioning/release system — complete

Root/package version synchronization, embedded product/Git SHA, `CHANGELOG.md`, Release Please configuration and workflow are in place. The first named release, **Poseidon 0.1.0**, was published on 2026-09-13 from `63a601a`. Release Please uses the component-aware tag `poseidon-v0.1.0`; future named releases follow the same convention.

### #14 — owner-device Pixel acceptance

Engineering/deployment acceptance is automated. Keep #14 open until physical Pixel evidence covers standalone launcher behavior, airplane-mode cached launch, real keyboard/cutout/gesture behavior, system Back and practical post-dive use.

## Intended sequence

1. complete #33 HD source coverage;
2. execute #34 transparent-background derivative pass;
3. perform/record #14 physical Pixel acceptance when desired;
4. close parent/status items as appropriate.

## Durable boundaries

- The Dive is canonical personal history.
- Collection seen state, stats, discoveries, trips/milestones and place summaries are derived rather than independently persisted.
- Curated catalogue membership defines the Collection guide; logged sightings define seen state.
- User-created creatures require actual history and never affect curated guide progress.
- UI components consume `PoseidonStore`, not persistence internals.
- Curated marine content is replaceable enrichment, not personal history.
- `assets/source` is editorial input; `assets/creatures` is canonical runtime output.
- Content availability never prevents logging.
- Missing artwork is a first-class state.
- Common names dominate the primary UX.
- No fake rarity.
- Never gamify unsafe diving or wildlife interaction.

## Explicitly later / optional

Unless deliberately promoted into a new issue, photos/GoPro ingestion, PADI integration, dive-computer sync, in-app approval admin UI, social features, technical-diving analytics, global creature completeness, third-party log import and unsourced rarity are not current blockers.
