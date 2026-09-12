# Poseidon Creature Asset Library

Last updated: **2026-09-12**

This is the human review ledger for Poseidon creature artwork. The machine-readable authority is [`assets/source/creatures/catalog.json`](../assets/source/creatures/catalog.json). Runtime assets remain under `assets/creatures/` and are produced only through the canonical #11 pipeline.

## Current state

The original `poseidon-sunlit-square-v1` batch contains **30** unique 1024 × 1024 opaque-scene WebP candidates:

- **22 keep**;
- **0 provisional**;
- **8 remake**.

All **30** source candidates now map deliberately to content authority. #31 resolved the former six `creatureId: null` entries by adding sourced Mexican-Caribbean content records rather than weakening the promotion gate.

The live content catalogue contains **56 stable creature IDs**: the prior 50 plus six defensible species represented by the original source-art batch. Of those 56:

- **30** have a mapped HD source candidate;
- **22** mapped candidates are `keep` and are now live as canonical runtime HD artwork;
- **8** mapped candidates are `remake` and remain hard-blocked;
- **26** content creatures still have no HD source candidate; #33 owns that complete-coverage batch.

Runtime status:

- **18** mapped `keep` candidates were promoted by #30 / PR #32;
- **4** formerly source-only `keep` candidates were mapped by PR #35 and promoted by PR #36: queen triggerfish, long-spined sea urchin, banded coral shrimp and the juvenile spotted-drum artwork mapped to the species-level `spotted-drum` record;
- therefore **all 22 original-batch `keep` candidates are live**;
- the eight `remake` entries retain fallback/runtime art until reviewed replacement source binaries exist.

## Content decisions resolved by #31

| Source artwork | Content record | Scientific name | Decision |
| --- | --- | --- | --- |
| Queen triggerfish | `queen-triggerfish` | `Balistes vetula` | Added sourced content record; source is `keep` and promoted. |
| Longspine sea urchin | `longspine-sea-urchin` | `Diadema antillarum` | Added sourced content record; source is `keep` and promoted. |
| Banded coral shrimp | `banded-coral-shrimp` | `Stenopus hispidus` | Added sourced content record; source is `keep` and promoted. |
| Juvenile spotted drum | `spotted-drum` | `Eques punctatus` | Added species-level content record; source metadata preserves the juvenile presentation. Source is `keep` and promoted. |
| Caribbean cushion sea star | `caribbean-cushion-sea-star` | `Oreaster reticulatus` | Added sourced content record; artwork remains `remake`. |
| Queen conch | `queen-conch` | `Aliger gigas` | Added sourced content record using current accepted taxonomy; artwork remains `remake`. |

Queen conch historical names `Strombus gigas` and `Lobatus gigas` remain provenance/taxonomic synonyms; the canonical content scientific name is `Aliger gigas`.

## The eight blocked remakes

| Target | Biological QA requirement |
| --- | --- |
| Spotted eagle ray | Preserve correct disc/head silhouette and convincing dorsal white spotting. |
| Spotted trunkfish | Adult must read pale/whitish with dense dark spots; reject inverted dark-body/white-spot treatments. |
| Blue tang | Must be Atlantic `Acanthurus coeruleus`; reject Indo-Pacific `Paracanthurus hepatus` morphology/pattern. |
| Spanish hogfish | Preserve diagnostic adult `Bodianus rufus` yellow/lilac colour division. |
| Caribbean cushion sea star | Thick, inflated arms and cushion-like `Oreaster reticulatus` form. |
| Porkfish | Characteristic two dark bars plus yellow striping; reject generic broad-bar grunt treatments. |
| Queen conch | Show visible animal anatomy including eyestalks/proboscis, not only a shell. |
| Caribbean reef octopus | Must carry useful `Octopus briareus` identity rather than read as a generic octopus. |

Replacement work creates new immutable candidate revisions. It never overwrites `candidate-v1.webp`.

## Existing content still lacking any HD source candidate

The exact **26-species** #33 queue is:

`balloonfish`, `banded-butterflyfish`, `bar-jack`, `bicolor-damselfish`, `black-grouper`, `blue-chromis`, `bluehead-wrasse`, `bluestriped-grunt`, `doctorfish`, `foureye-butterflyfish`, `french-grunt`, `hogfish`, `honeycomb-cowfish`, `lionfish`, `loggerhead-sea-turtle`, `mutton-snapper`, `ocean-surgeonfish`, `princess-parrotfish`, `queen-parrotfish`, `redband-parrotfish`, `rock-beauty`, `sharpnose-puffer`, `splendid-toadfish`, `spotted-moray`, `yellowhead-wrasse`, `yellowtail-damselfish`.

The six #31 content additions already have source candidates, so expanding the content catalogue from 50 to 56 does **not** enlarge this no-art queue.

## Review references

Species/content decisions use explicit provenance in `content/mexican-caribbean/manifest.json`. Relevant authority includes:

- Smithsonian Tropical Research Institute Shorefishes of the Greater Caribbean for queen triggerfish and spotted drum identity;
- REEF Cozumel records for local occurrence of queen triggerfish and spotted drum;
- CONANP Cozumel management material for `Stenopus hispidus`, `Diadema antillarum` and queen conch under the historical name `Strombus gigas`;
- NOAA Fisheries for current queen-conch taxonomy, Caribbean range and visible anatomy;
- Mexican/UNAM echinoderm literature for `Oreaster reticulatus` in the Mexican Caribbean.

Reference material supports identity and regional plausibility only. Poseidon does not convert abundance, density or conservation material into user-facing rarity or encounter probability.

## Architecture and promotion rules

```text
assets/source/creatures/<id>/candidate-vN.webp  # immutable editorial source revision
assets/creatures/<stable-id>/                   # canonical runtime only
  manifest.json
  thumb.webp
  gallery.webp
  hero.webp
```

1. Source art is versioned; every replacement or derived transparent master creates a new candidate revision.
2. Only `keep` may be deliberately promoted.
3. `remake`, unmapped IDs and missing source binaries are blocked.
4. Promotion must use #11's explicit ingestion mode and atomic replacement safeguards.
5. Application code consumes only canonical runtime manifests/variants.
6. Correct fallback art is preferable to biologically wrong finished art.
7. Scores/status are internal production metadata, never user-facing rarity or progression.
8. Original opaque HD masters remain immutable even after #34 derives transparent specimen revisions.

## Work sequence

1. **#31:** replace and review the eight blocked originals; promote only approved replacements. The mapping and all 22 existing `keep` promotions are complete.
2. **#33:** generate, review, ingest and promote the 26 current content creatures with no HD source candidate.
3. **#34:** only after HD source coverage is stable, batch-remove backgrounds into transparent raster specimen revisions; preserve opaque originals and manually QA difficult alpha edges.

No auto-vector tracing is planned for the creature artwork. The HD illustrations contain texture, shading and fine anatomy better preserved as raster assets.
