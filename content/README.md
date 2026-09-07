# Poseidon marine content

This directory contains implementation-neutral curated content for Poseidon. The starter pack is deliberately a **recreational-diving suggestion catalogue**, not a complete scientific inventory.

## Files

- `mexican-caribbean/manifest.json` — pack metadata, stable regions, provenance registry and shard references.
- `mexican-caribbean/sites.json` — curated recreational dive sites/areas.
- `mexican-caribbean/creatures/*.json` — small reviewable creature-catalogue shards.
- `schema/marine-content.schema.json` — JSON Schema (Draft 2020-12) for manifest, site and creature files.
- `../tools/validate_content.py` — dependency-free repository validation, including cross-reference checks that JSON Schema cannot express by itself.

The manifest/shard layout keeps future additions reviewable and avoids coupling content to an application framework or persistence choice.

## Product semantics

### Common names first

`commonName` is the diver-facing canonical label. `scientificName` exists only to help canonicalize curated records. User-created sightings do not need a scientific name.

Aliases are practical search terms and naming variants. They must not create ambiguous case-insensitive search keys across curated creatures.

### Region relevance is plausibility, not probability

`regionIds` means that a curated creature is supported as plausible within that region by the listed sources. It does **not** mean the creature is guaranteed at a site or on a particular dive.

For deterministic v0 suggestions, consumers should rank:

1. a direct `regionIds` match for the selected region;
2. a match to one of that region's ancestors (for example `mx-caribbean`);
3. broader browse/search content.

This lets a Cozumel or Playa selection use direct local evidence first while retaining sensible Mexican-Caribbean coverage without a probabilistic recommendation engine.

### No rarity in this pack

REEF survey reports expose sighting-frequency and density information. Those values are useful evidence that a creature has been observed in the research area, but this starter pack intentionally does **not** store them, map them to “common/rare” labels, or convert them into encounter probabilities. Survey effort, habitat, season, site choice and observer behaviour make such a conversion inappropriate for this product contract.

The validator rejects rarity/frequency-style fields so unsupported scoring cannot quietly enter the starter pack.

### Editorial groupings are not taxonomy

`category` is a product grouping for browsing and placeholder treatment (for example `sea-turtle`, `ray`, `reef-fish`). It is editorial metadata, not a formal taxonomic rank or scientific claim.

### Sites and areas

Site records are practical recreational-diving names. `recordType: "area"` is used where the source groups several commonly named variants under one useful content record. Coordinates are intentionally omitted from the starter pack because the research pass did not establish a single authoritative coordinate source precise enough to justify them.

The 2019 CONANP article is used only as evidence for established Cozumel recreational site names and dive/snorkel classification. Its historical temporary access restrictions are not represented as current operating status.

## Provenance

Every site and creature references one or more records in the manifest's `sources` registry. Sources are intentionally compact and auditable:

- CONANP for official Cozumel protected-area and site information;
- REEF Environmental Education Foundation regional survey reports for diver-observed marine life and site naming;
- specialist/reference sources for a small set of invertebrates and seahorse records not well represented by the main regional reports.

A source reference supports curation of the record; it is not a claim that every field came verbatim from that source. Common-name presentation, aliases and categories remain editorial product choices where appropriate.

## Validation

Run:

```bash
python tools/validate_content.py
```

The validator checks JSON/schema readability, manifest/shard integrity, required fields, stable ID format, uniqueness, region-parent integrity, source/region cross-references, ambiguous aliases/names, scientific-name uniqueness, HTTPS provenance URLs, review dates, starter-catalogue minimum size, deterministic ordering, orphan shards and absence of unsupported rarity/frequency fields.

Adding a creature, site or region should normally require only content changes plus this validation; no application framework is assumed here.
