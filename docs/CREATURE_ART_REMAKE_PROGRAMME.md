# Creature Art Remake Programme

Issue: #60  
Owner review authority: 2026-09-18

## Current state

The curated Mexican-Caribbean library contains 56 creatures.

- 22 keep
- 0 provisional
- 34 remake
- 56 mapped source entries
- 56 canonical runtime manifests

The 34 remake decisions are visual/editorial decisions. Existing runtime art remains valid until a reviewed replacement is promoted.

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

The owner's pinned Design References from the development source-art review establish:

- realism level;
- water/light treatment;
- background simplicity;
- framing and subject scale;
- environmental density;
- collection cohesion.

These IDs must be persisted in this document before final production acceptance.

**Owner design-reference IDs:** pending durable export from the existing browser review state.

The development review page exports a single JSON review snapshot containing both `designReferences` and all owner verdicts. Once captured, the selected IDs become durable repository authority here.

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

### Lane D — larger reef fish

1. porkfish
2. bluestriped grunt
3. French grunt
4. bar jack
5. hogfish
6. lionfish
7. mutton snapper
8. rock beauty

Total: 34 species, no overlap.

## Per-candidate acceptance

Each generated candidate must pass all four dimensions.

### Identity

- correct species;
- locked diagnostic cues visible;
- no wrong-region lookalike;
- credible anatomy at source and card scale.

### Style

- consistent with the pinned owner design references;
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

1. lock the owner's exact Design Reference IDs in repo authority;
2. dispatch four isolated generation lanes;
3. each lane generates and rejects/remakes failures against species diagnostics;
4. collect all 34 accepted lane candidates without promoting them;
5. review the complete 34-image set together for collection consistency;
6. send visual outliers back for another generation even if individually attractive;
7. add accepted outputs as new immutable `candidate-vN` source revisions;
8. update catalog status only after human acceptance;
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

- owner design references are durable repository authority;
- all 34 remakes have human-accepted replacements;
- catalog reports 56 keep / 0 provisional / 0 remake;
- every replacement is preserved as an immutable source revision;
- canonical runtime variants are promoted and verified;
- 56 mapped source entries = 56 canonical runtime manifests;
- full repository gate is green;
- asset/status docs are reconciled.
