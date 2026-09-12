# Creature source-art library

This directory is Poseidon's **editorial/source layer**, not runtime artwork.

- `assets/source/creatures/<id>/candidate-vN.webp` — immutable source candidates.
- `assets/source/creatures/catalog.json` — machine-readable inventory, provenance and QA state.
- `assets/creatures/<stable-id>/` — canonical generated runtime manifests and variants.

Application code must never import from `assets/source`. The React/Vite app continues to receive only `assets/creatures` through the existing asset-sync seam.

## Current batch

The first generated library is the 2026-09-07 `poseidon-sunlit-square-v1` batch: 30 normalized 1024×1024 opaque WebP scenes, with the editorial ledger unchanged at **17 keep / 6 provisional / 7 remake**.

Every catalog entry records:

- source candidate ID and immutable path;
- stable content `creatureId`, or `null` for deliberate source-only candidates;
- quality score;
- editorial state (`keep`, `provisional`, `remake`);
- identity confidence;
- explicit `ingestMode`;
- concise QA note;
- byte size and SHA-256 once the binary import is complete.

Batch-level provenance records the generator, date and handoff/batch ID. Scores/status are internal production metadata, not rarity or user-facing progression.

## Source modes and promotion

This batch uses `opaque-scene`. The runtime pipeline separately retains its original `transparent-specimen` mode; alpha checks were not disabled globally.

Only `keep` candidates mapped to an existing content creature may be deliberately promoted. `provisional`, `remake`, and source-only (`creatureId: null`) records are hard-blocked by tooling. Promotion never occurs automatically and does not replace existing runtime art without explicit `--force`.

Use `python -m tools.creature_assets validate-source` for the strict source-library gate. See `docs/ASSET_PIPELINE.md` for import and promotion commands.
