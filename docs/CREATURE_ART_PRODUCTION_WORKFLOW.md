# Creature Art Production Workflow

This is the required operating workflow for new or replacement Poseidon creature artwork.

Use it together with:
- `CLAUDE.md` for current style authority and project context;
- `docs/CREATURE_ART_QA_REFERENCES.md` for biological diagnostics;
- `docs/CREATURE_ART_REMAKE_PROGRAMME.md` for the active remake queue;
- `docs/CREATURE_ASSET_LIBRARY.md` for human inventory and production status;
- `assets/source/creatures/catalog.json` for machine-readable source provenance.

The default model is:

**Generate + Review -> Publish + Document**

Do not combine owner approval, repository publication and runtime promotion into one step.

## 1. Preflight before generation

Start from fresh current `main` and inspect current repository state before generating anything.

Read the relevant issue and latest comments, open/merged PRs, active lane branch, current catalog, this workflow, style authority and biological QA references.

For every owned species:
- inspect every existing `candidate-vN.webp`, not only the catalog-selected revision;
- inspect any newer review-stage or lane-produced image;
- determine the next unused immutable candidate revision;
- note existing poses/compositions so a new render does not substantially duplicate an older candidate;
- do not regenerate merely because stale issue wording says `remake` when a newer good candidate already exists.

Current repository state overrides stale execution wording.

## 2. Generate in batches of roughly 6-8 species

Work in efficient batches of about 6-8 species unless the task requires a smaller remainder.

The entire assigned batch may be generated in one response/session, but:

**One species = one independent image-generation operation = one independent image file.**

Never generate:
- collages;
- contact sheets;
- grids;
- composite multi-species images;
- a single artifact containing several requested animals.

Each requested species gets its own standalone 1024x1024 image.

Use the current Poseidon `keep` set and any owner-provided examples as visual-family authority. Use species-specific diagnostics and authoritative references as biological authority.

Target:
- realistic anatomy and texture;
- natural sunlit Caribbean underwater lighting;
- clean restrained background;
- strong subject dominance;
- diagnostic markings visible;
- excellent collection-card readability;
- visual cohesion with the approved Poseidon HD family.

Where an older candidate already uses a similar pose, deliberately vary the composition.

## 3. Agent QA before owner review

The agent must catch obvious failures before presenting the batch.

Review every generated image for:
- species identity;
- anatomy and proportions;
- diagnostic colours/markings;
- full-resolution quality;
- card-scale readability;
- Poseidon visual-family consistency;
- clean environmental treatment;
- composition;
- substantial duplication of earlier revisions.

Regenerate obvious failures before showing the owner.

Reject internally:
- wrong species or phase;
- ambiguous identity;
- distorted anatomy;
- missing diagnostic markings;
- vector/SVG-looking rendering;
- studio-cutout presentation;
- excessive clutter;
- generic stock-photo composition;
- substantial duplication of an existing candidate;
- text, labels, borders or frames;
- invented/fantasy anatomy or colour.

## 4. Owner review before GitHub writes

Present the complete generated batch before modifying GitHub.

Show every species separately and clearly identify it. Do not turn the review into a collage.

Include a compact status summary such as:

`species | proposed candidate-vN | QA note`

At this point do not upload, commit, rename, convert or otherwise modify repository files.

The owner approves or rejects images individually.

If some pass and some fail:
- preserve the passing images unchanged;
- remake only the rejected species;
- never regenerate an approved image.

## 5. Publish the exact approved image

After explicit owner approval, publish that exact generated image.

Do not regenerate during the upload step.

Conversion is allowed only when required to satisfy the repository's 1024x1024 WebP source format. Conversion must not visually alter the artwork.

Save as the next immutable revision:

`assets/source/creatures/<species-id>/candidate-vN.webp`

Rules:
- never overwrite an older candidate;
- never reuse a revision number;
- preserve the exact approved visual;
- re-check branch/repo state immediately before writing in case another agent consumed the planned revision.

Approved images do not need to wait for rejected batch-mates. Publish the approved subset, then remake only the failures.

## 6. One artwork commit per approved species

Commit each approved creature separately.

Examples:
- `art: add doctorfish candidate v4`
- `art: add ocean surgeonfish candidate v4`
- `art: add queen parrotfish candidate v4`

Push these commits to the lane branch.

This keeps source history easy to inspect, isolate and revert.

## 7. One branch and one PR per lane

Use one persistent branch for the lane/agent, not one branch per species or review batch.

Example:

`art/issue-63-approved-remakes`

Continue adding individually approved species commits to that branch across successive batches and maintain one focused PR for the lane.

## 8. Document after artwork is safe

After approved artwork commits are safely pushed, update the relevant asset/remake documentation.

Prefer one separate documentation/status commit for the completed review cycle rather than mixing documentation into every artwork commit.

Update the authoritative records that track:
- new candidate revision numbers;
- lane progress/completion;
- approved source-art status;
- remaining remake work;
- issue/PR execution state.

During production do **not** modify:
- `assets/source/creatures/catalog.json` acceptance state;
- runtime assets or manifests;
- taxonomy;
- application content;
- promotion state;

unless the owner explicitly starts the integration/promotion phase.

Owner approval of a source candidate and catalog/runtime promotion are separate stages.

## 9. Re-check before the next batch

Before generating another 6-8 species:
- refresh from current repo state;
- inspect the lane branch;
- check open/merged PRs;
- verify next candidate revision numbers again;
- account for work another agent may have landed;
- remove already-completed species from the generation queue.

Never rely on revision-number assumptions from an earlier session.

## Standard execution instruction

> Work only on the assigned species in this batch, normally 6-8 species.
>
> First inspect fresh current repo state: `main`, the relevant issue and latest comments, merged/open PRs, all existing source candidates for the owned species, `CLAUDE.md`, this workflow, `docs/CREATURE_ART_REMAKE_PROGRAMME.md`, `docs/CREATURE_ART_QA_REFERENCES.md`, and the current source catalog. Determine the next unused immutable revision for every species. Do not regenerate an already-good newer candidate merely because older task wording calls it a remake.
>
> Generate the entire assigned batch in this response/session, but generate every species individually as its own independent 1024x1024 image and file. Never generate a collage, contact sheet, grid, composite, or combined multi-species image.
>
> Match the Poseidon keep-set visual family and locked species diagnostics. Compare every result against all existing revisions for that species. Perform biological, anatomy, markings, realism, card-scale, composition, duplicate-composition and collection-cohesion QA yourself. Regenerate obvious failures before presenting the batch.
>
> Show the owner all completed images separately and clearly identify each species. Include a short `species | proposed candidate-vN | QA note` summary. Stop before modifying GitHub.
>
> After the owner explicitly approves an image, upload that exact generated image without regenerating it. Convert only as required to the repository's 1024x1024 WebP format without visually changing it. Save it as the next immutable `assets/source/creatures/<id>/candidate-vN.webp`. Never overwrite an earlier candidate.
>
> Commit and push each approved species separately. Use one persistent branch and one focused PR for the lane, not a separate branch or PR for each batch.
>
> If some images are approved and others rejected, immediately preserve and publish the approved images, then remake only the rejected species. Never regenerate an approved image.
>
> After the approved artwork commits are safely pushed, update the relevant lane/remake/asset documentation in a separate documentation commit.
>
> Do not modify `catalog.json`, runtime assets/manifests, taxonomy, application content, or promotion state unless the owner explicitly instructs you to begin the integration/promotion phase.
>
> Before beginning another batch, inspect current repo/branch state again to prevent duplicate work or conflicting candidate revision numbers.
