# Creature fallback silhouettes

Issue: #58

## Decision

Poseidon's marine-life surfaces use **approved realistic HD raster art whenever
it exists**. A fallback appears only when a runtime artwork variant is missing
or fails to load.

Fallbacks are generated raster silhouettes, not alternate creature artwork.
They must never be treated as evidence that a species has approved art.

## Why

The former fallback paths mixed generic Lucide/SVG symbols and CSS-drawn animal
shapes into the same visual surfaces as approved creature art. That was
technically resilient but visually inconsistent with the realistic raster
direction established by #55.

The previous temporary ID blacklist was also stale after #55: the 26 former
vector-derived species had already received reviewed HD raster replacements,
but `CreatureImage` still suppressed those replacements.

#58 fixes both problems.

## Runtime rules

1. If `creature.artwork.status === 'curated'` and the requested variant exists,
   render that canonical runtime image.
2. Never suppress approved art because of a historical species-ID list.
3. If the image is missing or its load fails, render `CreatureMark`.
4. Curated `CreatureMark` uses a broad generated raster silhouette.
5. User-created `CreatureMark` remains a typographic monogram.
6. No fallback state is persisted.

## Family mapping

| Content shape | Fallback |
| --- | --- |
| Reef fish / unknown | General fish |
| Shark | Shark |
| Ray | Ray |
| Sea turtle | Sea turtle |
| Eel | Eel |
| Cephalopod | Octopus |
| Caribbean reef squid | Squid |
| Crustacean | Crustacean |
| Seahorse | Seahorse |
| Echinoderm | Sea urchin |
| Caribbean cushion sea star | Sea star |
| Mollusk | Conch |
| Great barracuda / trumpetfish | Long fish |

This mapping is deliberately coarse. It improves the placeholder without
pretending to identify a species.

## Asset boundary

The fallback asset family lives under:

`assets/fallbacks/marine-life/`

It is separate from both:

- `assets/source/creatures/` — editorial creature-art provenance;
- `assets/creatures/` — canonical per-species runtime art.

Therefore fallback silhouettes cannot enter the 56-creature art inventory,
promotion pipeline or Collection denominator.

The accepted generated fallback set is stored directly as immutable transparent WebP files under `assets/fallbacks/marine-life/`. `manifest.json` records byte lengths and SHA-256 hashes, while `apps/web/scripts/sync-assets.mjs` copies those exact files into the web application's static asset tree.

## Deployment paths

`CreatureMark` resolves fallback URLs through `import.meta.env.BASE_URL`.
This is required for both root-hosted development and the GitHub Pages
`/poseidon/` base path.

## Test contract

The application suite verifies:

- missing art renders a raster fallback;
- the fallback URL is the repository raster asset path;
- the former vector-era species IDs render approved HD replacements normally;
- failed canonical art switches to the correct broad raster family;
- representative taxonomy mappings, including overrides;
- the committed raster inventory exactly matches the silhouette kinds requested by the application;
- every committed WebP matches its recorded bytes, SHA-256 and WebP signature.

The normal repository gate remains the completion authority.
