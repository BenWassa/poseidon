# Poseidon

**A beautiful personal atlas of your underwater life.**

Poseidon is a mobile-first recreational dive journal for quickly recording every dive, remembering the creatures encountered, and gradually building a personal atlas and marine-life collection.

Poseidon is primarily a personal product. It is not being optimized for market fit, investor narratives, social-network growth, or professional dive operations. The first standard of success is simple: it should be delightful and useful enough that its owner wants to log every dive and revisit the accumulated history.

## Current status

The first coherent application is implemented and merged to `main`.

The north-star flow works on real local/offline persistence:

`Open app → Log Dive → choose creatures visually → save → Home/Journal → Collection → restart offline → history remains.`

For the current implemented baseline, remaining issues and execution order, read [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md).

The residual programme is tracked under GitHub issue #5. The major current streams are source-art integration/curation, field-ready deployment + restore, personal-history refinement, and sourced Atlas geodata/map work.

## Product shape

- **Dive Journal** — every dive, chronologically recorded and easy to revisit.
- **Marine Collection** — a visual record of creatures encountered across dives.
- **Ocean Atlas** — places, sites, countries and regions explored over time.
- **Dive Detail** — the complete memory of one dive, led by its creature encounters.
- **Milestones** — restrained, meaningful markers of an accumulating underwater life.

The emotional centre is the marine life. The permanent record is the dive.

## Current application

The application implements:

- Home;
- the four-step Log Dive flow;
- Journal + Dive Detail;
- Marine Collection + Creature Detail baseline;
- Atlas/Places baseline;
- arbitrary/unlisted creature logging;
- highlight creatures;
- local/offline persistence and migrations;
- structured JSON export;
- sourced Mexican Caribbean content;
- canonical creature runtime assets and missing-art fallback;
- PWA/offline support;
- accessibility and responsive phone/landscape/wide behavior.

Initial curated content focuses on Cozumel / Playa del Carmen and the Mexican Caribbean without preventing arbitrary dives elsewhere.

## Product reference

Poseidon learns heavily from **Liebestraum** (`BenWassa/liebestraum`) as a product ancestor: personal history is the main character; creation is quick; accumulated memories become the artifact; delight is concentrated in meaningful content rather than decorative UI everywhere.

Poseidon does **not** simply reskin Liebestraum. Its visual language is light, aquatic, saturated and alive: rich ocean blues, greens, coral tones and colourful marine-life artwork.

## Repository shape

```text
apps/web/            mobile-first React/Vite/TypeScript application
packages/domain/     framework-independent domain, persistence, derived history, export
content/             sourced Mexican Caribbean creature/site content pack
assets/creatures/    canonical generated runtime artwork variants and manifests
tools/               content validation, asset pipeline, creature art, app icons
docs/evidence/       rendered screenshots of the production build at phone size
```

The source-art programme in #11 / PR #13 adds `assets/source/creatures/` as an **editorial input layer**. Application code continues to consume only canonical runtime assets from `assets/creatures/`.

### Application architecture

The web app uses React + Vite + strict TypeScript + Tailwind CSS v4 + React Router, with Lucide React for application icons. Components consume the `PoseidonStore` boundary and do not import persistence internals.

See [`docs/APPLICATION.md`](docs/APPLICATION.md) for architecture, mobile behavior and the deliberate departures from the original external prototype.

### Domain foundation

The framework-independent domain and persistence layer lives in `packages/domain/` and implements the `PoseidonStore` boundary from [`docs/UI_DATA_CONTRACT.md`](docs/UI_DATA_CONTRACT.md).

It provides:

- canonical dives + stable sightings;
- user-created creatures;
- local/offline persistence with versioned migrations;
- derived stats, collection/history, discoveries and place summaries;
- deterministic creature suggestions;
- structured JSON export;
- synthetic fixtures isolated behind the `@poseidon/domain/fixtures` subpath.

See [`docs/DOMAIN_ARCHITECTURE.md`](docs/DOMAIN_ARCHITECTURE.md) for persistence and consistency decisions.

### Development

```bash
npm ci
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r tools/creature_assets/requirements.txt
npm run dev     # the application
npm run check   # lint, format check, typecheck, JavaScript tests
npm run gate    # full content, asset, test, build and production-PWA gate
```

Poseidon requires Node 22.12 or newer. Run all npm commands from the repository
root; npm workspaces route them to the domain and web packages.

Regenerate creature artwork or app icons after changing their sources:

```bash
node tools/creature_art/build.mjs
node tools/brand/build.mjs
```

Exercise the built service worker and recapture rendered evidence:

```bash
npm run build && npm run test:pwa
npm run screenshots
```

## Read before building

- [`PRODUCT.md`](PRODUCT.md) — durable product vision and principles
- [`docs/PRD.md`](docs/PRD.md) — MVP and ideal-state product requirements
- [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) — current implemented state and remaining programme
- [`docs/APPLICATION.md`](docs/APPLICATION.md) — current application architecture
- [`docs/UI_DATA_CONTRACT.md`](docs/UI_DATA_CONTRACT.md) — application-facing domain/store seam
- [`docs/CONTENT_AND_ASSETS.md`](docs/CONTENT_AND_ASSETS.md) — marine content and artwork strategy
- [`docs/ASSET_PIPELINE.md`](docs/ASSET_PIPELINE.md) — current runtime asset tooling
- [`AGENTS.md`](AGENTS.md) — implementation-agent operating rules
