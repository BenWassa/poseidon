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

The 34 remake decisions are visual/editorial decisions. Existing runtime files remain valid pipeline/history artifacts until a reviewed replacement is promoted, but the application deliberately renders the neutral fallback for these records rather than displaying rejected art.

### 2026-09-24 lane B / #63 approved-candidate snapshot

Lane B has completed its species audit and owner-approved correction pass. Immutable source history is preserved.

- blue tang — **PASS**, retain `assets/source/creatures/blue-tang/candidate-v3.webp`;
- doctorfish — **REMADE**, `assets/source/creatures/doctorfish/candidate-v4.webp`;
- ocean surgeonfish — **REMADE**, `assets/source/creatures/ocean-surgeonfish/candidate-v4.webp`;
- Spanish hogfish — **REMADE**, `assets/source/creatures/spanish-hogfish/candidate-v4.webp`;
- bluehead wrasse — **REMADE**, `assets/source/creatures/bluehead-wrasse/candidate-v4.webp`;
- yellowhead wrasse — **REMADE**, `assets/source/creatures/yellowhead-wrasse/candidate-v4.webp`;
- queen parrotfish — **REMADE**, `assets/source/creatures/queen-parrotfish/candidate-v4.webp`;
- princess parrotfish — **REMADE**, `assets/source/creatures/princess-parrotfish/candidate-v4.webp`;
- redband parrotfish — **REMADE**, `assets/source/creatures/redband-parrotfish/candidate-v5.webp`.

These are source candidates only. `catalog.json`, runtime assets/manifests, taxonomy and promotion state remain unchanged. Final catalog/runtime promotion stays centralized after cross-library review.

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

`CLAUDE.md` already establishes the 22 current `keep` candidates as the durable design-reference set. These are the style authority for #60:

- banded coral shrimp
- Caribbean reef squid
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

The development review page may still export a JSON review snapshot containing browser-pinned references and verdicts for convenience, but those local pins are not a production blocker and do not supersede this 22-image reference set.

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

- consistent with the 22-image owner design-reference set in `CLAUDE.md`;
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

1. use the 22 `keep` candidates in `CLAUDE.md` as shared style authority;
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

- the 22-image design-reference set remains durable repository authority;
- all 34 remakes have human-accepted replacements;
- catalog reports 56 keep / 0 provisional / 0 remake;
- every replacement is preserved as an immutable source revision;
- canonical runtime variants are promoted and verified;
- 56 mapped source entries = 56 canonical runtime manifests;
- full repository gate is green;
- asset/status docs are reconciled.
