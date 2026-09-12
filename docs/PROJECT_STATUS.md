# Poseidon — current project status

Last reconciled: **2026-09-11**

This document is the living programme-status companion to the durable product contracts. It records what is implemented and what remains; it does not replace `PRODUCT.md` or `docs/PRD.md`.

## Current integrated baseline

Poseidon is now a deployed, integrated React/Vite/TypeScript PWA rather than a greenfield/external-front-end project.

Current `main` authority at this reconciliation is commit:

`88928b1e08b34c83809a619f2273c276e41be225`

Current application architecture remains repository authority:

- npm workspaces;
- `apps/web` — React 19 + Vite + TypeScript + Tailwind CSS v4;
- React Router;
- Lucide React for application icons;
- `packages/domain` — framework-independent `PoseidonStore`, persistence and selectors;
- Firebase Google sign-in gates the whole app, enforced by an admin-managed Firestore `approvedUsers` allowlist (console-only approval, no in-app admin UI);
- `FirestorePersistence` behind the injected persistence boundary for approved, signed-in users, with `LocalStoragePersistence` kept as an offline write-through shadow and one-time migration source (see `apps/web/src/firebase`);
- Vite PWA/offline shell;
- Vitest + Testing Library + Playwright production acceptance;
- canonical repository content and creature-asset pipelines.

Do not restart stack selection or recreate the former external prototype architecture.

## Implemented product baseline

The repository currently implements:

- Home;
- four-step Log Dive;
- location/site suggestions and same-day context reuse;
- max depth, duration, operator, buddies and notes;
- visual creature selection;
- arbitrary/unlisted creature creation;
- highlight creature selection;
- Journal and Dive Detail with edit/delete safeguard;
- Marine Collection derived from dives;
- derived trip grouping;
- restrained, history-derived milestones;
- richer sourced Creature Detail while keeping personal encounters primary;
- Atlas/Places history plus the first evidence-backed map;
- sourced/provenanced starter-region coordinates with explicit precision/optionality rules;
- lifetime stats and discoveries derived from canonical dives;
- local/offline persistence and schema migrations;
- structured JSON export;
- validated restore-from-export with explicit merge/replace handling and refusal paths;
- Mexican Caribbean content pack: 3 regions, 24 dive sites/areas and 50 creatures;
- canonical creature `thumb` / `gallery` / `hero` runtime variants;
- 18 existing runtime illustrations and deliberate missing-art fallback;
- accessibility, reduced motion, safe areas and responsive phone/landscape/wide composition;
- reproducible GitHub Pages deployment;
- base-path/hash-route-aware PWA install/update/offline behavior;
- representative PRD and production-field acceptance flows in automated tests;
- rendered production-build evidence under `docs/evidence/`.

Production deployment is live at:

`https://benwassa.github.io/poseidon/`

The current full repository gate is:

```bash
npm run gate
```

It covers canonical content/assets, lint/format, typechecks, domain/application tests, production build, PWA precache-budget verification and automated field-readiness acceptance.

## Active enhancement streams

These are deliberate enhancements on top of the integrated product baseline. They are not new v0 field-readiness blockers unless their issues explicitly say otherwise.

### #21 — Sunlit Reef brand-system migration — open

Migrate the live UI, PWA chrome and current generated icon to the locked Sunlit Reef palette while preserving auth, persistence, domain behavior, navigation and current product structure.

### #24 — temporary seeded mock-data dev mode — scoped, not implemented

Add an explicit development-only path for testing the real application with deterministic `0 / 3 / 5 / 15 / 30` dive histories.

The hard boundary is **zero Firebase initialization in mock mode**: no auth gate, Firestore, Firebase SDK startup or Firebase network traffic. Mock personal history is in-memory only and resets on reload. The seed uses canonical production marine content/assets and normal `PoseidonStore` behavior; only the personal history is synthetic.

Durable implementation contract: `docs/DEV_MOCK_DATA.md`.

## Completed residual streams

Parent: #5

### #11 — source-art system / PR #13 — complete

The exact `poseidon-creature-source-library-2026-09-07.zip` (SHA-256 `d6d1d756bffeb2302e02a55f9a09327fbc5fbf2c806b6fb3e96244e63e11f865`) was verified and imported with the existing importer. All 30 immutable 1024×1024 WebP masters are now present under `assets/source/creatures/<id>/candidate-v1.webp`, `binaryImportStatus` is `complete`, and byte/SHA-256 metadata is populated for every candidate.

The importer's ZIP-member resolution was extended to tolerate a single wrapping root directory (the real bundle's members were nested under `poseidon_library_branch/`) — a path-resolution fix only; every other validation (format, dimensions, alpha-channel-by-mode, immutability, byte/hash matching, post-import full catalog re-validation) is unchanged and covered by an added regression test (26/26 asset-tool tests pass).

Editorial state from completed #12 is preserved exactly: **22 keep / 0 provisional / 8 remake**. No `assets/creatures/**` runtime art was replaced; promotion into runtime remains a separate, deliberate `promote-source` step.

Strict source validation and the full repository gate (`npm run gate`) both pass on the reconciled branch.

### #12 — creature-art curation — complete

Biological/style QA is complete. The original 30-candidate editorial batch is now:

- **22 keep**;
- **0 provisional**;
- **8 remake**.

Unreliable candidates remain blocked from runtime promotion.

### #15 — personal-history refinement — complete

Derived trip grouping, restrained/safe milestones and richer sourced Creature Detail are merged. The Dive remains canonical personal history; redundant derived state is not persisted.

### #16 — Atlas geodata and map — complete

The first truthful map is merged around sourced starter-region coordinates. Coordinate provenance and precision are explicit, missing-coordinate sites remain valid, and core logging/history do not depend on map availability.

## Remaining closeout

### #14 — v0 field readiness — owner-device closeout only

Engineering is complete and deployed. Automated production acceptance covers restore, offline cold start after cache establishment, create/edit/delete, Home/Journal/Collection/Atlas coherence, navigation/Back behavior and export → clean-state restore equivalence.

The remaining acceptance item is the physical Pixel checklist in `docs/FIELD_READINESS.md`, including standalone launcher behavior, airplane-mode launcher cold start, real Android keyboard/cutout/gesture behavior, system Back and practical post-dive use.

Keep #14 open until that owner-device evidence is recorded.

## V0 relationship

The written MVP-A / representative phone scenario in `docs/PRD.md` is implemented on `main`, and the production PWA is live.

Issue #1 remains open for owner-level closeout. The remaining real-world acceptance blocker is #14's physical Pixel validation.

## Durable boundaries

- The Dive is canonical personal history.
- Collection, stats, discoveries, trips/milestones and place summaries should be derived rather than independently persisted.
- UI components consume `PoseidonStore`, not persistence internals.
- Curated marine content is replaceable enrichment, not personal history.
- `assets/source` is editorial input; `assets/creatures` is canonical runtime output.
- Content availability never prevents logging.
- Missing artwork is a first-class state.
- Common names dominate the primary UX.
- No fake rarity.
- Never gamify unsafe diving or wildlife interaction.

## Explicitly later / optional

Unless deliberately promoted into a new issue, do not treat these as current blockers:

- photos / GoPro ingestion;
- PADI integration;
- dive-computer sync;
- an in-app admin UI for approving accounts (console-only for now);
- social features;
- technical-diving analytics;
- broad global creature-art completeness;
- third-party/legacy log import;
- rarity/encounter-significance without trustworthy evidence.
