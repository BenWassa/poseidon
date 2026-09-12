# Poseidon Creature Asset Library

Last updated: **2026-09-09**

This is the human review ledger for Poseidon creature artwork. The machine-readable authority is [`assets/source/creatures/catalog.json`](../assets/source/creatures/catalog.json). Runtime assets remain under `assets/creatures/` and are produced only through the canonical #11 pipeline.

## Current state

- **30** unique square source candidates in `poseidon-sunlit-square-v1`.
- **22 keep**, **0 provisional**, **8 remake** after the #12 biological-QA pass.
- The source-binary import remains a separate #11 concern; this branch does not bypass its promotion safeguards.
- `keep` means editorially acceptable, not automatically promoted. `remake` is a hard block.

## #12 biological-QA closeout

The seven original remake targets were regenerated/reviewed first. The generation pass was judged against diagnostic morphology rather than attractiveness. No attempted replacement was allowed to overwrite the cataloged source revision without a durable reviewed source binary.

| Target | Decision | Biological QA |
| --- | --- | --- |
| Spotted eagle ray | **remake** | Attempts improved dorsal spotting/disc shape, but no reviewed replacement source binary is present; original remains blocked. |
| Spotted trunkfish | **remake** | Attempts repeatedly inverted the adult pattern. Target is a pale/whitish boxy fish densely covered in dark spots. |
| Blue tang | **remake** | Attempts drifted to Indo-Pacific `Paracanthurus hepatus`; Poseidon requires Atlantic `Acanthurus coeruleus`. |
| Spanish hogfish | **remake** | Attempts missed the diagnostic adult `Bodianus rufus` yellow/lilac colour division. |
| Caribbean cushion sea star | **remake** | Attempts did not consistently achieve the thick inflated arms/cushion-like `Oreaster reticulatus` form. |
| Porkfish | **remake** | Attempts used too many broad bars; adult `Anisotremus virginicus` needs the characteristic two dark bars plus yellow striping. |
| Queen conch | **remake** | Shell improved, but visible animal anatomy remained insufficient; eyestalks/proboscis matter for an identification-led asset. |

All six provisional entries are now resolved:

| Target | Decision | Biological QA |
| --- | --- | --- |
| Nurse shark | **keep** | Barbels, broad flattened head and rear-set dorsal fins are reliably recognizable. |
| Stoplight parrotfish | **keep** | Robust parrotfish body/beak and terminal-phase green/red pattern are sufficient at gallery scale. |
| Caribbean reef squid | **keep** | Elongate mantle and full-length lateral fins read correctly as `Sepioteuthis sepioidea`. |
| Caribbean reef octopus | **remake** | Attractive generic octopus, but not enough `Octopus briareus`-specific identity for the collection. |
| Trumpetfish | **keep** | Extremely elongate body, tubular snout and small posterior fins are diagnostic. |
| Longsnout seahorse | **keep** | Long snout/slender profile are usable; identity remains medium because colour is highly variable. |

## Expansion review

The existing Mexican-Caribbean content shards currently contain **51 stable creature IDs**. #12 did not silently alter taxonomy to make that match the older “50-creature” shorthand.

The first expansion priority was the existing `splendid-toadfish` content ID (`Sanopus splendidus`), a conspicuous Cozumel gap. A generation attempt was rejected rather than cataloged: it read as a generic toadfish and failed the distinctive maze-like head striping/facial-barbel/yellow-fin-margin identity expected for the splendid toadfish. This is the intended failure mode: missing art is preferable to wrong art.

Next reviewed-coverage priorities remain existing content IDs only: parrotfishes, grunts, snappers, wrasses, butterflyfishes and surgeonfishes. New taxonomy requires separate content authority.

## Review references

Species decisions were checked against trustworthy identification/reference material, including Smithsonian Tropical Research Institute Caribbean fish records, Florida Museum species accounts, NOAA Fisheries queen-conch anatomy/material, Smithsonian/Caribbean material for `Oreaster reticulatus`, and the existing Poseidon content pack provenance. These references are QA evidence; they do not create product rarity or encounter-rate claims.

Key diagnostic checks used in this pass:

- `Lactophrys bicaudalis`: adult pale/whitish body with dense dark spots.
- `Acanthurus coeruleus`: Atlantic blue tang, not Indo-Pacific palette/morphology.
- `Bodianus rufus`: adult Spanish hogfish colour division.
- `Anisotremus virginicus`: two dark bars plus yellow striping.
- `Ginglymostoma cirratum`: mouth barbels and rear-set dorsal fins.
- `Aulostomus maculatus`: extremely elongate body and tubular snout.
- `Sanopus splendidus`: distinctive Cozumel toadfish identity; generic toadfish art is rejected.

## Architecture and promotion rules

```text
assets/source/creatures/<id>/candidate-vN.webp  # editorial source
assets/creatures/<stable-id>/                   # canonical runtime only
  manifest.json
  thumb.webp
  gallery.webp
  hero.webp
```

1. Source art is versioned; replacement creates a new candidate revision.
2. Only `keep` can be considered for deliberate promotion.
3. `remake`, source-only IDs and missing source binaries are blocked.
4. Promotion must use #11's explicit ingestion mode and atomic replacement safeguards.
5. Application code consumes only canonical runtime manifests/variants.
6. Correct fallback art is preferable to biologically wrong finished art.
7. Scores/status are internal production metadata, never user-facing rarity or progression.

## Relationship to #11

#12 is editorially complete when all original remake targets have either a stronger durable replacement or remain explicitly blocked, and all provisionals are resolved. It does **not** make PR #13 mergeable by pretending the original 30-image source bundle exists. #11 remains responsible for binary import, hashes, strict source validation and canonical promotion mechanics.
