# Creature Art Remake Programme

Issue: #60  
Owner review authority: 2026-09-18  
Last reconciled: 2026-09-25

## Required execution workflow

All generation/replacement work under this programme must follow `docs/CREATURE_ART_PRODUCTION_WORKFLOW.md`. That workflow is the execution authority for repo preflight, 6-8-species review batches, one independent image/file per species, pre-GitHub owner approval, exact-file publication, immutable candidate revisions, one artwork commit per species, one branch/PR per lane, and post-publication documentation. Where older issue text conflicts with it, the workflow wins.

## Current state

The curated Mexican-Caribbean library contains 56 creatures.

- 21 keep
- 0 provisional
- 35 remake
- 56 mapped source entries
- 56 canonical runtime manifests

The 35 remake decisions are visual/editorial decisions. Existing runtime files remain valid pipeline/history artifacts until a reviewed replacement is promoted, but the application deliberately renders the neutral fallback for these records rather than displaying rejected art.

The original four #60 production lanes contain 34 species. Caribbean reef squid was reclassified from `keep` to `remake` on 2026-09-24 after owner review of its vector-like deployed image, bringing the active remake total to 35. It is handled as a follow-up outside the original four-lane partition rather than being silently inserted into another lane.

## Target visual family

Poseidon creature art is realistic field-guide artwork, not vector illustration and not an unrelated stock-photo collection.

Every accepted source should read as part of one collection:

- realistic anatomy, surface texture and natural underwater light;
- Mexican-Caribbean / Cozumel / Playa del Carmen plausibility;
- clean, restrained underwater background;
- creature visually dominant and recognizable at card scale;
- enough environmental context to feel alive;
- no flat SVG/vector-like rendering;
- no generic studio cutout;
- no inconsistent documentary/stock composition;
- no text, labels, frames or UI;
- no fantasy colours or invented anatomy;
- varied pose/composition so the collection does not look templated.

Source format remains 1024×1024 opaque raster art.

## Two reference layers

### 1. Style authority

The current `keep` candidates are the durable design-reference set. As of 2026-09-25 there are 21 current keep references; Caribbean reef squid is no longer a keep/style-authority image after its 2026-09-24 reclassification.

Current style-authority set:

- banded coral shrimp
- Caribbean spiny lobster
- French angelfish
- great barracuda
- green moray
- green sea turtle
- hawksbill sea turtle
- juvenile spotted drum
- longsnout seahorse
- longspine sea urchin
- Nassau grouper
- nurse shark
- porcupinefish
- queen angelfish
- queen triggerfish
- schoolmaster snapper
- sergeant major
- southern stingray
- stoplight parrotfish
- trumpetfish
- yellowtail snapper

Together they establish:

- realism level;
- water/light treatment;
- clean underwater background treatment;
- framing and subject scale;
- environmental density;
- texture;
- card-scale readability;
- collection cohesion.

The development review page may still export a JSON review snapshot containing browser-pinned references and verdicts for convenience, but those local pins are not a production blocker and do not supersede the current keep reference set.

### 2. Biological authority

Use `docs/CREATURE_ART_QA_REFERENCES.md`, the current source catalog, and strong species photographs for:

- body form;
- diagnostic markings;
- colour pattern;
- life-stage/phase distinctions;
- species-specific anatomy.

Biological references do not determine the desired Poseidon composition or visual style.

A current photograph can therefore be excellent biological evidence and still require a remake for collection cohesion.

## Parallel production lanes

Production agents own generation and visual/species QA only. They must not edit catalog/runtime state, overwrite source history, promote assets, or touch another lane.

### Lane A — distinctive forms

1. spotted eagle ray
2. loggerhead sea turtle
3. Caribbean reef octopus
4. Caribbean cushion sea star
5. queen conch
6. spotted moray
7. black grouper
8. splendid toadfish

### Lane B — wrasse / surgeon / parrotfish

1. blue tang
2. doctorfish
3. ocean surgeonfish
4. Spanish hogfish
5. bluehead wrasse
6. yellowhead wrasse
7. queen parrotfish
8. princess parrotfish
9. redband parrotfish

### Lane C — compact reef fish

1. spotted trunkfish
2. banded butterflyfish
3. foureye butterflyfish
4. blue chromis
5. yellowtail damselfish
6. bicolor damselfish
7. honeycomb cowfish
8. sharpnose puffer
9. balloonfish

#### Lane C finalization — issue #64

The 2026-09-25 audit of PR #67 is complete and all nine Lane C species now have an approved immutable `candidate-v3.webp` source revision on the focused Lane C finalization branch.

Preserved unchanged from the exact PR #67 review-stage file:

- spotted trunkfish
- banded butterflyfish
- foureye butterflyfish
- yellowtail damselfish
- bicolor damselfish
- honeycomb cowfish

Remade after the PR #67 audit because the review-stage image missed locked diagnostics:

- blue chromis — stronger deeply forked, dark-margined caudal identity;
- sharpnose puffer — corrected pointed-snout/body treatment and characteristic yellow/dark tail treatment;
- balloonfish — corrected long erectile spines, dark eye-bar/body blotches and normal swimming presentation.

These immutable source revisions are production-complete but deliberately **not promoted** here. `assets/source/creatures/catalog.json`, runtime assets/manifests, taxonomy and application content remain unchanged until the later full-library integration pass and cross-library review.

### Lane D — larger reef fish

1. porkfish
2. bluestriped grunt
3. French grunt
4. bar jack
5. hogfish
6. lionfish
7. mutton snapper
8. rock beauty

The original four lanes total 34 species with no overlap. Caribbean reef squid is the additional follow-up remake described above, bringing the active #60 remake set to 35.

## Per-candidate acceptance

Each generated candidate must pass all four dimensions.

### Identity

- correct species;
- locked diagnostic cues visible;
- no wrong-region lookalike;
- credible anatomy at source and card scale.

### Style

- consistent with the current owner keep/reference set;
- realistic without becoming an unrelated stock photograph;
- same clean underwater visual family as accepted Poseidon sources.

### Composition

- subject is clear and dominant;
- uncluttered enough for mobile/card use;
- background supports rather than competes;
- crop does not hide essential diagnostic anatomy.

### Realism

- natural texture, lighting and proportions;
- no flat/vector residue;
- no invented markings or anatomy;
- no excessive painterly/fantasy treatment.

## Production workflow

1. use the current `keep` candidates as shared style authority;
2. dispatch isolated generation lanes/follow-up batches;
3. each lane generates and rejects/remakes failures against species diagnostics;
4. collect all 35 accepted replacement candidates without promoting them prematurely;
5. review the complete replacement set together for collection consistency;
6. send visual outliers back for another generation even if individually attractive;
7. add accepted outputs as new immutable `candidate-vN` source revisions;
8. update catalog status only after human acceptance and centralized integration;
9. promote through the existing guarded pipeline;
10. verify full-size and card-scale runtime rendering;
11. run the full repository gate;
12. reconcile catalog, asset-library and project-status documentation.

## Integration rules

- never overwrite or delete an earlier source candidate;
- do not roll runtime assets back merely because current source status is `remake`;
- one integration stream owns catalog/runtime promotion after the cross-library review;
- do not begin #34 transparent raster derivation during the remake programme;
- no taxonomy or creature-count changes;
- no new creature SVG/vector art.

## Completion

#60 is complete only when:

- the current keep/reference set remains durable repository authority;
- all 35 remakes have human-accepted replacements;
- catalog reports 56 keep / 0 provisional / 0 remake;
- every replacement is preserved as an immutable source revision;
- canonical runtime variants are promoted and verified;
- 56 mapped source entries = 56 canonical runtime manifests;
- full repository gate is green;
- asset/status docs are reconciled.
