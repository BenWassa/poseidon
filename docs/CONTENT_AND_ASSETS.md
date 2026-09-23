# Poseidon — Marine Content and Asset Strategy

## Status

This is the durable strategy for creature content, regional relevance and artwork.

Current implementation status is tracked in `docs/PROJECT_STATUS.md`. The Mexican Caribbean starter content pack is implemented. #11/#12/PR #13 established the source-art system and original reviewed library; #30/#31/#38/#39 fully resolved the original 30-source batch; #33 then completed technical artwork coverage for the remaining 26 current content creatures. The current baseline is **56 content IDs = 56 mapped source entries = 56 canonical runtime manifests**, with the source catalog currently at **22 `keep` / 0 `provisional` / 34 `remake`**.

Owner direction on 2026-09-16 established realistic HD raster imagery as the creature-art target. #55 replaced all 26 former #33 vector/procedural coverage assets with reviewed realistic raster masters. #34 transparent-background derivation may follow only from a source that remains currently approved (`keep`).

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

All 56 current curated records have canonical runtime artwork. The app displays canonical artwork for the 22 `keep` records; it displays a neutral fallback for the 34 `remake` records rather than showing art rejected in the current review. The original 30-source programme and #55 replacements remain immutable runtime/source history, not proof of present display approval.

New user-created or future curated records must remain fully usable if artwork has not yet been reviewed.

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

Creature artwork should be immediately recognizable, biologically plausible, consistent as a collection, readable at gallery-thumbnail scale, compositionally useful at tile and detail scale, free of baked-in labels, and reviewed before production promotion.

The visual target is **realistic HD raster imagery**:

- natural underwater lighting, depth and texture;
- realistic proportions and diagnostic markings;
- attractive but not stylized into flat/vector/clip-art treatment;
- clear subject dominance with plausible Caribbean environmental context;
- no marine-life SVG/vector master as final artwork;
- no assumption that a WebP runtime file is visually acceptable merely because it is raster encoded.

Aesthetic quality never overrides wrong anatomy, markings or species identity. AI image generation is an accepted source-art method, but raw generation output is never automatically production content. Biological identity and realism are separate acceptance gates.

SVG remains appropriate for generic UI icons, logos, maps and other intentionally graphic non-creature interface elements.

---

# 7. Source-art treatments

Poseidon supports two runtime/source-composition treatments, both using reviewed raster creature art.

## Transparent/specimen source

Transparent raster specimen art is useful when the creature should float over Poseidon's own tile/hero material.

## Opaque underwater-scene source

The `poseidon-sunlit-square-v1` family uses square underwater-scene raster masters. This is the preferred source treatment for realistic replacement generation because it preserves natural lighting and environmental context.

The two modes remain explicit. Never weaken transparency validation globally just to admit opaque-scene sources.

Issue #34 may derive transparent raster specimen revisions from the currently approved realistic opaque library. That derivation does **not** replace or mutate opaque originals and is not vector tracing. A `remake` source cannot be used for this work merely because an older #55 runtime file remains; it first needs an accepted immutable replacement and `keep` status.

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

`assets/source` is immutable/versioned editorial input and may contain blocked or superseded candidates. `assets/creatures` is canonical runtime output. Application components consume only runtime manifests/variants.

---

# 9. Editorial states

Generated source candidates use internal production states:

- `keep` — eligible for deliberate promotion once all current gates pass;
- `provisional` — requires focused QA and cannot promote;
- `remake` — known weak/incorrect and cannot promote.

Quality scores and identity confidence are production metadata, not user-facing rarity or ecological confidence.

The machine catalogue stands at **22 keep / 0 provisional / 34 remake** for the current mapped creature inventory, following the owner review on 2026-09-18. #55 added later immutable realistic raster candidate revisions for all 26 former #33 coverage species; superseded vector/procedural revisions remain historical only. Existing runtime assets remain live while `remake` sources await reviewed immutable replacements.

Original source binaries remain immutable; accepted replacements use later candidate revisions.

---

# 10. Artwork categories

Poseidon's creature imagery falls into three operational categories:

- **Source artwork** — `assets/source/creatures/<id>/candidate-vN.webp`; editorial-only input, never loaded directly by the app.
- **Approved runtime artwork** — `assets/creatures/<id>/{thumb,gallery,hero}.webp`, produced only by explicit guarded promotion of a mapped reviewed source.
- **Missing-art fallback** — a neutral designed UI state when approved runtime art is absent or fails to render.

Legacy SVG-derived creature tooling and species-like icon fallbacks are not a fourth approved art category. They are deprecated implementation/history and must not be expanded into new marine-life artwork.

All 56 current curated content records have runtime art. The fallback contract remains required for user-created creatures and future content that has not yet passed artwork QA.

Runtime manifests intentionally do not encode the complete editorial quality history. `docs/CREATURE_ASSET_LIBRARY.md` is the human inventory and next-work authority; `assets/source/creatures/catalog.json` records machine provenance.

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

No artwork is a first-class supported state even though the current curated pack has complete runtime coverage. A future or user-created creature without finished art remains fully loggable, visible in the dive and personal collection, and uses a designed neutral fallback rather than broken image chrome.

Do not suppress creatures because production art is incomplete. Do not create a species-specific marine-life SVG merely to avoid a missing-art state.

---

# 13. Production workflow

For each new/replacement creature asset:

1. choose the stable content ID;
2. generate/prepare an immutable **realistic raster** source candidate in an approved style family;
3. record source/generation provenance;
4. review diagnostic morphology and markings;
5. review realism, natural lighting, depth, texture, style consistency and card-scale readability;
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

The staged programme is now:

1. **#30 / #31 / #38 / #39 — complete:** original 30-source HD programme fully mapped, biologically reviewed and promoted.
2. **#33 — technically complete:** 26 previously uncovered creatures received source candidates and canonical runtime promotion, closing coverage at 56/56.
3. **#55 — complete:** all 26 former #33 vector/procedural coverage masters were replaced by reviewed realistic 1024×1024 raster revisions and promoted through the guarded pipeline.
4. **#60 — active:** replace and review the 34 `remake` candidates, promoting only accepted immutable revisions.
5. **#34 — next where useful:** derive transparent raster specimens only from currently approved realistic opaque masters. Preserve originals and never auto-vectorize.

Current counts are **56 content records**, **56 mapped source entries (22 keep / 34 remake)**, **56 live canonical runtime manifests**, and **0 current curated content records without runtime artwork**. The application currently presents **22 canonical artworks and 34 neutral fallbacks**; a runtime file does not override the current editorial verdict.

The current visual-production baseline is **22/56 approved-and-displayed creature artworks**. All 56 have realistic raster runtime/source history after #55, but 34 require an accepted immutable replacement before their artwork can return to the UI. Superseded vector/procedural revisions remain immutable history, not approved current art.

Creature-count expansion is a separate product decision; it is no longer blocked by #55 visual-family completion.

---

# 15. Rarity / encounter significance

Do not assign arbitrary percentage rarity.

If Poseidon later shows rarity/significance, it must be region-specific where possible, sourced, worded to evidence quality, and kept separate from user excitement. The user remains free to choose any creature as the dive highlight.

Omitting rarity is preferable to weak evidence.

---

# 16. Expansion model

Adding a new region should primarily mean adding structured content: region metadata, sourced sites/places, creature relevance mappings, aliases/provenance and reviewed artwork where useful.

Adding a new creature should primarily be a content/editorial operation using the established realistic-raster art and fallback contracts.

Expansion priority remains useful Mexican-Caribbean coverage and locally distinctive gaps, not ocean-wide completeness.

Coordinates/map work remains separately governed by the existing Atlas/geodata contract so location content never fabricates geographic precision.
