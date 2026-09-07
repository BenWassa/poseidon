# Poseidon creature asset pipeline

This tooling implements the repository-side asset contract from issue #6. It is intentionally independent of the eventual application framework.

## Canonical layout

Each stable curated creature ID owns one directory:

```text
assets/creatures/<creature-id>/
  manifest.json
  thumb.webp
  gallery.webp
  hero.webp
```

Creature IDs are lower-case, path-safe stable IDs. The pipeline does not create taxonomy/content records; those belong to the marine-content stream.

Variant references in `manifest.json` are relative to that creature asset directory. Application code may mount/copy `assets/creatures` wherever its final stack expects static assets.

## Output contract

Approved PNG or WebP source artwork is converted to transparent WebP on a fixed square canvas. The source composition is contained and centred; it is not cropped into a new art direction.

| Variant | Canvas | Purpose | Maximum file size |
| --- | ---: | --- | ---: |
| `thumb.webp` | 192×192 | dense gallery / small indicators | 64 KiB |
| `gallery.webp` | 512×512 | normal gallery | 220 KiB |
| `hero.webp` | 1024×1024 | creature detail / dive highlight | 700 KiB |

The manifest exposes the UI-facing `artwork.status`, `thumb`, `gallery`, `hero`, and `aspectRatio` concepts from `docs/UI_DATA_CONTRACT.md`, plus generated dimensions, byte sizes, SHA-256 hashes, and source metadata for validation/provenance.
A machine-readable JSON Schema lives at `tools/creature_assets/manifest.schema.json`; the Python validator additionally verifies referenced files, hashes, dimensions, transparency, and size budgets.

The fixed `aspectRatio: 1.0` contract lets a future UI reserve image space before loading, avoiding layout shift. Dense surfaces can request `thumb` without touching the source or hero asset.

## Install the isolated tool

From the repository root:

```bash
python -m pip install -r tools/creature_assets/requirements.txt
```

The pinned Pillow version is part of the deterministic toolchain.

## Add one approved creature asset

Given an already reviewed transparent source image:

```bash
python -m tools.creature_assets ingest \
  --id spotted-eagle-ray \
  --source /path/to/approved-source.png
```

The command refuses to overwrite an existing creature directory. Review the generated variants and manifest, then run:

```bash
python -m tools.creature_assets validate
```

Do not treat successful processing as art approval. Biological recognizability and style curation remain a separate editorial step.

## Replace approved art

Use the same stable creature ID and opt in to replacement:

```bash
python -m tools.creature_assets ingest \
  --id spotted-eagle-ray \
  --source /path/to/replacement.png \
  --force
```

Replacement is staged before the existing directory is removed, so a failed conversion does not leave a half-written asset directory.

## Missing art and placeholders

No artwork is a first-class state, not a broken image. Create component-neutral metadata without inventing a final placeholder visual:

```bash
python -m tools.creature_assets fallback --id unillustrated-creature --status placeholder
```

or, when there is intentionally no placeholder art:

```bash
python -m tools.creature_assets fallback --id unillustrated-creature --status missing
```

These manifests keep `aspectRatio: 1.0`, expose null image references, and let the eventual UI choose a consistent fallback treatment without coupling this tooling to a component library.

## Validation

```bash
python -m tools.creature_assets validate --root assets/creatures
```

Validation fails with explicit messages for:

- top-level creature directories with no manifest;
- duplicate creature IDs, including stray copied manifests;
- unsupported manifest versions or invalid IDs;
- broken/missing variant references;
- incorrect dimensions/aspect ratio/media type;
- unreadable generated imagery;
- lost transparency;
- file-size or SHA-256 metadata drift;
- variant file-size budget overruns.

Ingestion separately rejects unreadable inputs, unsupported formats, opaque images without an alpha channel, source files over 20 MiB, and source dimensions above 4096 px on either axis.

## Tests

Tests create temporary synthetic RGBA fixtures; no production creature illustration is included.

```bash
python -m unittest discover -s tools/creature_assets/tests -v
```

The suite proves deterministic output under the pinned toolchain, stable dimensions/transparency, explicit fallback states, smaller gallery payloads, replacement safety, and validation failures for broken, missing, duplicate, unsupported, or oversized assets.
