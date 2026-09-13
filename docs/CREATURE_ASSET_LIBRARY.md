# Poseidon Creature Asset Library

Last updated: **2026-09-12**

This is the human review ledger for Poseidon creature artwork. The machine-readable authority is [`assets/source/creatures/catalog.json`](../assets/source/creatures/catalog.json). Runtime assets remain under `assets/creatures/` and are produced only through the canonical #11 pipeline.

## Current state

The original `poseidon-sunlit-square-v1` batch has **30 catalog entries**. Original source binaries remain immutable; reviewed replacements create new candidate revisions rather than overwriting `candidate-v1.webp`.

Current editorial state:

- **26 keep**;
- **0 provisional**;
- **4 remake**.

All **30** catalog entries map deliberately to content authority. #31 resolved the former six `creatureId: null` entries by adding sourced Mexican-Caribbean content records rather than weakening the promotion gate.

The live content catalogue contains **56 stable creature IDs**. Of those 56:

- **30** have a mapped HD source-catalog entry;
- **26** mapped candidates are `keep` and are live as canonical runtime HD artwork;
- **4** mapped candidates are `remake` and remain hard-blocked;
- **26** content creatures still have no HD source candidate; #33 owns that complete-coverage batch.

Runtime status:

- **18** mapped `keep` candidates were promoted by #30 / PR #32;
- **4** formerly source-only `keep` candidates were mapped by PR #35 and promoted by PR #36: queen triggerfish, long-spined sea urchin, banded coral shrimp and the juvenile spotted-drum artwork mapped to the species-level `spotted-drum` record;
- **4** biological remakes were completed by #38 / PR #42 and promoted through the guarded pipeline: spotted eagle ray, spotted trunkfish, Atlantic blue tang and Spanish hogfish;
- therefore **all 26 current `keep` catalog entries are live**;
- the four remaining `remake` entries retain correct fallback/runtime art until reviewed replacement source binaries exist.

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

## Completed remake batch A — #38 / PR #42

| Target | Accepted replacement |
| --- | --- |
| Spotted eagle ray | `Aetobatus narinari` silhouette and dorsal spotting corrected; new immutable v2 promoted. |
| Spotted trunkfish | Adult pale body with dense dark spots; prior inverted treatment removed; new immutable v2 promoted. |
| Atlantic blue tang | Corrected to Atlantic `Acanthurus coeruleus`, removing Indo-Pacific `Paracanthurus` patterning; new immutable v2 promoted. |
| Spanish hogfish | Adult `Bodianus rufus` lilac/blue-grey upper and yellow lower-body division restored; new immutable v2 promoted. |

## Remaining blocked remakes — #39

| Target | Biological QA requirement |
| --- | --- |
| Caribbean cushion sea star | Thick, inflated arms and cushion-like `Oreaster reticulatus` form. |
| Porkfish | Characteristic two dark bars plus yellow/silvery-blue striping; reject generic broad-bar grunt treatments. |
| Queen conch | Show visible living-animal anatomy including eyestalks/proboscis, not only a shell. |
| Caribbean reef octopus | Must carry useful `Octopus briareus` identity rather than read as a generic octopus. |

Replacement work creates new immutable candidate revisions. It never overwrites `candidate-v1.webp`.

## Existing content still lacking any HD source candidate

The exact **26-species** #33 queue is:

`balloonfish`, `banded-butterflyfish`, `bar-jack`, `bicolor-damselfish`, `black-grouper`, `blue-chromis`, `bluehead-wrasse`, `bluestriped-grunt`, `doctorfish`, `foureye-butterflyfish`, `french-grunt`, `hogfish`, `honeycomb-cowfish`, `lionfish`, `loggerhead-sea-turtle`, `mutton-snapper`, `ocean-surgeonfish`, `princess-parrotfish`, `queen-parrotfish`, `redband-parrotfish`, `rock-beauty`, `sharpnose-puffer`, `splendid-toadfish`, `spotted-moray`, `yellowhead-wrasse`, `yellowtail-damselfish`.

The species-specific generation/review diagnostics are now locked in `docs/CREATURE_ART_QA_REFERENCES.md` before #33 generation begins.

The six #31 content additions already have source candidates, so expanding the content catalogue from 50 to 56 does **not** enlarge this no-art queue.

## Taxonomy correction discovered during #33 preparation

`honeycomb-cowfish` now uses accepted **`Acanthostracion polygonium`**. The former `Acanthostracion polygonius` spelling is treated as unaccepted by current WoRMS/OBIS/FishBase authority. PR #43 corrected content authority before new source-art metadata is created.

## Review references

Species/content decisions use explicit provenance in `content/mexican-caribbean/manifest.json`. `docs/CREATURE_ART_QA_REFERENCES.md` records the identification authorities and the #33 diagnostic matrix.

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

1. **#39 / #31:** ingest, review and promote the four remaining biological remakes.
2. **#33:** generate, review, ingest and promote the 26 current content creatures with no HD source candidate, using the locked diagnostic matrix.
3. **#34:** only after HD source coverage is stable, batch-remove backgrounds into transparent raster specimen revisions; preserve opaque originals and manually QA difficult alpha edges.

No auto-vector tracing is planned for the creature artwork. The HD illustrations contain texture, shading and fine anatomy better preserved as raster assets.
