# Poseidon Creature Asset Library

Last updated: **2026-09-16**

This is the human inventory and production-order authority for Poseidon creature artwork. The machine-readable provenance authority is [`assets/source/creatures/catalog.json`](../assets/source/creatures/catalog.json). Runtime assets remain under `assets/creatures/` and are produced only through the canonical #11 pipeline.

## Owner visual authority — realistic HD raster only

Marine-life artwork is now governed by a simple product rule:

- approved creature artwork should be **realistic HD raster imagery**;
- new marine-life SVG/vector illustration is not an approved production path;
- a final `.webp` file is not sufficient if its visual source is procedural/vector-looking;
- biological accuracy remains mandatory, but realism, natural texture, underwater lighting and depth are also acceptance requirements;
- legacy SVG creature generators and species-specific vector fallbacks are transitional/deprecated, not inventory to expand;
- SVG remains acceptable for generic UI icons, logos, map symbols and other non-creature interface graphics.

Do not delete immutable historical sources merely because they are superseded. Replace them by adding a new reviewed raster candidate revision and promoting it through the guarded pipeline.

## Inventory snapshot

The curated Mexican-Caribbean catalogue contains **56 stable creature IDs** and is complete for technical coverage:

- **56 mapped source-catalog entries**;
- **56 current `keep` entries**;
- **56 canonical runtime manifests**;
- each runtime kit contains deterministic `thumb.webp` (192), `gallery.webp` (512) and `hero.webp` (1024);
- **0 current curated creatures are missing runtime artwork**.

That technical coverage must now be separated from visual acceptance:

| Inventory group | Count | Current runtime state | Visual direction |
| --- | ---: | --- | --- |
| Original HD source programme | 30 | Live canonical WebP variants | Retain as the current realistic-HD baseline unless individual visual QA flags a replacement. |
| #33 coverage programme | 26 | **7 realistic replacements promoted; 19 vector-derived assets remain** | Continue #55 one species at a time until all 26 use realistic raster masters. |
| Legacy SVG creature tooling/fallbacks | Not part of the 56-source inventory | Repository/tooling/fallback only | **Deprecated for marine-life artwork. Do not create new creature SVGs.** |

The important distinction is that runtime format and source style are different questions. Some #33 outputs are WebP at runtime but were produced from procedural SVG/vector-assisted workflows. They therefore do not satisfy the current realistic-HD visual direction until replaced.

## Current 30-asset realistic-HD baseline

These are the original HD-source programme records. They are **not automatically queued for replacement**; preserve them unless a direct visual review identifies a specific realism or biological problem:

- queen angelfish (`queen-angelfish`)
- hawksbill sea turtle (`hawksbill-sea-turtle`)
- spotted eagle ray (`spotted-eagle-ray`)
- nurse shark (`nurse-shark`)
- green moray (`green-moray`)
- great barracuda (`great-barracuda`)
- stoplight parrotfish (`stoplight-parrotfish`)
- Caribbean reef squid (`caribbean-reef-squid`)
- Caribbean spiny lobster (`caribbean-spiny-lobster`)
- Caribbean reef octopus (`caribbean-reef-octopus`)
- French angelfish (`french-angelfish`)
- spotted trunkfish (`spotted-trunkfish`)
- queen triggerfish (`queen-triggerfish`)
- Nassau grouper (`nassau-grouper`)
- Atlantic blue tang (`blue-tang`)
- southern stingray (`southern-stingray`)
- trumpetfish (`trumpetfish`)
- longsnout seahorse (`longsnout-seahorse`)
- yellowtail snapper (`yellowtail-snapper`)
- porcupinefish (`porcupinefish`)
- longspine sea urchin (`longspine-sea-urchin`)
- banded coral shrimp (`banded-coral-shrimp`)
- schoolmaster snapper (`schoolmaster-snapper`)
- Spanish hogfish (`spanish-hogfish`)
- Caribbean cushion sea star (`caribbean-cushion-sea-star`)
- sergeant major (`sergeant-major`)
- porkfish (`porkfish`)
- queen conch (`queen-conch`)
- spotted drum (`spotted-drum`; source presentation is juvenile spotted drum)
- green sea turtle (`green-sea-turtle`)

The original batch is fully mapped and live. #38 / PR #42 supplied accepted v2 replacements for spotted eagle ray, spotted trunkfish, Atlantic blue tang and Spanish hogfish. #39 supplied accepted v2 replacements for Caribbean cushion sea star, porkfish, queen conch and Caribbean reef octopus. Earlier source revisions remain immutable history.

## #55 realistic-HD replacement programme

The active creature-art production work is **#55 — replace the 26 #33 coverage assets with realistic HD raster masters**.

Do **not** begin by expanding the species count. First bring the current 56-creature catalogue into one coherent realistic visual family.

### Completed — Batch A — 7

The following replacements are now reviewed, immutable source revisions and promoted canonical runtime art:

- banded butterflyfish
- bar jack
- blue chromis
- bluestriped grunt
- hogfish
- queen parrotfish
- sharpnose puffer

Each uses a licensed underwater photograph transformed only by square crop, 1024×1024 resize and WebP encoding; provenance and license are recorded in the source catalog. No generative anatomy edits or vector source path are involved.

### Next — Batch B — 7

- balloonfish
- black grouper
- doctorfish
- foureye butterflyfish
- princess parrotfish
- spotted moray
- yellowtail damselfish

### Batch C — 6

- bicolor damselfish
- French grunt
- honeycomb cowfish
- lionfish
- mutton snapper
- redband parrotfish

### Batch D — 6

- bluehead wrasse
- loggerhead sea turtle
- ocean surgeonfish
- rock beauty
- splendid toadfish
- yellowhead wrasse

For each target:

1. generate or source a new **1024×1024 realistic raster** source candidate;
2. use natural Caribbean underwater lighting, texture and depth rather than flat illustration;
3. keep the creature immediately identifiable and biologically credible;
4. check the locked species diagnostics in `docs/CREATURE_ART_QA_REFERENCES.md` at full and card scale;
5. reject generic/lookalike or vector-looking results immediately;
6. preserve the old candidate revision unchanged;
7. register the accepted replacement as a new immutable candidate revision;
8. promote only reviewed `keep` through the existing guarded pipeline;
9. verify Collection, Log Dive and Creature Detail rendering;
10. run `npm run gate`.

Mexican-Caribbean plausibility and species identity outrank aesthetics. Realism is an additional gate, not a substitute for biological QA.

## #34 sequencing — transparency comes after realistic replacement

Issue #34 remains useful, but its order changes under the realistic-HD direction:

1. finish the #55 realistic replacement for a species;
2. approve/promote the realistic opaque raster master;
3. only then derive a transparent raster specimen from that approved master where the UI benefits from isolation.

Do not spend background-removal/edge-QA effort on a vector-derived master already scheduled for replacement. #34 is raster extraction only; it must never become vector tracing.

## Legacy SVG status

The repository still contains legacy marine-life SVG assets/tooling under `tools/creature_art/svg/` and procedural creature-art generator code. The application also has a `CreatureMark` fallback that uses generic icon/SVG rendering for missing or failed artwork.

These are **not approved creature-art inventory** and must not be used as the basis for new marine-life assets.

For current curated creatures, approved HD runtime art is the intended surface. Missing-art resilience remains required for future/user-created content, but a neutral placeholder/monogram is preferable to presenting a species-specific SVG illustration as approved art.

Legacy files may remain temporarily for history/tests until a focused cleanup proves they are unused. Their presence does not authorize new SVG production.

## Content decisions resolved by #31

| Source artwork | Content record | Scientific name | Decision |
| --- | --- | --- | --- |
| Queen triggerfish | `queen-triggerfish` | `Balistes vetula` | Added sourced content record; source is `keep` and promoted. |
| Longspine sea urchin | `longspine-sea-urchin` | `Diadema antillarum` | Added sourced content record; source is `keep` and promoted. |
| Banded coral shrimp | `banded-coral-shrimp` | `Stenopus hispidus` | Added sourced content record; source is `keep` and promoted. |
| Juvenile spotted drum | `spotted-drum` | `Eques punctatus` | Added species-level content record; source metadata preserves the juvenile presentation. Source is `keep` and promoted. |
| Caribbean cushion sea star | `caribbean-cushion-sea-star` | `Oreaster reticulatus` | Added sourced content record; reviewed v2 is `keep` and promoted. |
| Queen conch | `queen-conch` | `Aliger gigas` | Added sourced content record using current accepted taxonomy; reviewed v2 is `keep` and promoted. |

Queen conch historical names `Strombus gigas` and `Lobatus gigas` remain provenance/taxonomic synonyms; the canonical content scientific name is `Aliger gigas`.

## Taxonomy correction discovered during #33 preparation

`honeycomb-cowfish` uses accepted **`Acanthostracion polygonium`**. The former `Acanthostracion polygonius` spelling is treated as unaccepted by current WoRMS/OBIS/FishBase authority. PR #43 corrected content authority before #33 source metadata was created.

## Review references

Species/content decisions use explicit provenance in `content/mexican-caribbean/manifest.json`. `docs/CREATURE_ART_QA_REFERENCES.md` records the identification authorities and the #33 diagnostic matrix and remains the species-identification authority for #55 replacements.

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

1. Source art is versioned; every replacement or transparent derivative creates a new candidate revision.
2. Marine-life source candidates must be realistic raster art; do not create new creature SVG masters.
3. Only `keep` may be deliberately promoted.
4. `remake`, unmapped IDs and missing source binaries are blocked.
5. Promotion must use #11's explicit ingestion mode and atomic replacement safeguards.
6. Application code consumes only canonical runtime manifests/variants.
7. Correct neutral fallback is preferable to biologically wrong finished art.
8. Scores/status are internal production metadata, never user-facing rarity or progression.
9. Original opaque HD masters remain immutable even after transparent specimen revisions are derived.

## Work sequence

1. **#55 — active:** 7 of 26 realistic replacements are promoted; 19 remain. Continue one species at a time beginning with Batch B.
2. **#34 — after the relevant #55 replacements:** derive transparent raster specimen revisions from the approved realistic opaque masters where useful; preserve opaque originals and manually QA difficult alpha edges.
3. Only after the current 56-creature visual family is coherent should creature-count expansion become the next art-production question.
