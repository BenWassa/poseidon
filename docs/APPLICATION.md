# Poseidon — application architecture and design decisions

This document covers the first coherent Poseidon application: how it is put
together, and where it deliberately departs from the external visual prototype
that motivated it.

---

# 1. Repository shape

Poseidon is an npm workspaces monorepo.

```text
packages/domain/     framework-independent domain, persistence, derived history, export
apps/web/            the mobile-first application
content/             marine content pack (creatures, sites, regions, provenance)
assets/creatures/    generated creature artwork variants + manifests
tools/creature_art/  hand-authored SVG source art and its build
tools/creature_assets/  the ingestion/validation pipeline that owns assets/creatures
tools/brand/         application icon generation
docs/evidence/       rendered screenshots of the production build at phone size
```

One gate covers all of it:

```bash
npm ci
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r tools/creature_assets/requirements.txt
npm run gate      # content + asset validation, typecheck, tests, production build
npm run dev       # the application
```

---

# 2. Stack, and why

| Choice | Reason |
| --- | --- |
| React + Vite + TypeScript | The prototype already expressed itself in this vocabulary; the toolchain is boring, fast and well supported. |
| Tailwind CSS v4 | Design tokens live in one CSS file as named product roles (`canvas`, `ocean`, `marine`, `lagoon`, `coral`), not as hex values scattered through components. |
| react-router | Real URLs for every surface, so back behaviour and deep links work rather than being simulated with view state. |
| `LocalStoragePersistence` from the domain package | Synchronous, universally available, survives restart, needs no account. A lifetime of dives is kilobytes. The adapter is injected, so IndexedDB or an optional sync layer is a change in one file. |
| `vite-plugin-pwa` | Offline is a product law, not a nice-to-have. The shell, the content pack and every creature variant are precached, so a cold start on a boat with no signal still works. |
| Vitest + Testing Library | The acceptance scenario is driven through the real application against real persistence, not against mocks. |

Components never import persistence. They read through `useStoreQuery` and write
through `useMutation`, both of which go through the `PoseidonStore` boundary
defined in [`UI_DATA_CONTRACT.md`](UI_DATA_CONTRACT.md). A committed mutation
bumps a revision that reloads every open query.

---

# 3. No photography

The prototype leaned on remote Unsplash imagery for its hero, journal rows,
dive detail and creature tiles. Poseidon is explicitly not a photo-management
product, and a product that needs stock photography to look finished is not
finished.

Every large surface is therefore built from:

- **creature artwork** — transparent WebP, from the repository's own pipeline;
- **the atlas motif** — a bathymetric contour drawing used behind heroes and
  place cards, rendered as inline SVG, deterministic per record;
- **place typography** — the site name is the loudest thing on a dive;
- **aquatic colour** — deep ocean gradients carry the memory surfaces.

There is no network dependency anywhere in the product's core visual language.

---

# 4. Creature artwork

Artwork is authored as hand-written SVG in `tools/creature_art`, rasterised
with Chromium, and ingested through the existing `tools/creature_assets`
pipeline. The application only ever consumes the pipeline's output.

```bash
node tools/creature_art/build.mjs            # all creatures
node tools/creature_art/build.mjs lionfish   # one creature
```

The full asset contract is exercised in the product:

| Surface | Variant | Size |
| --- | --- | ---: |
| journal creature dots, place grids, review rows | `thumb` | 192px, ~4.7 KiB |
| gallery tiles, journal leads | `gallery` | 512px, ~14.6 KiB |
| dive hero, creature detail | `hero` | 1024px, ~22.6 KiB |

Geometry is reserved from the manifest's `aspectRatio` before anything loads, so
artwork resolving never shifts the layout. Everything outside the first screen is
lazily loaded.

**Missing art is a first-class state.** 18 of the 50 creatures in the content
pack are illustrated. The rest render `CreatureMark`: a deterministic aquatic
wash with a category glyph, or a typographic monogram for a creature the diver
typed in themselves. A variant that fails to load falls back to the same mark,
so a broken image cannot reach the screen.

Because the artwork is transparent, tiles show it on its own wash — that plate is
what gives the collection its colour. Surfaces with a background of their own
(the dive hero) pass `plate={false}` so the artwork floats instead.

---

# 5. Deliberate departures from the external prototype

The prototype was treated as strong design evidence, not as product authority.

## Preserved

Bright light-mode aquatic canvas; deep ocean teal typography; coral as the
interaction accent; mint supporting accents; generous rounded geometry;
translucent sticky chrome; the central coral Log Dive action; rich visual
creature tiles; the coral-ring-plus-check selection feedback; a large
memory-oriented dive detail; energetic but uncluttered mobile hierarchy.

## Changed, and why

| Prototype | Poseidon | Reason |
| --- | --- | --- |
| `32 Dives`, `14 Regions`, `42 species`, `12 Favorites` | Every number derived from the store | Hard-coded totals are not a personal record. |
| `Favorites` as a core metric | Removed | Not a Poseidon concept. The dive's **highlight creature** is. |
| `Ocean Explorer · Level 4 · 150 Total Known` with a progress bar | `21 creatures across 2 places and 9 dives` | The collection is what the owner has actually encountered, not a score against a catalogue. No levels, no global denominator, no rarity. |
| Remote Unsplash photography throughout | Creature artwork, atlas motif, place typography, aquatic colour | See section 3. |
| Fixture creatures from the wrong ocean (reef manta, clown anemonefish, Moorish idol, blue tang from the Pacific) | The sourced Mexican Caribbean pack | Content is researched and provenanced, not decorative. |
| Dive detail showing water temperature and clock time, with a hard-coded `18m` | Date, area, site, max depth, duration, highlight, sightings, note, operator, buddies | Water temperature and time of day are not in the domain model. Depth and duration are, and are real. |
| Two-step logging flow | The PRD's four steps: where and when → basics → what did you see → memory | The prototype's flow omitted area, duration, highlight selection, unlisted creatures and same-day reuse. |
| No way to add an unlisted creature | Always available from the search field | *Content availability must never prevent logging* is a permanent product law. |
| Bottom nav labelled Atlas / Journal / Collection, with Home mislabelled "Your Atlas" | Home / Journal / **Log Dive** / Atlas / Collection | Matches the PRD information architecture. Atlas is a real geographic surface, not the home screen. |
| No Atlas or Creature Detail surfaces | Both implemented | Required by the PRD. |
| Back always returned to Home | Real routes and history-aware back | Navigation must preserve origin context. |
| `<div onClick>` for every control | Semantic buttons and links, labels, `aria-pressed`, 44px targets, visible focus | The prototype is visual inspiration, not an accessibility exemption. |

## The Atlas, specifically

The content pack deliberately carries no coordinates, because credible sourced
coordinates for recreational dive sites were not available. Poseidon therefore
does not draw a pin map it cannot support. The Atlas shows what is true: places,
the sites within them, the dives logged there and the creatures met — with an
explicit note that a map will follow real coordinates. A strong region view is
better than a fake pin map.

---

# 6. Accessibility and mobile behaviour

- Every control is a real `button`, `a`, `input` or `textarea` with an accessible name.
- Creature selection is communicated by the coral ring, a check badge **and**
  `aria-pressed` — never by colour alone.
- Touch targets are at least 44px.
- Focus is visible via a token-coloured outline.
- `prefers-reduced-motion` collapses every animation and transition; nothing in
  the product depends on motion to be understood.
- Bottom navigation and the logging flow's action bar respect
  `env(safe-area-inset-bottom)`; headers respect the top inset.
- Phone portrait is the primary target. On a wider screen the app stays a
  centred column against the tide-blue frame rather than stretching into a
  desktop dashboard.
- Images carry intrinsic `width`/`height` and sit in aspect-ratio boxes, so
  lazy loading never moves the page under a thumb.

Rendered checks for all of the above live in [`evidence/`](evidence), captured
from the production build by `apps/web/scripts/capture-screens.mjs`.

---

# 7. Testing

`npm run gate` runs, in order:

1. `tools/validate_content.py` — marine content pack schema and integrity;
2. `python -m tools.creature_assets validate` — asset manifests, hashes, budgets;
3. typecheck of both workspaces;
4. the domain package's persistence/migration/derived-state tests;
5. the application's tests;
6. the production build.

The application suite covers the representative acceptance scenario from
`docs/PRD.md` §14 end to end — create a Cozumel dive, enter depth and duration,
select real local creatures, add an unlisted creature, choose a highlight, save,
verify Home, Journal, Dive Detail, Collection and Creature Detail, restart the
app, edit the dive, and delete it behind a safeguard — plus empty and sparse
history, missing and failing artwork, unit memory, and the content/asset seam.
