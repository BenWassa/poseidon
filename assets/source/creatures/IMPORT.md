# Import the prepared 30-image source-art bundle

Input bundle:

`poseidon-creature-source-library-2026-09-07.zip`

The archive is expected to contain the cataloged repo-relative candidate paths such as:

```text
assets/source/creatures/queen-angelfish/candidate-v1.webp
assets/source/creatures/hawksbill-sea-turtle/candidate-v1.webp
...
```

Run from the repository root:

```bash
python -m tools.creature_assets import-source-bundle \
  --bundle /path/to/poseidon-creature-source-library-2026-09-07.zip
```

The importer validates all cataloged members before writing, requires 1024×1024 WebP masters and the declared source mode, refuses to overwrite a different immutable source revision, writes per-file byte/SHA-256 metadata, then changes `binaryImportStatus` from `pending` to `complete` only after strict source validation succeeds.

After import:

```bash
python -m tools.creature_assets validate-source
npm run gate
```

Do not place source candidates under `assets/creatures` directly. Do not promote `provisional` or `remake` records. Existing runtime artwork remains authoritative until a `keep` candidate is deliberately promoted through `promote-source`; replacing an existing runtime asset additionally requires explicit `--force`.
