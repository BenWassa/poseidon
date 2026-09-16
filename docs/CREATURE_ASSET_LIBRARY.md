# Poseidon Creature Asset Library

Last updated: **2026-09-15**

This is the human review ledger for Poseidon creature artwork. The machine-readable authority is [`assets/source/creatures/catalog.json`](../assets/source/creatures/catalog.json). Runtime assets remain under `assets/creatures/` and are produced only through the canonical #11 pipeline.

## Current state

The live Mexican-Caribbean content catalogue contains **56 stable creature IDs**. After #33 completes, the source and runtime library is closed at:

- **56 mapped HD source-catalog entries**;
- **56 keep**;
- **0 provisional**;
- **0 remake**;
- **56 canonical runtime manifests**;
- **0 current curated content creatures without approved HD runtime art**.

Original source binaries remain immutable. Reviewed replacements create new candidate revisions rather than overwriting earlier source files.

The 56-source library consists of:

- the fully resolved original **30-entry** source batch;
- the **26 #33 coverage entries** generated and reviewed against the locked diagnostic matrix.

All 56 map deliberately to content authority and are live through guarded promotion.

## Original 30-entry source batch

#31 resolved the former six `creatureId: null` entries by adding sourced Mexican-Caribbean content records rather than weakening the promotion gate.

Runtime closeout for that original batch was:

- **18** mapped `keep` candidates promoted by #30 / PR #32;
- **4** formerly source-only `keep` candidates mapped by PR #35 and promoted by PR #36: queen triggerfish, long-spined sea urchin, banded coral shrimp and juvenile spotted-drum artwork mapped to the species-level `spotted-drum` record;
- **4** biological remakes completed by #38 / PR #42 and promoted through the guarded pipeline: spotted eagle ray, spotted trunkfish, Atlantic blue tang and Spanish hogfish;
- the final **4** biological remakes completed by #39 and promoted through the same guarded pipeline: Caribbean cushion sea star, porkfish, queen conch and Caribbean reef octopus.

The original batch is therefore **30 keep / 0 provisional / 0 remake**, with all 30 live as canonical runtime HD artwork.

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

## Completed remake batch A — #38 / PR #42

| Target | Accepted replacement |
| --- | --- |
| Spotted eagle ray | `Aetobatus narinari` silhouette and dorsal spotting corrected; new immutable v2 promoted. |
| Spotted trunkfish | Adult pale body with dense dark spots; prior inverted treatment removed; new immutable v2 promoted. |
| Atlantic blue tang | Corrected to Atlantic `Acanthurus coeruleus`, removing Indo-Pacific `Paracanthurus` patterning; new immutable v2 promoted. |
| Spanish hogfish | Adult `Bodianus rufus` lilac/blue-grey upper and yellow lower-body division restored; new immutable v2 promoted. |

## Completed remake batch B — #39

| Target | Accepted replacement |
| --- | --- |
| Caribbean cushion sea star | Thick inflated five-arm `Oreaster reticulatus` cushion form, broad disc and coarse knobbed/reticulated texture restored in immutable v2; promoted. |
| Porkfish | Deep compressed yellow grunt with exactly two dark head bars and blue/yellow longitudinal striping restored in immutable v2; promoted. |
| Queen conch | Adult flared shell plus visible living eyestalks/proboscis restored in immutable v2; promoted. |
| Caribbean reef octopus | Eight long arms, loose webbing, visible paired suckers, dark eyes and green/blue with red-brown mottling restored in immutable v2; promoted. |

Original `candidate-v1.webp` binaries remain immutable and retained alongside accepted later revisions.

## Completed #33 coverage batch

#33 closed the exact 26-species no-source queue:

`balloonfish`, `banded-butterflyfish`, `bar-jack`, `bicolor-damselfish`, `black-grouper`, `blue-chromis`, `bluehead-wrasse`, `bluestriped-grunt`, `doctorfish`, `foureye-butterflyfish`, `french-grunt`, `hogfish`, `honeycomb-cowfish`, `lionfish`, `loggerhead-sea-turtle`, `mutton-snapper`, `ocean-surgeonfish`, `princess-parrotfish`, `queen-parrotfish`, `redband-parrotfish`, `rock-beauty`, `sharpnose-puffer`, `splendid-toadfish`, `spotted-moray`, `yellowhead-wrasse`, `yellowtail-damselfish`.

All 26 now have accepted immutable 1024×1024 `poseidon-sunlit-square-v1` source candidates, `keep` / high-identity catalog records and canonical runtime promotion.

The final six were:

- `bluehead-wrasse`;
- `loggerhead-sea-turtle`;
- `ocean-surgeonfish`;
- `rock-beauty`;
- `splendid-toadfish`;
- `yellowhead-wrasse`.

The species-specific generation/review diagnostics remain locked in `docs/CREATURE_ART_QA_REFERENCES.md` and are the authority for reviewing any future replacements.

## Taxonomy correction discovered during #33 preparation

`honeycomb-cowfish` uses accepted **`Acanthostracion polygonium`**. The former `Acanthostracion polygonius` spelling is treated as unaccepted by current WoRMS/OBIS/FishBase authority. PR #43 corrected content authority before #33 source metadata was created.

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

1. **#33 — complete:** all 56 current content creatures now have mapped reviewed HD sources and canonical runtime manifests.
2. **#34 — separate next phase:** only when deliberately started, derive transparent raster specimen revisions from approved opaque masters; preserve opaque originals and manually QA difficult alpha edges.

No #34 implementation is part of the #33 closeout. No auto-vector tracing is planned for creature artwork.
