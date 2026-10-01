# Creature Art Remake Programme

Issue: #60  
Owner review authority: 2026-09-18

## Required execution workflow

All generation/replacement work under this programme must follow `docs/CREATURE_ART_PRODUCTION_WORKFLOW.md`. That workflow is the execution authority for repo preflight, 6-8-species review batches, one independent image/file per species, pre-GitHub owner approval, exact-file publication, immutable candidate revisions, one artwork commit per species, one branch/PR per lane, and post-publication documentation. Where older issue text conflicts with it, the workflow wins.

## Current state

The curated Mexican-Caribbean library contains 56 creatures.

- 40 keep
- 0 provisional
- 16 remake
- 56 mapped source entries
- 56 canonical runtime manifests

The 16 remaining remake decisions are visual/editorial decisions. Existing runtime files remain valid pipeline/history artifacts until a reviewed replacement is promoted, but the application deliberately renders the neutral fallback for these records rather than displaying rejected art.

The original four #60 production lanes contain 34 species. Caribbean reef squid was reclassified from `keep` to `remake` on 2026-09-24 after owner review of its vector-like deployed image, bringing the original remake programme to 35 targets before the partial integration checkpoint below. It is a follow-up outside the original four-lane partition rather than a retroactive lane reassignment.

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

All nine Lane B candidates were subsequently selected as `keep` and promoted through the guarded runtime pipeline in the 2026-10-01 integration checkpoint. Taxonomy remains unchanged.

## 2026-10-01 partial integration checkpoint

Recorded owner-approved artwork was inspected at source and card scale and promoted one species at a time through `promote-source --force`. The catalog now selects 40 keep / 16 remake; 56 runtime manifests remain valid.

The 19 promoted replacements are Lane B's nine (including retained blue tang v3), Lane C's six valid v3 revisions, and spotted eagle ray v3, Caribbean cushion sea star v3, queen conch v3 and Caribbean reef squid v2. Per-entry provenance records approval/publication evidence, exact SHA-256 and previous-candidate metadata.

Remaining work is explicit:

- Lane A: loggerhead sea turtle, Caribbean reef octopus, spotted moray, black grouper and splendid toadfish are recovered v3 review inputs (1254×1254). Owner acceptance and an immutable 1024×1024 normalization revision are pending.
- Lane C: blue chromis, sharpnose puffer and balloonfish require recovery of the exact approved replacements. Their published tiny blobs did not decode and are excluded from the current tree; rejected review-stage art is not a substitute.
- Lane D: all eight final approved images are recorded in issue #65 but their exact bytes are unavailable locally or on the lane branch. Recover those files without regeneration.

The full-library completion/review remains pending. #60 is not complete and #34 remains deferred. Historical branches/commits are retained; stale coordination PR #68 is superseded by this checkpoint.

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

`CLAUDE.md` establishes the original 21 retained design-reference candidates as the durable design-reference set. These are the style authority for #60:

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

The development review page may still export a JSON review snapshot containing browser-pinned references and verdicts for convenience, but those local pins are not a production blocker and do not supersede this 21-image reference set.

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

The PR #67 audit accepted six review-stage candidates unchanged. Their next immutable `candidate-v3.webp` source revisions are valid and preserved on the focused Lane C finalization branch:

- spotted trunkfish
- banded butterflyfish
- foureye butterflyfish
- yellowtail damselfish
- bicolor damselfish
- honeycomb cowfish

Three species required remakes because the PR #67 review-stage images missed locked diagnostics:

- blue chromis — stronger deeply forked, dark-margined caudal identity;
- sharpnose puffer — corrected pointed-snout/body treatment and characteristic yellow/dark tail treatment;
- balloonfish — corrected long erectile spines, dark eye-bar/body blotches and normal swimming presentation.

The approved replacement image bytes for those three are unavailable in a decodable form. Their committed 31/34/31-byte blobs were removed from the current branch tree; the rejected PR #67 review-stage files were not substituted. Publication of those three immutable revisions remains blocked until the exact approved bytes are recovered. Earlier source candidates remain intact.

This lane is therefore **partially published**: six valid immutable candidates are present, three replacements remain pending. The six valid candidates were subsequently selected as `keep` and promoted in the 2026-10-01 integration checkpoint. The three missing replacements retain `remake`; taxonomy remains unchanged.

### Lane D — larger reef fish

1. porkfish
2. bluestriped grunt
3. French grunt
4. bar jack
5. hogfish
6. lionfish
7. mutton snapper
8. rock beauty

The original four lanes total 34 species with no overlap. Caribbean reef squid is the additional follow-up remake described above, bringing the original #60 production set to 35 targets.

## Per-candidate acceptance

Each generated candidate must pass all four dimensions.

### Identity

- correct species;
- locked diagnostic cues visible;
- no wrong-region lookalike;
- credible anatomy at source and card scale.

### Style

- consistent with the 21-image owner design-reference set in `CLAUDE.md`;
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

1. use the 21 `keep` candidates in `CLAUDE.md` as shared style authority;
2. dispatch the four isolated generation lanes plus the Caribbean reef squid follow-up;
3. each lane/follow-up generates and rejects/remakes failures against species diagnostics;
4. collect all 35 accepted replacement candidates without promoting them;
5. review the complete 35-image replacement set together for collection consistency;
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

- the 21-image design-reference set remains durable repository authority;
- all 35 remakes have human-accepted replacements;
- catalog reports 56 keep / 0 provisional / 0 remake;
- every replacement is preserved as an immutable source revision;
- canonical runtime variants are promoted and verified;
- 56 mapped source entries = 56 canonical runtime manifests;
- full repository gate is green;
- asset/status docs are reconciled.

### Current artwork codes and review history

The development-only review page (`npm run dev`, `#/dev/assets`) uses the current
source catalog as its default quality coding. It reloads the catalog every 15
seconds while visible, on returning to the tab, and through **Refresh catalog**.
Keep/Maybe/Remake filters include local overrides; the catalog counts remain
visible separately. The page also identifies whether the creature currently uses
artwork or a fallback in the application.

Local calls are recorded against both the selected source path and SHA-256. A
replacement does not inherit an old override. **Use catalog code** and **Undo**
append history rather than deleting decisions. Each creature's **Coding history**
includes available prior catalog metadata, observed catalog transitions, and
browser review calls. Earlier browser ratings without revision information are
retained as **Revision unknown**, without applying them to the current image.

History is stored in the same browser/origin; the old storage key is preserved.
The version 2 review snapshot exports the current catalog, effective codes,
revision-specific overrides and complete recorded history. These review calls do
not change the committed catalog or promote runtime artwork.
