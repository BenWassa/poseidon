# Poseidon

**A beautiful personal atlas of your underwater life.**

Poseidon is a mobile-first recreational dive journal for quickly recording every dive, remembering the creatures encountered, and gradually building a personal atlas and marine-life collection.

Poseidon is primarily a personal product. It is not being optimized for market fit, investor narratives, social-network growth, or professional dive operations. The first standard of success is simple: it should be delightful and useful enough that its owner wants to log every dive and revisit the accumulated history.

## Product shape

- **Dive Journal** — every dive, chronologically recorded and easy to revisit.
- **Marine Collection** — a visual record of creatures encountered across dives.
- **Ocean Atlas** — places, sites, countries and regions explored over time.
- **Dive Detail** — the complete memory of one dive, led by its creature encounters.
- **Milestones** — restrained, meaningful markers of an accumulating underwater life.

The emotional centre is the marine life. The permanent record is the dive.

## Initial scope

The first useful version should make it possible to:

1. log every recreational dive quickly;
2. record date, location/site, max depth, duration and optional notes;
3. select creatures from a delightful visual gallery using common names;
4. add a creature even when curated artwork/content does not yet exist;
5. choose a highlight creature for a dive;
6. browse dive history;
7. browse the personal marine-life collection;
8. work reliably in weak/no-network conditions appropriate to boats and travel.

Initial curated content should focus on Cozumel / Playa del Carmen and the Mexican Caribbean without preventing arbitrary dives elsewhere.

## Product reference

Poseidon should learn heavily from **Liebestraum** (`BenWassa/liebestraum`) as a product ancestor: personal history is the main character; creation is quick; accumulated memories become the artifact; delight is concentrated in meaningful content rather than decorative UI everywhere.

Poseidon should **not** simply reskin Liebestraum. Its own visual language should be light, aquatic, saturated and alive: rich ocean blues, greens, coral tones and colourful marine-life artwork.

## Domain foundation

The framework-independent domain and persistence layer lives in `src/` and implements the `PoseidonStore` boundary from `docs/UI_DATA_CONTRACT.md`.

- canonical dives + stable sightings;
- user-created creatures;
- local/offline persistence with versioned migrations;
- derived stats, collection/history, discoveries and place summaries;
- deterministic creature suggestions;
- structured JSON export;
- synthetic dev fixtures isolated behind the `poseidon-domain/fixtures` subpath.

See [`docs/DOMAIN_ARCHITECTURE.md`](docs/DOMAIN_ARCHITECTURE.md) for persistence and consistency decisions.

Development gate:

```bash
npm install
npm run typecheck
npm test
```

## Read before building

- [`PRODUCT.md`](PRODUCT.md) — durable product vision and principles
- [`docs/PRD.md`](docs/PRD.md) — MVP and ideal-state product requirements
- [`docs/UI_DATA_CONTRACT.md`](docs/UI_DATA_CONTRACT.md) — application-facing domain/store seam
- [`docs/CONTENT_AND_ASSETS.md`](docs/CONTENT_AND_ASSETS.md) — marine-life/content and artwork strategy
- [`AGENTS.md`](AGENTS.md) — implementation-agent operating context
