# Poseidon Creature Asset Library

Last updated: **2026-09-12**

This is the human review ledger for Poseidon creature artwork. The machine-readable authority is [`assets/source/creatures/catalog.json`](../assets/source/creatures/catalog.json). Runtime assets remain under `assets/creatures/` and are produced only through the canonical #11 pipeline.

## Current state

- **30** unique square source candidates in `poseidon-sunlit-square-v1`.
- **22 keep**, **0 provisional**, **8 remake** after the #12 biological-QA pass.
- The exact source binaries are imported and strict source validation is green.
- `keep` means editorially acceptable, not automatically promoted. `remake` is a hard block.
- **#30 (complete):** 18 mapped `keep` candidates are promoted into canonical runtime approved artwork, replacing their prior SVG-derived fallback illustrations: queen-angelfish, hawksbill-sea-turtle, nurse-shark, green-moray, great-barracuda, stoplight-parrotfish, caribbean-reef-squid, caribbean-spiny-lobster, french-angelfish, nassau-grouper, southern-stingray, trumpetfish, longsnout-seahorse, yellowtail-snapper, porcupinefish, schoolmaster-snapper, sergeant-major, green-sea-turtle.
- **#31 (active):** finish the 8 `remake` candidates and resolve all source-only taxonomy mappings before the wider coverage batch.
- **#33:** create and promote HD artwork for every existing starter-catalog creature that currently has no HD source candidate.
- **#34:** only after the HD library is stable, derive transparent raster specimen masters by batch background removal. Do not vector-trace the creature illustrations.

### Exact coverage baseline

The current Mexican-Caribbean content shards contain **50 stable creature IDs**.

Of those 50:

- **24** have a mapped source-art candidate from the original 30-image batch;
- **18** of those 24 are mapped `keep` candidates already promoted by #30;
- **6** mapped candidates are still `remake`;
- **26** current content creatures have no HD source candidate yet.

The original source batch also contains **6 source-only candidates with `creatureId: null`**:

- `queen-triggerfish` — keep;
- `longspine-sea-urchin` — keep;
- `banded-coral-shrimp` — keep;
- `juvenile-spotted-drum` — keep;
- `caribbean-cushion-sea-star` — remake;
- `queen-conch` — remake.

These six require deliberate content authority before promotion; artwork never silently creates taxonomy. If the species are supported as useful Mexican-Caribbean starter content, the catalogue may expand beyond 50 rather than preserving an arbitrary count.

The **26 existing content IDs with no HD source candidate** are:

`balloonfish`, `banded-butterflyfish`, `bar-jack`, `bicolor-damselfish`, `black-grouper`, `blue-chromis`, `bluehead-wrasse`, `bluestriped-grunt`, `doctorfish`, `foureye-butterflyfish`, `french-grunt`, `hogfish`, `honeycomb-cowfish`, `lionfish`, `loggerhead-sea-turtle`, `mutton-snapper`, `ocean-surgeonfish`, `princess-parrotfish`, `queen-parrotfish`, `redband-parrotfish`, `rock-beauty`, `sharpnose-puffer`, `splendid-toadfish`, `spotted-moray`, `yellowhead-wrasse`, `yellowtail-damselfish`.

## #12 biological-QA closeout

The seven original remake targets were regenerated/reviewed first. The generation pass was judged against diagnostic morphology rather than attractiveness. No attempted replacement was allowed to overwrite the cataloged source revision without a durable reviewed source binary.

| Target | Decision | Biological QA |
| --- | --- | --- |
| Spotted eagle ray | **remake** | Attempts improved dorsal spotting/disc shape, but no reviewed replacement source binary is present; original remains blocked. |
| Spotted trunkfish | **remake** | Attempts repeatedly inverted the adult pattern. Target is a pale/whitish boxy fish densely covered in dark spots. |
| Blue tang | **remake** | Attempts drifted to Indo-Pacific `Paracanthurus hepatus`; Poseidon requires Atlantic `Acanthurus coeruleus`. |
| Spanish hogfish | **remake** | Attempts missed the diagnostic adult `Bodianus rufus` yellow/lilac colour division. |
| Caribbean cushion sea star | **remake** | Attempts did not consistently achieve the thick inflated arms/cushion-like `Oreaster reticulatus` form. Source-only until content authority maps it. |
| Porkfish | **remake** | Attempts used too many broad bars; adult `Anisotremus virginicus` needs the characteristic two dark bars plus yellow striping. |
| Queen conch | **remake** | Shell improved, but visible animal anatomy remained insufficient; eyestalks/proboscis matter for an identification-led asset. Source-only until content authority maps it. Current accepted scientific name is `Aliger gigas`; `Strombus gigas` and `Lobatus gigas` remain useful aliases. |

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

The first expansion priority remains the existing `splendid-toadfish` content ID (`Sanopus splendidus`), a conspicuous Cozumel gap. A prior generation attempt was rejected rather than cataloged because it read as a generic toadfish and failed the distinctive head striping/facial-barbel/yellow-fin-margin identity expected for the splendid toadfish. This is the intended failure mode: missing art is preferable to wrong art.

#33 owns complete HD coverage for the current starter catalogue. It works in small biological-QA batches rather than generating the whole gap and reviewing it only at the end.

## Review references

Species decisions were checked against trustworthy identification/reference material, including Smithsonian Tropical Research Institute Greater Caribbean fish records, Florida Museum species accounts, NOAA Fisheries queen-conch material, Smithsonian material for `Oreaster reticulatus`, and the existing Poseidon content-pack provenance. These references are QA evidence; they do not create product rarity or encounter-rate claims.

Key diagnostic checks used in this pass:

- `Lactophrys bicaudalis`: adult pale/whitish body with dense dark spots.
- `Acanthurus coeruleus`: Atlantic blue tang, not Indo-Pacific palette/morphology.
- `Bodianus rufus`: adult Spanish hogfish colour division.
- `Anisotremus virginicus`: two dark bars plus yellow striping.
- `Ginglymostoma cirratum`: mouth barbels and rear-set dorsal fins.
- `Aulostomus maculatus`: extremely elongate body and tubular snout.
- `Sanopus splendidus`: distinctive Cozumel toadfish identity; generic toadfish art is rejected.
- `Aliger gigas`: queen conch should show enough visible soft anatomy to read as the animal, not only a shell.
- `Oreaster reticulatus`: thick, inflated cushion-like arms rather than a generic thin sea-star form.

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
8. Original opaque HD masters remain immutable even after #34 derives transparent specimen revisions.

## Work sequence

1. **#31:** remake the eight blocked originals; resolve all six source-only mappings; promote approved mapped replacements.
2. **#33:** generate, review, ingest and promote the 26 currently missing HD species.
3. **#34:** batch-remove backgrounds from the completed approved HD library, retain the opaque originals, QA alpha/edge failures, and promote transparent specimens only where appropriate.

This ordering prevents duplicated extraction work and keeps biological QA ahead of cosmetic processing.
