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

The curated Mexican-Caribbean catalogue contains **56 stable creature IDs** and is complete for technical and current visual coverage:

- **56 mapped source-catalog entries**;
- **56 current `keep` entries**;
- **56 canonical runtime manifests**;
- each runtime kit contains deterministic `thumb.webp` (192), `gallery.webp` (512) and `hero.webp` (1024);
- **0 current curated creatures are missing runtime artwork**;
- all **26 former #33 vector/procedural coverage assets now have reviewed realistic raster replacements** under #55.

| Inventory group | Count | Current runtime state | Visual direction |
| --- | ---: | --- | --- |
| Original HD source programme | 30 | Live canonical WebP variants | Retain as the current realistic-HD baseline unless individual visual QA flags a replacement. |
| #33 coverage programme | 26 | **26 realistic replacements promoted; 0 vector-derived masters remain live** | #55 complete. Preserve the approved opaque raster masters as the source authority for any later #34 transparency work. |
| Legacy SVG creature tooling/fallbacks | Not part of the 56-source inventory | Repository/tooling/fallback only | **Deprecated for marine-life artwork. Do not create new creature SVGs.** |

Runtime format and source style remain separate questions. The former #33 outputs were technically valid WebP runtime assets but originated from procedural SVG/vector-assisted workflows; #55 replaced all 26 with reviewed realistic raster source revisions.

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

## #55 realistic-HD replacement programme — complete

Issue **#55** replaced all **26 #33 coverage assets** with reviewed realistic HD raster masters. Every replacement preserves the prior source revision as immutable history, records source/author/license provenance in the machine catalog, and promotes through the guarded canonical runtime pipeline.

### Completed — Batch A — 7

- banded butterflyfish
- bar jack
- blue chromis
- bluestriped grunt
- hogfish
- queen parrotfish
- sharpnose puffer

### Completed — Batch B — 7

- balloonfish
- black grouper
- doctorfish
- foureye butterflyfish
- princess parrotfish
- spotted moray
- yellowtail damselfish

### Completed — Batch C — 6

- bicolor damselfish
- French grunt
- honeycomb cowfish
- lionfish
- mutton snapper
- redband parrotfish

### Completed — Batch D — 6

- bluehead wrasse
- loggerhead sea turtle
- ocean surgeonfish
- rock beauty
- splendid toadfish
- yellowhead wrasse

The 26 replacements use licensed, public-domain, or no-known-copyright-restriction real photography, with provenance and usage status recorded per source in `assets/source/creatures/catalog.json`. Transformations are limited to editorial square crop, 1024×1024 resize and WebP encoding; no generative anatomy edits or new vector source path are involved.

For each replacement, the production contract was:

1. source a biologically credible realistic raster candidate;
2. preserve natural Caribbean or regionally plausible underwater context where available;
3. keep the creature immediately identifiable against the locked diagnostics in `docs/CREATURE_ART_QA_REFERENCES.md`;
4. reject generic/lookalike or vector-looking results;
5. preserve the old candidate revision unchanged;
6. register the accepted replacement as a new immutable candidate revision;
7. promote only reviewed `keep` through the existing guarded pipeline;
8. regenerate and validate canonical 192/512/1024 runtime variants.

Mexican-Caribbean plausibility and species identity outrank aesthetics. Realism is an additional gate, not a substitute for biological QA.

## #34 sequencing — transparency comes after realistic replacement

Issue #34 is now the next creature-art production phase where isolated specimens improve the UI:

1. use the approved #55 realistic opaque raster master as source authority;
2. derive a transparent raster specimen revision without vector tracing;
3. preserve the approved opaque original unchanged;
4. manually QA difficult alpha edges and diagnostic anatomy before promotion.

#34 is raster extraction only; it must never become vector tracing.

## #58 — raster silhouette fallbacks — implemented on PR #59

Issue **#58** moves the missing/failed-art surface fully off marine-life SVG/vector/CSS shapes.

The implementation commits **13 transparent lossless WebP fallback silhouettes** directly under `assets/fallbacks/marine-life/`, each recorded in a SHA-256 manifest:

- general fish;
- shark;
- sea turtle;
- ray;
- eel;
- octopus;
- squid;
- crustacean;
- seahorse;
- sea star;
- sea urchin;
- conch;
- long-bodied fish.

These are broad neutral fallback marks, not species art. They remain outside both `assets/source/creatures/` and `assets/creatures/`, cannot enter the 56-creature art inventory, and never replace approved canonical HD art. User-created creatures continue to use typographic monograms.

`CreatureMark` selects a family deterministically by category, with narrow morphology overrides for Caribbean reef squid, Caribbean cushion sea star, great barracuda and trumpetfish. The raster file is applied as a CSS mask so Poseidon's existing wash/foreground treatment remains intact without reconstructing the animal as SVG or CSS geometry.

The application asset sync copies the committed files into the static tree; tests verify family coverage, file presence, byte counts, SHA-256 hashes, WebP signatures, missing/failed-art fallback and canonical-art precedence.

See `docs/CREATURE_FALLBACK_SILHOUETTES.md`, issue #58 and PR #59.

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

Species/content decisions use explicit provenance in `content/mexican-caribbean/manifest.json`. `docs/CREATURE_ART_QA_REFERENCES.md` records the identification authorities and the #33 diagnostic matrix and remains the species-identification authority for #55 replacements and later derivatives.

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

1. **#55 — complete:** all 26 former #33 coverage assets now have reviewed realistic raster masters and validated canonical runtime variants.
2. **#34 — next where useful:** derive transparent raster specimen revisions from the approved realistic opaque masters; preserve opaque originals and manually QA difficult alpha edges.
3. Creature-count expansion can be considered separately after the current 56-creature visual family and any desired #34 extraction work are accepted.
