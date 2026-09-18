# Creature source-art library

This directory is Poseidon's **editorial/source layer**, not runtime artwork.

- `assets/source/creatures/<id>/candidate-vN.webp` — immutable source candidates.
- `assets/source/creatures/catalog.json` — machine-readable inventory, provenance and QA state.
- `assets/creatures/<stable-id>/` — canonical generated runtime manifests and variants.

Application code must never import from `assets/source`. The React/Vite app continues to receive only `assets/creatures` through the existing asset-sync seam.

## Current batch

The original 2026-09-07 `poseidon-sunlit-square-v1` library has 30 mapped 1024×1024 opaque-scene entries. That batch previously reached **30 keep / 0 provisional / 0 remake** after focused QA and immutable replacement revisions. The current cross-library owner review is recorded only in `catalog.json`: **22 keep / 0 provisional / 34 remake**. Four entries from #38 and four from #39 use accepted `candidate-v2.webp` revisions; every original `candidate-v1.webp` remains immutable on disk.

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
