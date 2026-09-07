# Poseidon — Marine Content and Asset Strategy

## Purpose

Poseidon's marine-life system is a product feature, not merely decorative content.

This document defines how creature names, regional relevance and artwork should scale without requiring the team to build the entire ocean before the app is useful.

---

# 1. Permanent rule

> **Content availability must never prevent logging.**

A user can always record what they believe they saw.

Curated content enriches the record. It does not authorize the record.

---

# 2. User-facing naming philosophy

Poseidon should speak in recreational-diver language.

Primary labels should use recognizable common names such as:

- Spotted eagle ray
- Nurse shark
- Barracuda
- Moray eel
- Pufferfish
- Parrotfish
- Seahorse

Do not force genus/family/species terminology into the primary logging interaction.

For curated records, deeper metadata may exist behind the scenes:

- canonical identifier;
- canonical common name;
- aliases;
- optional scientific name;
- category/group;
- regional tags;
- source/provenance;
- asset status;
- optional trustworthy encounter-frequency data.

---

# 3. Curated vs user-created creatures

## Curated creature

Has a stable Poseidon ID and may have:

- polished artwork;
- thumbnail variants;
- aliases;
- scientific metadata;
- regional relevance;
- source attribution;
- later creature-detail content.

## User-created creature

Created when the desired creature is missing.

Must immediately support:

- display name;
- inclusion on the dive;
- appearance in the user's collection;
- future normalization/merging to a curated record.

The UI must not make an unillustrated creature feel like an error.

---

# 4. Starter geography

Initial enrichment should focus on:

- Cozumel;
- Playa del Carmen;
- Mexican Caribbean.

The goal is not complete regional biology.

The goal is a sufficiently rich local gallery that real dive logging feels delightful.

Before finalizing the starter catalogue, a dedicated research/content pass should use credible regional and citizen-science sources to identify likely recreational encounters, common naming and aliases.

---

# 5. Gallery ordering

When location context exists, the logging gallery should prioritize:

1. **likely local creatures**;
2. **recent/familiar creatures from the user's own history**;
3. broader curated content;
4. text search / add unlisted.

This is a relevance order, not a claim that the first items were definitely present on the dive.

---

# 6. Artwork direction

Creature artwork should be:

- immediately recognizable;
- consistent as a collection;
- stylized and polished;
- charming without becoming childish;
- colourful enough to animate the otherwise light/blue product;
- readable at gallery-thumbnail size;
- suitable for transparent-background presentation;
- useful both as a small gallery tile and a larger hero/highlight image.

The current preferred medium is raster artwork with transparency rather than requiring SVG illustration for every species.

AI image generation may be used to create source artwork, but every accepted asset is curated product content rather than raw generation output.

---

# 7. Asset pipeline contract

Do not ship one full-resolution PNG into every gallery tile.

Each accepted creature asset should eventually support at least:

- thumbnail / low-resolution variant;
- standard gallery variant;
- larger hero/detail variant where useful;
- transparent background where appropriate;
- predictable aspect-ratio/crop rules;
- stable filename/ID mapping;
- compression appropriate to mobile use.

The application should:

- render a stable lightweight placeholder immediately;
- lazy-load imagery outside the initial viewport;
- prefer low-resolution assets in dense galleries;
- avoid layout shifts when images resolve;
- cache the active regional library for offline/repeat use where practical;
- only load larger art for screens that justify it.

The exact formats and responsive-loading implementation are engineering decisions.

---

# 8. Missing-art behavior

A creature with no finished artwork still needs a deliberate visual treatment.

Possible first treatment:

- common name;
- category/abstract aquatic mark;
- colour/shape treatment consistent with the collection;
- subtle `art pending` distinction only if useful to the owner.

Do not use broken-image icons or suppress the creature from the collection.

---

# 9. Artwork production workflow

Recommended later workflow:

1. define a small style reference pack;
2. generate candidate artwork for a batch of creatures;
3. curate for biological recognizability and stylistic consistency;
4. reject weak/inconsistent generations aggressively;
5. clean backgrounds/crops where needed;
6. create size variants automatically;
7. add metadata manifest entry;
8. visually test the batch inside the real gallery;
9. only then mark the asset `curated`.

Do not attempt hundreds of creatures before the in-app visual language has been proven with a small pack.

---

# 10. Suggested content data shape

Conceptual only; engineering may refine.

```ts
type Creature = {
  id: string;
  commonName: string;
  aliases?: string[];
  scientificName?: string;
  category?: string;
  regions?: string[];
  asset?: {
    status: 'curated' | 'placeholder' | 'missing';
    thumb?: string;
    gallery?: string;
    hero?: string;
  };
  provenance?: Array<{
    source: string;
    url?: string;
    note?: string;
  }>;
};
```

A user-created creature should not require this full structure.

---

# 11. Rarity / encounter significance

Do not assign arbitrary percentage rarity.

If Poseidon later shows rarity/significance:

- it should be region-specific where possible;
- its source should be recorded;
- wording should match the quality of the evidence;
- user excitement must not be mistaken for ecological rarity;
- the user remains free to choose any encounter as the highlight of a dive.

An initial build can omit rarity entirely without weakening the core product.

---

# 12. Expansion model

New region support should primarily mean adding structured content:

- region metadata;
- local dive sites where curated;
- creature relevance mappings;
- new/expanded artwork;
- aliases/provenance.

It should not require new application logic for each region.

Similarly, adding a new creature should primarily be a content operation rather than an engineering project.

---

# 13. First asset milestone

Before trying to create a global library:

1. choose a small representative Mexican Caribbean starter set;
2. prove the visual style with roughly 8–12 excellent creature assets;
3. test them inside the real logging gallery at phone size;
4. validate low-res/lazy-loading behavior;
5. expand toward a useful regional pack only after the style survives real UI use.

This prevents the art pipeline from becoming a prerequisite for building the rest of Poseidon.
