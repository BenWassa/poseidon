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
assets/brand/        canonical runtime brand media, including startup film/still
assets/source/brand/ original editorial brand-media masters
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
| Tailwind CSS v4 | Sunlit Reef design tokens live in one CSS authority as named product roles (`canvas`, `shell`, `abyss`, `marine`, `lagoon`, `coral`, `sun`) plus narrowly scoped supporting/semantic tokens. See `docs/BRAND.md`. |
| react-router | Real URLs for every surface, so back behaviour and deep links work rather than being simulated with view state. |
| `FirestorePersistence` (`apps/web/src/firebase`), behind the same injected `PersistenceAdapter` boundary as `LocalStoragePersistence` | Sign-in is now required, and dive history syncs through the diver's Firebase account. `LocalStoragePersistence` remains as an offline write-through shadow and one-time migration source; the adapter being injected (not a rewrite) is what made this a swap in one file, `apps/web/src/data/client.ts`. |
| Firebase Authentication (Google) + Firestore `approvedUsers` allowlist | The whole app is gated behind sign-in; only admin-approved emails get past the gate (approval is a manual Firestore console action, no in-app admin UI). See `firestore.rules` at the repo root. |
| `vite-plugin-pwa` | Offline is a product law, not a nice-to-have. The shell, the content pack and the `thumb`/`gallery` creature variants are precached (`hero.webp` is runtime-cached on first Detail view), so a cold start on a boat with no signal still works — including for an already-signed-in, already-approved diver (see `FirestorePersistence`'s and `AuthProvider`'s doc comments for how the offline fallback is kept safe). The mounted asset trees share Vite's `assets/` directory but not its content-hashed filenames, so `dontCacheBustURLsMatching` in `apps/web/vite.config.ts` is narrowed to the hashed bundles; without that, precached creature art is pinned on an installed device and a promoted asset can never reach it. `npm run test:pwa` holds that line. |
| Vitest + Testing Library | The acceptance scenario is driven through the real application against real persistence, not against mocks. |

Components never import persistence. They read through `useStoreQuery` and write
through `useMutation`, both of which go through the `PoseidonStore` boundary
defined in [`UI_DATA_CONTRACT.md`](UI_DATA_CONTRACT.md). A committed mutation
bumps a revision that reloads every open query.

## Startup and sign-in

The HTML shell paints Poseidon's name immediately on a deep-ocean field before
React or Firebase has loaded. On a signed-out user's first launch in a browser
session, `StartupScreen` then plays the muted portrait startup film and
crossfades to its HD still, with Google sign-in placed over the lower image.
The intro is remembered for the session, has a twelve-second failure fallback,
and is skipped when reduced motion is requested. Approved returning users are
never held behind the film: the authenticated application replaces startup as
soon as approval resolves.

The runtime film and optimized still live under `assets/brand/startup` and are
copied into Vite's ignored/generated public tree by `sync-assets.mjs`. The
original lossless still remains under `assets/source/brand/startup`. Both runtime
files are PWA-precached so an offline signed-out launch still reaches a coherent
welcome surface.

---

# 3. Repository-owned visual media

Poseidon has no network dependency for its core visual language. Creature
imagery and brand media are repository-owned and available through the offline
PWA.

Large surfaces are built from:

- **approved creature artwork** — realistic HD raster sources promoted to
  canonical WebP runtime variants through the guarded asset pipeline;
- **the atlas motif** — deterministic bathymetric contour drawing used behind
  heroes and place cards;
- **place typography** — the site name remains the loudest thing on a dive;
- **aquatic colour** — deep ocean gradients carry memory surfaces.

Remote stock photography is not required at runtime.

---

# 4. Creature artwork and fallback rendering

Canonical creature artwork lives under `assets/creatures/<stable-id>/` and is
produced only from reviewed raster source candidates through
`tools/creature_assets`. The realistic-HD direction established by #55 forbids
new marine-life SVG/vector masters. Historical SVG tooling may remain in the
repository but is not an approved production path.

| Surface | Variant | Size |
| --- | --- | ---: |
| journal creature dots, place grids, review rows | `thumb` | 192px |
| gallery tiles, journal leads | `gallery` | 512px |
| dive hero, creature detail | `hero` | 1024px |

Geometry is reserved from the manifest `aspectRatio` before anything loads, so
artwork resolving never shifts the layout. Everything outside the first screen
is lazily loaded.

**Approved art always wins.** `CreatureImage` no longer contains the temporary
legacy-vector species-ID blacklist. The 26 species replaced under #55 therefore
render their reviewed HD raster variants normally.

**Missing art is a first-class state.** If a requested canonical variant is
missing or fails to load, `CreatureMark` renders a neutral generated raster
silhouette selected by broad morphology. User-created creatures use a
typographic monogram. The silhouette family lives under
`assets/fallbacks/marine-life/`, outside both the source creature catalog and
canonical per-species manifests, so it cannot affect art coverage or Collection
progress.

The generated silhouettes are committed directly as hashed lossless WebP files.
`apps/web/scripts/sync-assets.mjs` copies those ordinary raster
WebP files for dev, tests and production builds. `CreatureMark` uses those
raster WebPs as masks so the mark inherits the existing foreground treatment;
no creature SVG path is rendered.

Fallback URLs use Vite's `BASE_URL`, so they work both at root in development
and under the GitHub Pages `/poseidon/` base path.

See `docs/CREATURE_FALLBACK_SILHOUETTES.md` for the full #58 contract.

---

# 5. Deliberate departures from the external prototype

The prototype was treated as strong design evidence, not as product authority.

## Preserved

Bright light-mode aquatic composition; the locked Sunlit Reef role hierarchy from
`docs/BRAND.md`; generous rounded geometry; translucent sticky chrome; the
central Coral Log Dive action; rich visual creature tiles; ring-plus-check
selection feedback; a large memory-oriented dive detail; energetic but
uncluttered mobile hierarchy.

## Changed, and why

| Prototype | Poseidon | Reason |
| --- | --- | --- |
| `32 Dives`, `14 Regions`, `42 species`, `12 Favorites` | Every number derived from the store | Hard-coded totals are not a personal record. |
| `Favorites` as a core metric | Removed | Not a Poseidon concept. The dive's **highlight creature** is. |
| `Ocean Explorer · Level 4 · 150 Total Known` with a progress bar | Full curated regional field guide with runtime `Seen / Not yet seen` progress | The denominator is the current curated regional catalogue, not a level or score. Seen state is derived strictly from logged sightings; user-created creatures never change the curated denominator. |
| Remote Unsplash photography throughout | Creature artwork, atlas motif, place typography, aquatic colour | See section 3. |
| Fixture creatures from the wrong ocean (reef manta, clown anemonefish, Moorish idol, blue tang from the Pacific) | The sourced Mexican Caribbean pack | Content is researched and provenanced, not decorative. |
| Dive detail showing water temperature and clock time, with a hard-coded `18m` | Date, area, site, max depth, duration, highlight, sightings, note, operator, buddies | Water temperature and time of day are not in the domain model. Depth and duration are, and are real. |
| Two-step logging flow | The PRD's four steps: where and when → basics → what did you see → memory | The prototype's flow omitted area, duration, highlight selection, unlisted creatures and same-day reuse. |
| No way to add an unlisted creature | Always available from the search field | *Content availability must never prevent logging* is a permanent product law. |
| Bottom nav labelled Atlas / Journal / Collection, with Home mislabelled "Your Atlas" | Home / Journal / **Log Dive** / Atlas / Collection | Matches the PRD information architecture. Atlas is a real geographic surface, not the home screen. |
| No Atlas or Creature Detail surfaces | Both implemented | Required by the PRD. |
| Back always returned to Home | Real routes and history-aware back | Navigation must preserve origin context. |
| `<div onClick>` for every control | Semantic buttons and links, labels, `aria-pressed`, 44px targets, visible focus | The prototype is visual inspiration, not an accessibility exemption. |

## Collection derivation

The Collection deliberately joins two existing application reads rather than
introducing a discovery store:

1. `useCreatures()` supplies the complete current catalogue;
2. `useCollection()` supplies `CreatureHistory` derived from canonical dives;
3. the screen joins both by stable creature ID;
4. curated catalogue membership determines the guide denominator;
5. history presence determines `Seen`;
6. user-created creatures enter the view only when a history exists and are
   excluded from the curated denominator.

`All / Seen / Not yet seen`, category filtering and search are derived view
filters. No `locked`, `seen`, `unlocked` or `discovered` flag is persisted.
Unseen presentation is applied only to artwork; names, category labels and state
text retain normal readability. Creature Detail does not inherit the muted card
treatment and remains fully available before first encounter.

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
- Collection discovery filters use semantic buttons with `aria-pressed`; unseen
  state is also written as `Not yet seen`, so desaturation is never the sole cue.
- Touch targets are at least 44px.
- Focus is visible via a token-coloured outline.
- `prefers-reduced-motion` collapses every animation and transition; nothing in
  the product depends on motion to be understood.
- Bottom navigation and the logging flow's action bar respect
  `env(safe-area-inset-bottom)`; headers respect the top inset.
- Phone portrait is the primary target. On a wider screen the app stays a
  centred column against the pale aquatic frame rather than stretching into a
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
app, edit the dive, and delete it behind a safeguard — plus the Collection #51
matrix: zero-history full-guide rendering, runtime curated progress, seen/unseen
transitions, search/category/status composition, user-created denominator rules,
unseen detail access and missing-art fallback.
