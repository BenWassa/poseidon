# Poseidon — current project status

Last reconciled: **2026-09-07**

This document is the living programme-status companion to the durable product contracts. It records what is implemented and what remains; it does not replace `PRODUCT.md` or `docs/PRD.md`.

## Current integrated baseline

The first coherent Poseidon application is merged to `main` via PR #10. The integration merge commit is:

`08fc5f5fdb3ab4e59df6b4f5d51aa84903bc63ea`

The repository is no longer a greenfield/external-front-end project.

Current application architecture is repository authority:

- npm workspaces;
- `apps/web` — React 19 + Vite + TypeScript + Tailwind CSS v4;
- React Router;
- Lucide React for application icons;
- `packages/domain` — framework-independent `PoseidonStore`, persistence and selectors;
- local-first `LocalStoragePersistence` behind the injected persistence boundary;
- Vite PWA/offline shell;
- Vitest + Testing Library;
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
- Journal;
- Dive Detail with edit/delete safeguard;
- Marine Collection derived from dives;
- Creature Detail baseline;
- Atlas/Places baseline without fabricated coordinates;
- lifetime stats and discoveries derived from canonical dives;
- local/offline persistence and schema migrations;
- structured JSON export;
- Mexican Caribbean content pack: 3 regions, 24 dive sites/areas and 50 creatures;
- canonical creature `thumb` / `gallery` / `hero` runtime variants;
- 18 existing runtime illustrations and deliberate missing-art fallback;
- accessibility, reduced motion, safe areas and responsive phone/landscape/wide composition;
- representative PRD acceptance flow in automated tests;
- rendered production-build evidence under `docs/evidence/`.

The current full repository gate is:

```bash
npm run gate
```

It covers content validation, asset validation, typechecks, domain/application tests and the production build.

## Remaining programme

Parent: #5

### #11 — source-art system / PR #13

Import the prepared 30-image generated source-art library, establish `assets/source/creatures` as a validated editorial layer, and support an explicit opaque-scene ingestion mode without weakening the existing transparent/specimen mode.

Current generated batch: **17 keep / 6 provisional / 7 remake**.

### #12 — creature-art curation

Remake the seven failed candidates, resolve the six provisional candidates with biological QA, prevent duplicates, and expand reviewed coverage toward the 50-creature Mexican Caribbean pack.

### #14 — v0 field readiness

Add reproducible deployment/install, safe restore-from-export, Android/Pixel standalone PWA validation, offline real-device acceptance and real-dive/field validation where practical.

This is the strongest practical threshold before treating Poseidon as the canonical personal log.

### #15 — personal-history refinement

Derived trip grouping, restrained/safe milestones and richer sourced Creature Detail content.

### #16 — Atlas geodata and map

Research and provenance trustworthy starter-region dive-site coordinates, then add a map around the existing truthful Atlas/Place history. Never guess pins.

## V0 relationship

The written MVP-A / representative phone scenario in `docs/PRD.md` is already implemented on `main`.

Issue #1 remains open for owner-level closeout. Product refinement and broader art/map work can continue after the product becomes field-usable.

## Durable boundaries

- The Dive is canonical personal history.
- Collection, stats, discoveries, trips/milestones where practical, and place summaries should be derived rather than independently persisted.
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
- cloud accounts/sync;
- social features;
- technical-diving analytics;
- broad global creature-art completeness;
- third-party/legacy log import;
- rarity/encounter-significance without trustworthy evidence.
