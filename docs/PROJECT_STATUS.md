# Poseidon — current project status

Last reconciled: **2026-09-12**

This is the living programme-status companion to the durable product contracts. It records what is implemented and what remains; it does not replace `PRODUCT.md` or `docs/PRD.md`.

## Current integrated baseline

Poseidon is a deployed React/Vite/TypeScript PWA with Firebase-backed approved-user persistence, offline/local shadow persistence and canonical content/asset pipelines.

Current `main` authority at this reconciliation is:

`e786f3ba8c8c135ef83b93f3839f91ccfbf0e863`

That head includes #30 / PR #32: **18 approved HD creature source candidates are promoted into canonical runtime artwork**.

Application architecture remains:

- npm workspaces;
- `apps/web` — React 19 + Vite + TypeScript + Tailwind CSS v4;
- React Router;
- Lucide React application icons;
- `packages/domain` — framework-independent `PoseidonStore`, persistence and selectors;
- Firebase Google sign-in plus Firestore `approvedUsers` allowlist;
- `FirestorePersistence` with `LocalStoragePersistence` offline/write-through shadow and migration source;
- Vite PWA/offline shell;
- Vitest + Testing Library + Playwright production acceptance;
- canonical repository marine-content and creature-asset pipelines.

Do not restart stack selection or recreate the former external prototype architecture.

## Implemented product baseline

The repository implements Home, four-step Log Dive, site/context reuse, dive metadata, visual and unlisted creature selection, highlights, Journal/Dive Detail edit/delete, Marine Collection, derived trips and milestones, sourced Creature Detail, Atlas/Places plus evidence-backed map coordinates, derived stats/discoveries, offline persistence and migrations, JSON export/validated restore, accessibility/mobile composition, GitHub Pages deployment and PWA install/update/offline behavior.

Production deployment:

`https://benwassa.github.io/poseidon/`

The full gate is:

```bash
npm run gate
```

It covers canonical content/assets, lint/format, typechecks, domain/application tests, production build, PWA precache-budget verification and automated field-readiness acceptance.

## Content and artwork baseline

### On `main`

- Mexican-Caribbean content pack: **3 regions, 24 dive sites/areas, 50 creatures**;
- original HD source batch: **30 immutable 1024×1024 WebPs**;
- editorial state: **22 keep / 0 provisional / 8 remake**;
- #30 promoted the **18** `keep` candidates that were already mapped to content;
- remaining species retain their existing correct runtime/fallback treatment until deliberate promotion.

### Active #31 branch / draft PR #35

#31 has now resolved all six former source-only candidates through explicit content authority rather than weakening asset safeguards:

- `queen-triggerfish` — `Balistes vetula`;
- `longspine-sea-urchin` — `Diadema antillarum`;
- `banded-coral-shrimp` — `Stenopus hispidus`;
- `spotted-drum` — `Eques punctatus`, with the source artwork explicitly retaining a juvenile presentation;
- `caribbean-cushion-sea-star` — `Oreaster reticulatus`;
- `queen-conch` — `Aliger gigas`.

If merged, the starter pack becomes **56 creatures**. All **30/30** original HD source candidates then have deliberate content mappings:

- **22 keep**;
- **8 remake**;
- **18 keep** already promoted by #30;
- **4 newly mapped keep** candidates ready for normal guarded promotion;
- **8 remakes** still blocked until new reviewed source binaries exist.

The exact current content gap remains **26 species with no HD source candidate**. #33 owns that complete-coverage batch. #34 owns transparent-background derivation only after the HD source library is stable.

## Completed enhancement streams

### #21 — Sunlit Reef brand-system migration — complete

Migrated live UI, PWA chrome and generated icon to the locked Sunlit Reef palette while preserving auth, persistence, domain behavior and navigation.

### #24 — seeded mock-data dev mode — complete

`npm run dev` supports deterministic `0 / 3 / 5 / 15 / 30` personal-history presets through the development badge while preserving a hard zero-Firebase boundary in mock mode. Canonical content/assets and normal `PoseidonStore` behavior remain in use.

Durable contract: `docs/DEV_MOCK_DATA.md`.

### #30 — promote approved HD creature art — complete

PR #32 promoted the 18 already-mapped `keep` source candidates through the existing guarded pipeline. Collection, Creature Detail, Log Dive and highlights now resolve those species through canonical HD runtime WebPs.

### #11 — source-art system — complete

The exact original ZIP was hash-verified and imported. All 30 immutable 1024×1024 source WebPs are present with byte/SHA-256 metadata and strict source validation.

### #12 — creature-art curation — complete

Biological/style QA resolved the batch to **22 keep / 0 provisional / 8 remake**. Wrong or ambiguous assets remain blocked.

### #15 — personal-history refinement — complete

Derived trip grouping, restrained milestones and richer sourced Creature Detail are merged. Dive history remains canonical; redundant derived state is not persisted.

### #16 — Atlas geodata/map — complete

The first truthful map and sourced starter-region coordinates are merged. Coordinate precision is explicit and missing-coordinate sites remain valid.

## Active enhancement streams

### #31 — finish the original HD creature batch — active

Current branch: `feat/31-finish-hd-creature-library`

Draft PR: #35

Completed in the current branch:

- corrected stale 51/~20 coverage claims to the audited 50/26 pre-#31 baseline;
- resolved all six former `creatureId: null` candidates with sourced content authority;
- mapped all 30 original source candidates;
- corrected spotted drum to `Eques punctatus`;
- canonicalized queen conch to `Aliger gigas`;
- content/source validation is green for the mapping slice.

Still required before #31 closes:

- promote the four newly mapped `keep` candidates through the existing binary pipeline;
- create immutable replacement source revisions for all eight `remake` candidates;
- biological/style QA those replacements;
- promote only reviewed `keep` replacements;
- full repository gate and rendered mobile review.

### #33 — complete HD starter-library coverage — queued after #31

Generate, QA, ingest and promote the exact 26 current content species that have no HD source candidate. Work in small diagnostic batches; do not trade biological identity for coverage percentage.

### #34 — derive transparent creature masters — queued after #33

Batch-remove backgrounds from approved HD opaque masters into versioned transparent raster specimen revisions. Preserve every original source master. Manually QA fins, antennae, spines, tentacles, translucent margins and other high-risk edges. Do not auto-trace the illustrations to SVG.

### #26 — versioning/release system — infrastructure implemented; bootstrap release pending

Root/package version synchronization, embedded product/Git SHA, `CHANGELOG.md`, Release Please configuration and workflow are in place. The first deliberate `v0.1.0` release remains an owner-controlled bootstrap after the desired acceptance state.

## Field-readiness closeout

### #14 — owner-device Pixel acceptance remains open

Engineering/deployment acceptance is automated. Physical Pixel validation still covers standalone launcher behavior, airplane-mode cached launch, real keyboard/cutout/gesture behavior, system Back and practical post-dive use.

Keep #14 open until owner-device evidence is recorded.

## Intended sequence

1. finish #31 original-batch closeout;
2. complete #33 HD source coverage;
3. execute #34 transparent-background derivative pass;
4. perform/record #14 physical Pixel acceptance when desired;
5. close parent/status items as appropriate;
6. cut the deliberate bootstrap release when the product state is ready.

## Durable boundaries

- The Dive is canonical personal history.
- Collection, stats, discoveries, trips/milestones and place summaries are derived rather than independently persisted.
- UI components consume `PoseidonStore`, not persistence internals.
- Curated marine content is replaceable enrichment, not personal history.
- `assets/source` is editorial input; `assets/creatures` is canonical runtime output.
- Content availability never prevents logging.
- Missing artwork is a first-class state.
- Common names dominate the primary UX.
- No fake rarity.
- Never gamify unsafe diving or wildlife interaction.

## Explicitly later / optional

Unless deliberately promoted into a new issue, do not treat photos/GoPro ingestion, PADI integration, dive-computer sync, in-app approval admin UI, social features, technical-diving analytics, global creature completeness, third-party log import or unsourced rarity as current blockers.
