# Marine fallback silhouettes

Poseidon uses this asset family only when approved creature artwork is genuinely
missing or fails to load.

## Contract

- Approved canonical creature artwork always wins.
- These files are **neutral fallback marks**, not species art.
- No marine-life SVG, Lucide creature icon or CSS-drawn animal shape is rendered
  by `CreatureImage` / `CreatureMark`.
- User-created creatures keep the typographic monogram fallback.
- The fallback family is outside `assets/creatures/` and the source creature
  catalog, so it cannot affect the curated artwork inventory or Collection
  denominator.

## Raster set

The accepted generated fallback set is committed directly as **384×384 transparent, lossless WebP files** in this directory. `manifest.json` records each file's byte count and SHA-256 hash.

The family is:

- `fish-general`
- `shark`
- `sea-turtle`
- `ray`
- `eel`
- `octopus`
- `squid`
- `crustacean`
- `seahorse`
- `sea-star`
- `sea-urchin`
- `conch`
- `long-fish`

The first generated set was produced as clean transparent silhouettes in the
Poseidon image-generation session. The squid, crustacean and sea-urchin marks
were added from the same generated family direction to close broad taxonomy
coverage. They are intentionally generic.

## Runtime sync

`apps/web/scripts/sync-assets.mjs` copies this repository-owned fallback tree to:

`apps/web/public/assets/fallbacks/marine-life/`

The tests verify that the 13 committed `.webp` files exactly match `manifest.json`, including byte length, SHA-256 and RIFF/WebP signature. There is no encoded transport layer and no SVG reconstruction step.

## Selection

`CreatureMark.silhouetteForCreature()` maps broad content categories to broad
silhouette families. Narrow ID overrides are allowed only when the catalogue
category is materially too broad, currently:

- Caribbean reef squid → `squid`;
- Caribbean cushion sea star → `sea-star`;
- great barracuda → `long-fish`;
- trumpetfish → `long-fish`.

Unknown curated categories resolve to `fish-general`. This is resilience, not
identification.

## Visual treatment

The raster is used as a CSS mask so the same generated silhouette can inherit
the existing light/dark foreground treatment over Poseidon's deterministic
aquatic washes. The mask source itself remains raster; no SVG creature path is
introduced.
