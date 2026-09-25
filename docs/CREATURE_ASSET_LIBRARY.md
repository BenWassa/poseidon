# Poseidon Creature Asset Library

Last updated: **2026-09-24**

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

The curated Mexican-Caribbean catalogue contains **56 stable creature IDs**. Runtime-file coverage is complete; current visual approval and application display are not:

- **56 mapped source-catalog entries**;
- **21 current `keep` entries / 0 `provisional` / 35 `remake`**;
- **56 canonical runtime manifests**;
- each runtime kit contains deterministic `thumb.webp` (192), `gallery.webp` (512) and `hero.webp` (1024);
- **0 current curated creatures are missing runtime artwork**;
- the application displays canonical artwork for the 21 `keep` records and a shared neutral raster silhouette for each of the 35 `remake` records;
- Caribbean reef squid moved to `remake` on 2026-09-24 after the owner flagged its vector-like deployed image; its existing WebP source and runtime variants remain immutable history while the UI shows the squid silhouette;
- #55 replaced the former #33 vector/procedural masters with realistic raster revisions, but the later cross-library review remains the authority for their current `remake` status.

| Inventory group | Count | Current runtime state | Visual direction |
| --- | ---: | --- | --- |
| Original HD source programme | 30 | Canonical WebP variants exist; 21 currently display as approved art and 9 are suppressed as remakes | The current cross-library review, rather than historical promotion, determines display approval. |
| #33 coverage programme | 26 | Realistic raster replacements were promoted under #55, then all 26 were marked `remake` in the current review and render fallbacks | Preserve immutable raster revisions as history; replace and re-review before any future display approval or #34 derivation. |
| Legacy SVG creature tooling/fallbacks | Not part of the 56-source inventory | Repository/tooling/fallback only | **Deprecated for marine-life artwork. Do not create new creature SVGs.** |

Runtime format and source style remain separate questions. The former #33 outputs were technically valid WebP runtime assets but originated from procedural SVG/vector-assisted workflows; #55 replaced all 26 with reviewed realistic raster source revisions.

## #62 Lane A remake production — 2026-09-24

Lane A was checked against every existing v1/v2 source revision before new files were added.

| Creature | New source state | Notes |
| --- | --- | --- |
| Loggerhead sea turtle | `candidate-v3.webp` committed | New HD composition; source candidate only, not promoted. |
| Caribbean reef octopus | `candidate-v3.webp` committed | New reef-context HD composition; source candidate only, not promoted. |
| Spotted moray | `candidate-v3.webp` committed | New bright reef-context HD composition; source candidate only, not promoted. |
| Black grouper | `candidate-v3.webp` committed | New HD composition; source candidate only, not promoted. |
| Splendid toadfish | `candidate-v3.webp` committed | New HD composition retaining the locked dark-head/pale-line/orange-fin diagnostic direction; source candidate only, not promoted. |
| Spotted eagle ray | Pending fresh generation | Latest render was withheld because it repeated the historical v1 visual treatment too closely. |
| Caribbean cushion sea star | Pending fresh generation | Latest render was withheld because it repeated v1 and remained too flat for the inflated cushion form. |
| Queen conch | Pending fresh generation | Latest render was withheld because its composition repeated v1 too closely. |

No catalog status, runtime manifest, taxonomy or promoted asset changed in this production step. The five committed v3 files remain immutable source candidates for the later collection-level review.

## Historical 30-asset realistic-HD programme

These are the original HD-source programme records. The later 2026-09-18 cross-library review is the current authority: 21 remain `keep` and 9 are now `remake`. Preserve every immutable source revision; do not infer current approval from this historical programme list.

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

## #55 realistic-HD replacement programme — technically complete, subsequently re-reviewed

Issue **#55** replaced all **26 #33 coverage assets** with realistic HD raster masters, preserving prior source revisions as immutable history and promoting canonical runtime variants. The 2026-09-18 cross-library review subsequently marked all 26 current source entries `remake`; their runtime files remain for pipeline/history purposes, while the application renders neutral fallbacks until reviewed replacements return to `keep`.

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

## #34 sequencing — transparency follows current approval

Issue #34 may proceed for current `keep` artwork where isolated specimens improve the UI. It must not derive from a `remake` candidate merely because an older canonical runtime file exists:

1. use a currently approved realistic opaque raster master as source authority;
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

1. **#60 — active:** replace and review the 35 `remake` candidates, promoting only accepted immutable revisions until the catalogue returns to 56 `keep`.
2. **#34 — next where useful:** derive transparent raster specimen revisions only from currently approved realistic opaque masters; preserve originals and manually QA difficult alpha edges.
3. Creature-count expansion can be considered separately after the current 56-creature visual family and any desired #34 extraction work are accepted.
