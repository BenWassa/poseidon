# Poseidon — Marine Content and Asset Strategy

## Status

This is the durable strategy for creature content, regional relevance and artwork.

Current implementation status is tracked in `docs/PROJECT_STATUS.md`. The Mexican Caribbean starter content pack is implemented. #11/#12/PR #13 established the source-art system and original reviewed library; #30/#31/#38/#39 fully resolved the original 30-source batch; #33 then completed HD coverage for the remaining 26 current content creatures. The resulting current baseline is **56 content IDs = 56 mapped `keep` source entries = 56 canonical runtime manifests**. #34 remains the separate later transparent-background derivation pass.

---

# 1. Permanent rule

> **Content availability must never prevent logging.**

A user can always record what they believe they saw.

Curated content enriches the record. It does not authorize the record.

---

# 2. Naming philosophy

Poseidon speaks in recreational-diver language.

Primary labels use recognizable common names. Curated records may also carry:

- stable canonical ID;
- aliases;
- optional scientific name;
- category/group;
- regional tags;
- provenance;
- artwork metadata;
- future trustworthy encounter-significance data only when evidence supports it.

Scientific terminology stays secondary to the common-name interaction.

---

# 3. Curated vs user-created creatures

## Curated creature

A curated creature has a stable Poseidon ID and may have reviewed artwork, aliases, scientific metadata, regional relevance, provenance and richer Creature Detail content.

## User-created creature

When the desired creature is missing, the user can create it immediately. It must remain visible in the dive and personal collection, use deliberate missing-art treatment, and support later normalization without rewriting the historical meaning of the dive.

The UI must never make an unillustrated creature feel like an error.

---

# 4. Starter geography and current pack

Initial enrichment is intentionally concentrated on Cozumel, Playa del Carmen and the wider Mexican Caribbean.

The implemented pack is useful recreational coverage, not a complete biological catalogue. It contains **56** sourced creature records: the prior 50 plus six defensible Mexican-Caribbean species that were already represented in the original HD source-art batch.

All 56 current curated records now have approved HD runtime artwork. New user-created or future curated records must still remain fully usable if artwork has not yet been reviewed.

New regions should primarily be a content operation rather than a new application implementation.

---

# 5. Gallery ordering

When location context exists, the logging gallery prioritizes:

1. locally relevant curated creatures;
2. recent/familiar creatures from personal history;
3. broader curated content;
4. text search / add unlisted.

This is relevance ordering, not a claim that a creature was definitely present or objectively rare/common on that dive.

---

# 6. Artwork principles

Creature artwork should be immediately recognizable, biologically plausible, consistent as a collection, polished, colourful without becoming childish, readable at gallery-thumbnail scale, compositionally useful at tile and detail scale, free of baked-in labels, and reviewed before production promotion.

Aesthetic quality never overrides wrong anatomy, markings or species identity. AI generation is an accepted source-art method, but raw generation output is never automatically production content.

---

# 7. Source-art treatments

Poseidon supports two deliberate source treatments.

## Transparent/specimen source

Transparent specimen art is useful when the creature should float over Poseidon's own tile/hero material.

## Opaque underwater-scene source

The `poseidon-sunlit-square-v1` family uses square underwater-scene masters. This is a legitimate source family and is the authority for the completed current HD programme.

The two modes remain explicit. Never weaken transparency validation globally just to admit opaque-scene sources.

Issue #34 may later derive transparent raster specimen revisions from the completed approved HD opaque library. That derivation does **not** replace or mutate the opaque originals, and it is not automatic vector tracing. #34 is not part of #33 completion.

---

# 8. Editorial source vs runtime assets

Keep generation/review material separate from application assets.

```text
assets/source/creatures/<source-id>/
  candidate-vN.webp

assets/creatures/<stable-creature-id>/
  manifest.json
  thumb.webp
  gallery.webp
  hero.webp
```

`assets/source` is immutable/versioned editorial input and may contain blocked candidates. `assets/creatures` is canonical runtime output. Application components consume only runtime manifests/variants.

---

# 9. Editorial states

Generated source candidates use internal production states:

- `keep` — eligible for deliberate promotion once all other gates pass;
- `provisional` — requires focused QA and cannot promote;
- `remake` — known weak/incorrect and cannot promote.

Quality scores and identity confidence are production metadata, not user-facing rarity or ecological confidence.

The current full source catalogue stands at **56 keep / 0 provisional / 0 remake**. The original 30-entry batch remains historically identifiable within that catalogue and is fully resolved. Original source binaries remain immutable; accepted replacements use later candidate revisions.

---

# 10. Three artwork categories

Poseidon's creature imagery falls into three categories:

- **Source artwork** — `assets/source/creatures/<id>/candidate-vN.webp`; editorial-only input, never loaded directly by the app.
- **Approved runtime artwork** — `assets/creatures/<id>/{thumb,gallery,hero}.webp`, produced only by explicit guarded promotion of a mapped `keep` source.
- **Fallback artwork** — older SVG-derived runtime illustration or designed `CreatureMark` when no approved HD promotion exists.

All 56 current curated content records are in the approved-runtime category after #33. The fallback contract remains required for user-created creatures and future content that has not yet passed artwork QA.

Runtime manifests intentionally do not encode editorial quality history. A blocked species keeps correct fallback art until a reviewed replacement is explicitly promoted.

---

# 11. Runtime asset contract

Accepted production artwork uses deterministic fixed-square variants:

| Variant | Canvas | Primary use |
| --- | ---: | --- |
| `thumb.webp` | 192×192 | dense gallery / small encounter indicators |
| `gallery.webp` | 512×512 | normal creature tiles |
| `hero.webp` | 1024×1024 | Creature Detail / dive highlight |

Runtime manifests carry stable paths, dimensions, aspect ratio, hashes and source/provenance metadata.

The application reserves geometry before image load, uses the smallest appropriate variant, lazy-loads outside the initial viewport, renders deliberate fallback when necessary, caches core assets appropriately for offline use, and never loads source candidates directly.

---

# 12. Missing-art behavior

No artwork is a first-class supported state even though the current curated pack now has complete coverage. A future or user-created creature without finished art remains fully loggable, visible in the dive and personal collection, and uses the designed aquatic fallback rather than broken image chrome.

Do not suppress creatures because production art is incomplete.

---

# 13. Production workflow

For each new/replacement creature asset:

1. choose the stable content ID;
2. generate/prepare an immutable source candidate in an approved style family;
3. record source/generation provenance;
4. review diagnostic morphology and markings;
5. review style consistency and card-scale readability;
6. assign editorial state;
7. block `provisional` / `remake` from runtime promotion;
8. ingest an approved source through its explicit source mode;
9. generate deterministic 192/512/1024 variants;
10. validate dimensions, hashes, media type and byte budgets;
11. inspect the result in actual phone gallery/detail surfaces;
12. only then treat runtime art as curated.

Do not generate a large library and review it only at the end. Work in small batches, remake failures immediately, and preserve biological QA ahead of coverage metrics.

---

# 14. Current artwork programme

The staged HD programme is now:

1. **#30 — complete:** initial mapped `keep` candidates promoted.
2. **#31 — complete:** all 30 original source entries mapped and the full original batch finished; #38 and #39 supplied immutable reviewed v2 replacements for the eight biological remakes.
3. **#33 — complete:** the exact 26 formerly uncovered content creatures received reviewed immutable `poseidon-sunlit-square-v1` sources and guarded runtime promotion.
4. **#34 — separate next phase:** if deliberately started, derive transparent raster specimen revisions from the stable approved HD library. Preserve every opaque original and do not auto-vectorize.

Current counts are **56 content records**, **56 mapped HD source entries**, **56 approved/live canonical runtime manifests**, **56 keep / 0 provisional / 0 remake**, and **0 current curated content records without HD source coverage**.

Expansion priority remains useful Mexican-Caribbean coverage and locally distinctive gaps, not ocean-wide completeness.

---

# 15. Rarity / encounter significance

Do not assign arbitrary percentage rarity.

If Poseidon later shows rarity/significance, it must be region-specific where possible, sourced, worded to evidence quality, and kept separate from user excitement. The user remains free to choose any creature as the dive highlight.

Omitting rarity is preferable to weak evidence.

---

# 16. Expansion model

Adding a new region should primarily mean adding structured content: region metadata, sourced sites/places, creature relevance mappings, aliases/provenance and reviewed artwork where useful.

Adding a new creature should primarily be a content/editorial operation once the asset system supports the chosen source family.

Coordinates/map work remains separately governed by the existing Atlas/geodata contract so location content never fabricates geographic precision.
