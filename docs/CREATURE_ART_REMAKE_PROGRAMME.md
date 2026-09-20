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

### 2026-09-19 execution snapshot

The catalog still correctly reports **22 keep / 0 provisional / 34 remake**. That catalog state is the acceptance state, not the remaining-generation count.

- **Lane A / #62 — 8 species:** no unique candidate work exists beyond current `main`; the old branch `art/issue-62-distinctive-form-remakes` is stale/behind and has zero commits ahead of `main`. Full generation remains.
- **Lane B / #63 — 9 species:** PR #66 is merged. All nine new immutable source revisions are already on `main` as `candidate-v3.webp`, except redband parrotfish at `candidate-v4.webp`. They remain unaccepted and unpromoted; this lane now needs visual/species QA and remakes only where required.
- **Lane C / #64 — 9 species:** PR #67 is merged. Nine generated images exist under `assets/review/issue-64/`. They are review-stage files, not final immutable source revisions. This lane must QA each image, remake failures, and push each accepted species under the next `assets/source/creatures/<id>/candidate-vN.webp` name.
- **Lane D / #65 — 8 species:** no unique candidate work exists beyond current `main`; the old branch `art/issue-65-larger-reef-fish-remakes` is stale/behind and has zero commits ahead of `main`. Full generation remains.

Therefore **16 species still require first-pass generation (A + D)**, **9 require review/finalization from review staging (C)**, and **9 already have immutable candidate revisions awaiting collection QA (B)**. Any B/C image that fails biology, realism, composition or collection cohesion returns to generation.

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

Production agents own generation plus visual/species QA and may add **new immutable source revisions for their owned species**. Once a species is fully generated and passes lane QA, the agent should commit and push it under its final next `candidate-vN.webp` name. Agents must not edit catalog/runtime state, overwrite source history, promote assets, change taxonomy/docs, or touch another lane.

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
2. start every lane from fresh current `main` on an isolated branch; stale empty #62/#65 branches are not evidence of completed work;
3. inspect any existing lane output before generating: #63 already has immutable v3/v4 candidates and #64 already has review-stage images;
4. generate or remake each owned species until it passes the locked biological diagnostics plus full-size/card-scale visual QA;
5. when one species is complete, save it directly as the next immutable `assets/source/creatures/<id>/candidate-vN.webp`, then commit and push that species; do not wait to rename files later;
6. for #63, preserve the already-merged v3/v4 revisions and create a later revision only if QA requires a remake;
7. for #64, do not leave accepted work only under `assets/review/issue-64/`; copy/remake accepted outputs into the next immutable source revision before considering that species complete;
8. production lanes do not edit `catalog.json`, runtime manifests/assets, taxonomy, shared docs, or another lane;
9. after all 34 species have a lane-approved immutable candidate, review the complete set together for collection consistency;
10. send biological failures or visual outliers back to the owning lane even if individually attractive;
11. after human acceptance, update catalog status and paths in one integration stream;
12. promote through the existing guarded pipeline, verify full-size/card-scale runtime rendering, run the full repository gate, and reconcile status documentation.

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
