# Poseidon — current project status

Last reconciled: **2026-09-16**

This is the living programme-status companion to the durable product contracts. It records current implementation and remaining work; it does not replace `PRODUCT.md` or `docs/PRD.md`.

## Current integrated baseline

Current merged `main` authority at this reconciliation:

`327333d18cfe74a96ba1464d620f89cf2362a8bc`

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

Technical and current visual artwork coverage is complete:

- Mexican-Caribbean content pack: **3 regions, 24 dive sites/areas, 56 creatures**;
- **56 mapped source-catalog entries**;
- current owner editorial state: **22 keep / 0 provisional / 34 remake**;
- **56 canonical runtime manifests**, each with deterministic 192/512/1024 WebP variants;
- **0 current content species** without runtime artwork;
- **26/26 former #33 vector/procedural coverage masters replaced under #55 with reviewed realistic raster revisions**.

Owner direction on 2026-09-16 is **realistic HD raster marine-life imagery only**: no new creature SVG/vector art and no acceptance of vector-looking artwork merely because its runtime output is WebP.

The current human visual inventory is therefore:

- **30 original HD-source programme assets** — retained as the realistic-HD baseline unless individual visual QA flags a specific problem;
- **26 former #33 coverage assets** — replaced under #55 with reviewed realistic 1024×1024 raster masters and promoted canonical runtime variants;
- legacy marine-life SVG tooling/fallbacks — deprecated and not part of the approved creature-art inventory.

Original source revisions remain immutable. #38 / PR #42 supplied and promoted four accepted v2 replacements (spotted eagle ray, spotted trunkfish, Atlantic blue tang and Spanish hogfish). #39 completed the final four immutable v2 replacements (Caribbean cushion sea star, porkfish, queen conch and Caribbean reef octopus). That original batch was historically **30/30 keep and live**; the current 2026-09-18 owner review supersedes its editorial states above.

#33 added the 26 previously uncovered content creatures in isolated reviewed batches and closed technical coverage at 56/56. PR #43 locked species-specific generation/review diagnostics for all 26 targets and corrected `honeycomb-cowfish` to accepted **`Acanthostracion polygonium`**. #55 then reused those diagnostic references while replacing every former #33 vector/procedural master with realistic raster art.

Human art inventory and production order: `docs/CREATURE_ASSET_LIBRARY.md`.
Machine provenance authority: `assets/source/creatures/catalog.json`.
Biological QA authority: `docs/CREATURE_ART_QA_REFERENCES.md`.

## Completed enhancement streams

### #21 — Sunlit Reef brand-system migration — complete

Migrated live UI, PWA chrome and generated icon to the locked Sunlit Reef palette while preserving auth, persistence, domain behavior and navigation.

### #24 — seeded mock-data dev mode — complete

`npm run dev` supports deterministic `0 / 3 / 5 / 15 / 30` personal-history presets through the development badge while preserving a hard zero-Firebase boundary in mock mode.

### #30 — promote approved HD creature art — complete

PR #32 promoted the 18 already-mapped `keep` source candidates through the guarded pipeline.

### #31 — original source mapping and closeout — complete

PR #35 resolved every former `creatureId: null` candidate through explicit sourced content authority. PR #36 promoted the four newly mapped `keep` sources. #38 and #39 then supplied the eight required biological replacements, leaving the original batch historically resolved at **30 keep / 0 provisional / 0 remake**. The 2026-09-18 owner review is the current editorial authority.

### #38 — remake batch A — complete

PR #42 replaced and promoted spotted eagle ray, spotted trunkfish, Atlantic blue tang and Spanish hogfish. Source/runtime validation and the full repository gate were green.

### #39 / #31 — original HD creature batch — complete

The final Caribbean cushion sea star, porkfish, queen conch and Caribbean reef octopus remakes use reviewed immutable v2 sources, are `keep`, and are promoted through the guarded runtime pipeline.

### #33 — complete starter-library runtime coverage — complete

All 26 formerly uncovered Mexican-Caribbean content creatures received immutable 1024×1024 source candidates and canonical runtime variants. Completion is defined as **56 content IDs = 56 mapped source entries = 56 canonical runtime manifests**. Biological identity and full/card-scale QA were promotion requirements.

The later owner realism direction did not reopen #33's coverage result; it created the separate #55 visual replacement programme.

### #55 — realistic HD replacement programme — complete on PR #57

All 26 former #33 vector/procedural coverage masters now have reviewed realistic 1024×1024 raster replacement revisions. Each accepted source was preserved as a later immutable candidate, recorded with source/author/license provenance, and promoted one species at a time through strict source validation, guarded runtime promotion and canonical 192/512/1024 validation.

The current curated 56-creature visual baseline no longer depends on vector-derived masters. Legacy creature SVG/procedural tooling remains historical/deprecated only. #34 may now derive transparent raster specimens from approved realistic opaque masters where useful.

### 2026-09-18 owner source-art review

The owner completed a fresh visual review of all 56 source candidates. The catalog now records **22 keep / 34 remake**. `remake` is a source-art production queue, not a runtime rollback: the existing canonical artwork stays live, while source promotion correctly blocks those candidates until an immutable replacement has been reviewed. The complete machine-readable list is `assets/source/creatures/catalog.json`.

### #11 — source-art system — complete

The original source ZIP was hash-verified and imported. Source byte/SHA metadata, explicit ingestion modes and strict source/runtime validation remain the promotion authority.

### #12 — creature-art curation — complete

Biological/style QA established the original keep/remake split and the rule that wrong or ambiguous art remains blocked rather than being promoted for coverage.

### #15 — personal-history refinement — complete

Derived trip grouping, restrained milestones and richer sourced Creature Detail are merged. Dive history remains canonical; redundant derived state is not persisted.

### #16 — Atlas geodata/map — complete

The first truthful map and sourced starter-region coordinates are merged. Coordinate precision is explicit and missing-coordinate sites remain valid.

### #51 — full curated Marine Collection guide — complete

Collection joins the full curated creature catalogue from `useCreatures()` with sighting-derived history from `useCollection()` instead of treating history as catalogue membership. All curated creatures are visible by default; `Seen` is derived only from logged sightings; `All / Seen / Not yet seen` composes with search/category; unseen cards use a muted artwork-only field-guide treatment while names remain fully legible; unseen Creature Detail remains open and unmuted; progress uses the runtime curated denominator; user-created creatures appear only with actual history and never affect that denominator. No discovery/unlock state or schema change was added.

The #51 matrix covers zero-history guide rendering, repeated sightings, edit/delete reversion to unseen, search/category/status composition, user-created denominator rules, unseen-detail access and missing-art fallback.

## Active enhancement streams

### #60 — coherent creature-art remake programme

The 2026-09-18 owner review establishes **22 keep / 0 provisional / 34 remake** as current visual authority. #60 rebuilds those 34 sources into one realistic, clean underwater Poseidon field-guide family.

Style authority is the 22 current `keep` candidates explicitly listed in `CLAUDE.md`; biological authority remains `docs/CREATURE_ART_QA_REFERENCES.md` plus high-confidence species imagery. Four isolated production lanes generate candidates, followed by one cross-library consistency review and one guarded integration/promotion stream.

The development source-art review also exports one snapshot containing browser verdicts and optional pinned reference IDs for review convenience; those local pins do not supersede the 22-image style authority.

Programme authority: `docs/CREATURE_ART_REMAKE_PROGRAMME.md`.

### #34 — derive transparent creature masters

Transparent raster derivation remains valid and may now start from the approved realistic raster masters where the UI benefits from isolation.

Preserve original masters and manually QA fins, antennae, spines, tentacles, translucent margins and other high-risk edges. Never auto-trace creature illustrations to SVG.

### #14 — owner-device Pixel acceptance

Engineering/deployment acceptance is automated. Keep #14 open until physical Pixel evidence covers standalone launcher behavior, airplane-mode cached launch, real keyboard/cutout/gesture behavior, system Back and practical post-dive use.

## Intended sequence

1. use the 22 `keep` design-reference set from `CLAUDE.md` and complete #60's four parallel remake lanes;
2. perform one cross-library QA pass, integrate accepted immutable replacements and return the catalog to 56 keep / 0 provisional / 0 remake;
3. perform #34 transparent-raster derivation only from the newly approved coherent realistic masters where useful;
4. perform/record #14 physical Pixel acceptance when desired;
5. close parent/status items as appropriate;
6. consider creature-count expansion as a separate product decision.

## Durable boundaries

- The Dive is canonical personal history.
- Collection seen state, stats, discoveries, trips/milestones and place summaries are derived rather than independently persisted.
- Curated catalogue membership defines the Collection guide; logged sightings define seen state.
- User-created creatures require actual history and never affect curated guide progress.
- UI components consume `PoseidonStore`, not persistence internals.
- Curated marine content is replaceable enrichment, not personal history.
- `assets/source` is editorial input; `assets/creatures` is canonical runtime output.
- Marine-life artwork uses realistic HD raster masters; no new creature SVG/vector artwork.
- Content availability never prevents logging.
- Missing artwork remains a first-class supported state for future/user-created content and uses neutral fallback rather than pretending a generic species graphic is approved art.
- Common names dominate the primary UX.
- No fake rarity.
- Never gamify unsafe diving or wildlife interaction.

## Explicitly later / optional

Unless deliberately promoted into a new issue, photos/GoPro ingestion, PADI integration, dive-computer sync, in-app approval admin UI, social features, technical-diving analytics, global creature completeness, third-party log import and unsourced rarity are not current blockers.
