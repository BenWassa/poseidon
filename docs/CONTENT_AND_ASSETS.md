# Poseidon — Marine Content and Asset Strategy

## Status

This is the durable strategy for creature content, regional relevance and artwork.

Current implementation status is tracked in `docs/PROJECT_STATUS.md`. The Mexican Caribbean starter content pack is already implemented. #11/#12/PR #13 produced and reviewed the HD source-art library; #30 promoted 18 of the 22 `keep` candidates into canonical runtime artwork; #31 tracks the remaining 8 `remake` candidates, 4 unmapped `keep` candidates and a subsequent coverage audit.

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

A curated creature has a stable Poseidon ID and may have:

- reviewed artwork;
- thumbnail/gallery/hero runtime variants;
- aliases;
- scientific metadata;
- regional relevance;
- source attribution;
- later Creature Detail content.

## User-created creature

When the desired creature is missing, the user can create it immediately.

It must support:

- display name;
- inclusion on the dive;
- appearance in the personal collection;
- deliberate missing-art treatment;
- later normalization/merging without rewriting the historical meaning of the dive.

The UI must never make an unillustrated creature feel like an error.

---

# 4. Starter geography and current pack

Initial enrichment is intentionally concentrated on:

- Cozumel;
- Playa del Carmen;
- the wider Mexican Caribbean.

The implemented starter pack contains sourced region/site/creature records with aliases and provenance. The aim is useful recreational coverage, not complete regional biology.

New regions should primarily be a content operation rather than a new application implementation.

---

# 5. Gallery ordering

When location context exists, the logging gallery prioritizes:

1. **locally relevant curated creatures**;
2. **recent/familiar creatures from personal history**;
3. broader curated content;
4. text search / add unlisted.

This is relevance ordering, not a claim that a creature was definitely present or objectively rare/common on that dive.

---

# 6. Artwork principles

Creature artwork should be:

- immediately recognizable;
- biologically plausible enough to support visual identification;
- consistent as a collection;
- polished and collectible;
- colourful without becoming childish;
- readable at gallery-thumbnail scale;
- compositionally useful as both a tile and a larger memory/detail asset;
- free of baked-in text/labels;
- reviewed before production promotion.

Aesthetic quality never overrides wrong anatomy, markings or species identity.

AI generation is an accepted source-art method, but raw generation output is never automatically production content.

---

# 7. Two source-art families

Poseidon now needs to support two deliberate source treatments.

## Transparent/specimen source

The current #6 pipeline and first runtime art pack use transparent specimen-style source art.

This mode is useful when the creature should float over Poseidon's own tile/hero material.

## Opaque underwater-scene source

The generated `poseidon-sunlit-square-v1` batch uses square underwater scene masters.

This is a legitimate second art family when explicitly selected and curated. It must not be enabled by simply weakening transparency validation for every asset.

Issue #11 owns explicit opaque-scene ingestion while preserving transparent-mode behavior.

Do not casually mix unrelated wide photorealistic experiments, collages or new visual families into the square collection.

---

# 8. Editorial source vs runtime assets

Keep generation/review material separate from application assets.

Target architecture:

```text
assets/source/creatures/<source-id>/
  candidate-vN.webp

assets/creatures/<stable-creature-id>/
  manifest.json
  thumb.webp
  gallery.webp
  hero.webp
```

`assets/source` is editorial input and may contain candidates that are provisional, rejected or not yet mapped to production taxonomy.

`assets/creatures` is canonical runtime output.

Application components consume only runtime manifests/variants.

---

# 9. Editorial states

Generated source candidates use internal production states such as:

- `keep` — strong enough to retain and eligible for deliberate promotion once other gates pass;
- `provisional` — useful candidate requiring focused biological/style QA;
- `remake` — known weak/incorrect candidate; never promote.

Quality scores and identity confidence are editorial metadata, not user-facing rarity or ecological confidence.

The first generated batch currently tracks **30 unique square candidates: 17 keep, 6 provisional, 7 remake**. See #12 and PR #13 for the current review ledger.

---

# 10. Three artwork categories

Poseidon's creature imagery falls into exactly three categories, and it matters which one a given screen is actually showing:

- **Source artwork** — `assets/source/creatures/<id>/candidate-vN.webp`. Editorial-only input. Application code must never read from this tree, and it never determines what a user sees.
- **Approved runtime artwork** — `assets/creatures/<id>/{thumb,gallery,hero}.webp`, produced only by deliberately promoting a `keep` source candidate through `promote-source` (#11/#30/#31). This is the reviewed HD `poseidon-sunlit-square-v1` art once promoted.
- **Fallback artwork** — whatever a species has when no approved HD promotion exists yet for it: either an older SVG-derived runtime illustration still sitting in `assets/creatures/<id>` (legacy, pre-#11 art; also what a species keeps when its HD candidate is blocked as `remake`, per #31), or, if no runtime directory exists at all, the designed `CreatureMark` aquatic placeholder (§12).

The manifest at `assets/creatures/<id>/manifest.json` does not itself distinguish "approved HD" from "legacy SVG-derived fallback" — both are simply the current canonical runtime asset for that ID, resolved identically by the application. The distinction lives in editorial history (the source catalog's `status`/`creatureId` mapping), not in a separate runtime flag. Do not read this as parity: a `remake`-blocked or unmapped species' fallback art is deliberately retained until a reviewed HD replacement is promoted, not treated as equivalent quality to a promoted one.

# 11. Runtime asset contract

Accepted production artwork uses deterministic fixed-square variants:

| Variant | Canvas | Primary use |
| --- | ---: | --- |
| `thumb.webp` | 192×192 | dense gallery / small encounter indicators |
| `gallery.webp` | 512×512 | normal creature tiles |
| `hero.webp` | 1024×1024 | Creature Detail / dive highlight |

Runtime manifests carry stable paths, dimensions, aspect ratio, hashes and source/provenance metadata as defined by the asset pipeline.

The application should:

- reserve geometry before images load;
- use the smallest appropriate variant;
- lazy-load outside the initial viewport;
- render a deliberate fallback when art is absent or fails;
- cache core regional/runtime assets appropriately for offline use;
- never load source candidates directly.

---

# 12. Missing-art behavior

No artwork is a first-class state.

Current application behavior uses a designed `CreatureMark` / aquatic fallback rather than broken image chrome.

A creature without finished art must remain fully loggable, visible in the dive, and visible in the personal collection.

Do not suppress creatures because production art is incomplete.

---

# 13. Production workflow

For each new/replacement creature asset:

1. choose the target stable content ID or explicit source-only candidate ID;
2. generate/prepare a source candidate in an approved style family;
3. record generation/source provenance;
4. review biological recognizability and diagnostic markings;
5. review style consistency and card-scale readability;
6. assign/update editorial state;
7. block `provisional` / `remake` candidates from runtime promotion;
8. ingest an approved source through the explicit source mode;
9. generate deterministic `thumb` / `gallery` / `hero` variants;
10. validate dimensions, hashes, media type and byte budgets;
11. inspect the result inside the actual phone gallery/detail surfaces;
12. only then treat the runtime asset as curated.

Do not regenerate hundreds of species without review just to improve a coverage number.

---

# 14. Current artwork programme

#11 imported the reviewed `poseidon-sunlit-square-v1` source library; #12 completed its biological/style QA (22 keep / 0 provisional / 8 remake). #30 promoted the 18 of those 22 `keep` candidates that map to an existing content record into canonical runtime approved artwork, replacing the older SVG-derived illustrations for those species. #31 covers the remainder:

- the 8 `remake` candidates, which keep their pre-existing fallback art (legacy SVG-derived illustration, or the `CreatureMark` placeholder where none exists) until a reviewed HD replacement is promoted;
- the 4 `keep` candidates with no matching content record (`creatureId: null`) — a deliberate content-catalog decision, not a promotion-tool gap;
- a subsequent audit of starter-catalog species still lacking any HD imagery.

The source library may temporarily run ahead of the 50-creature content pack, but source-only candidates must not silently create production taxonomy/content records.

Expansion priority should favor useful Mexican-Caribbean coverage and locally distinctive gaps, not ocean-wide completeness.

---

# 15. Rarity / encounter significance

Do not assign arbitrary percentage rarity.

If Poseidon later shows rarity/significance:

- it should be region-specific where possible;
- its source should be recorded;
- wording must match evidence quality;
- user excitement must not be confused with ecological rarity;
- the user remains free to choose any creature as the dive highlight.

Omitting rarity is preferable to weak evidence.

---

# 16. Expansion model

Adding a new region should primarily mean adding structured content:

- region metadata;
- sourced sites/places;
- creature relevance mappings;
- aliases/provenance;
- reviewed artwork where useful.

Adding a new creature should primarily be a content/editorial operation once the asset system supports the chosen source family.

Coordinates/map work is separately gated by #16 so location content never fabricates geographic precision.
