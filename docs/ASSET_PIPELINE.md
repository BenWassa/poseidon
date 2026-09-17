# Poseidon creature asset pipeline

This tooling owns canonical runtime creature artwork under `assets/creatures`. Editorial/generated masters live separately under `assets/source/creatures` and are never application inputs.

Poseidon's creature imagery falls into three operational categories: **source artwork** (`assets/source/creatures`, editorial-only), **approved runtime artwork** (a reviewed `keep` source candidate promoted here via `promote-source`), and **missing-art fallback** (a neutral UI state when no approved runtime art can render).

## Visual-source policy

Creature masters are **realistic HD raster artwork**. Do not create new marine-life SVG/vector masters or use procedural/vector-looking creature illustration as an accepted final visual source.

Important distinctions:

- runtime `.webp` format alone does not prove a source satisfies the realism requirement;
- legacy SVG-derived/procedural creature work may remain in history or tooling, but it is not an approved future production path;
- #55 replaced all 26 former #33 coverage assets with reviewed realistic 1024×1024 raster candidates;
- preserve every superseded source revision as immutable history;
- generic SVG UI icons remain acceptable outside the creature-art inventory;
- missing-art behavior remains supported, but a fallback must not masquerade as approved species artwork.

See `docs/CREATURE_ASSET_LIBRARY.md` for the human inventory and production order. The machine provenance authority remains `assets/source/creatures/catalog.json`.

## Canonical runtime layout

```text
assets/creatures/<creature-id>/
  manifest.json
  thumb.webp
  gallery.webp
  hero.webp
```

Creature IDs are lower-case, path-safe stable IDs. The pipeline never creates taxonomy/content records. Application code may mount/copy `assets/creatures` where its framework expects static files; the current React/Vite app does exactly that through `apps/web/scripts/sync-assets.mjs`.

## Output contract

Both supported source modes produce the same deterministic runtime sizes and byte budgets:

| Variant | Canvas | Purpose | Maximum file size |
| --- | ---: | --- | ---: |
| `thumb.webp` | 192×192 | dense gallery / small indicators | 64 KiB |
| `gallery.webp` | 512×512 | normal gallery | 220 KiB |
| `hero.webp` | 1024×1024 | creature detail / dive highlight | 700 KiB |

Fixed encoder settings and the pinned Pillow toolchain make output deterministic for a given input and mode. Runtime manifests carry source hashes plus the explicit source mode for newly generated art. Existing v1 manifests without `source.mode` remain valid and are interpreted as the legacy transparent/specimen contract.

The source mode describes alpha/composition handling. It does **not** waive the realistic-raster visual policy.

## Explicit source modes

### `transparent-specimen`

This mode requires an alpha channel, retains the contain-and-centre transparent canvas behavior, and keeps existing transparent artwork backward compatible.

```bash
python -m tools.creature_assets ingest \
  --id spotted-eagle-ray \
  --source /path/to/approved-source.png \
  --mode transparent-specimen
```

Omitting `--mode` is equivalent to `transparent-specimen` so existing commands keep their meaning.

Issue #34 may derive transparent raster specimens from approved realistic opaque masters. This is background extraction, not vectorization.

### `opaque-scene`

This mode is for reviewed square scene masters such as the sunlit-Caribbean source library. It requires a fully opaque square PNG/WebP, preserves the full composition, and generates opaque 192/512/1024 WebP variants. It does **not** weaken alpha validation for transparent/specimen inputs.

```bash
python -m tools.creature_assets ingest \
  --id queen-angelfish \
  --source /path/to/approved-scene.webp \
  --mode opaque-scene
```

For new/replacement marine-life art, the opaque source must itself pass the realistic-HD visual gate before promotion.

## Editorial source library

Source masters are cataloged separately:

```text
assets/source/creatures/
  catalog.json
  <candidate-id>/candidate-vN.webp
```

Validate the complete source library with:

```bash
python -m tools.creature_assets validate-source \
  --catalog assets/source/creatures/catalog.json
```

The normal command is strict: `binaryImportStatus: pending` fails. `--allow-pending` exists only to validate metadata during a staged handoff and is not used by the repository gate.

The prepared bundle can be imported reproducibly when present:

```bash
python -m tools.creature_assets import-source-bundle \
  --bundle /path/to/poseidon-creature-source-library-2026-09-07.zip
```

The importer expects the cataloged repo-relative paths inside the ZIP, validates every candidate before writing, records byte sizes/SHA-256 values, refuses mutation of an existing source revision, and changes `binaryImportStatus` to `complete` only after strict validation succeeds.

## Promotion safeguards

Processing is not approval. Canonical promotion from `assets/source` is always deliberate:

```bash
python -m tools.creature_assets promote-source \
  --candidate queen-angelfish
```

Promotion requires all of the following:

- the source catalog is complete and strict-valid;
- editorial `status` is exactly `keep`;
- `creatureId` maps to an existing repository content record;
- the candidate file/hash/mode validate;
- an existing runtime directory is not replaced unless `--force` is explicitly supplied;
- editorial review has confirmed biological identity and the current realistic-HD visual requirement.

`provisional` and `remake` candidates are blocked even with `--force`. Source-only candidates with `creatureId: null` are also blocked so artwork cannot silently create taxonomy. Existing runtime art therefore remains authoritative until a specific reviewed replacement is deliberately promoted.

## Missing art and placeholders

No artwork is a first-class state:

```bash
python -m tools.creature_assets fallback --id unillustrated-creature --status placeholder
python -m tools.creature_assets fallback --id unillustrated-creature --status missing
```

These manifests keep `aspectRatio: 1.0`, expose null image references and let the UI choose its designed fallback.

Fallbacks are resilience states, not substitute creature artwork. Do not add species-specific SVG creature illustrations to fill a missing-art state. Prefer a neutral aquatic treatment, generic non-species icon or user-created-creature monogram until approved realistic art exists.

## #55 and #34 order

For the 26 former #33 coverage species listed in `docs/CREATURE_ASSET_LIBRARY.md`:

1. #55 has created, reviewed and promoted the realistic opaque raster replacements;
2. those replacements are now canonical runtime art;
3. #34 may derive transparent raster versions from those approved masters where useful.

Do not derive #34 transparency from superseded vector/procedural source revisions.

## Runtime validation

```bash
python -m tools.creature_assets validate --root assets/creatures
```

Validation catches missing/duplicate manifests, unsupported IDs/versions/modes, broken references, incorrect dimensions/media types, hash/byte drift, oversize variants and transparency-mode violations.

## Tests and repository gate

```bash
python -m unittest discover -s tools/creature_assets/tests -v
npm run gate
```

The asset tests cover both modes, deterministic output, legacy manifests, fallback states, source-catalog integrity, exact ZIP import, content mapping, immutable source history and promotion gates. The full repository gate requires both canonical runtime validation and a **complete** source library; a catalog deliberately marked `pending` cannot be merged accidentally.
