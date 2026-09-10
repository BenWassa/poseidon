# Poseidon Creature Asset Library

Last updated: **2026-09-07**

This is the human review ledger for Poseidon creature artwork. The machine-readable inventory is [`assets/source/creatures/catalog.json`](../assets/source/creatures/catalog.json). Runtime assets remain under `assets/creatures/` and are produced through the canonical asset pipeline.

## Current state

- **30** unique square source candidates in style family `poseidon-sunlit-square-v1`.
- **17 keep**, **6 provisional**, **7 remake**.
- **23** are usable visual candidates today (`keep` + `provisional`).
- A repo-ready binary bundle contains about **3.2 MiB** of normalized 1024×1024 high-quality WebP masters, matching the current maximum hero canvas. **Binary import is still pending** because the chat GitHub connector cannot upload local binary files.
- The later wide photorealistic eagle-ray/hawksbill experiments and the infographic collage are intentionally excluded to avoid style drift and duplicate species.

## Architecture

```text
assets/
  source/
    creatures/
      README.md
      IMPORT.md
      catalog.json
      <creature-or-provisional-id>/
        candidate-v1.webp
  creatures/
    <stable-creature-id>/
      manifest.json
      thumb.webp
      gallery.webp
      hero.webp
```

The separation is deliberate. `assets/source` is editorial input; `assets/creatures` is validated runtime output. Components consume only canonical manifests/variants, never source candidates.

## Review dimensions

Each candidate is reviewed for **species identity**, **anatomy**, **markings/colour**, **regional plausibility**, **composition/crop**, **Poseidon style consistency**, **generation artifacts**, and **pipeline readiness**. A high aesthetic score does not override incorrect species morphology.

## Inventory

| Species | Content ID | Score | State | Identity | Notes |
| --- | --- | ---: | --- | --- | --- |
| Queen angelfish | `queen-angelfish` | 8.5/10 | **keep** | high | Strong silhouette and palette; markings slightly stylized but recognizable. |
| Hawksbill sea turtle | `hawksbill-sea-turtle` | 9.0/10 | **keep** | high | Excellent hooked beak, shell character and proportions. |
| Spotted eagle ray | `spotted-eagle-ray` | 6.5/10 | **remake** | medium | Head/snout and ray morphology drift too generic. |
| Nurse shark | `nurse-shark` | 7.7/10 | **provisional** | medium | Recognizable from barbels/body; caudal and dorsal proportions need QA. |
| Green moray | `green-moray` | 8.3/10 | **keep** | high | Strong recognizable form, colour and head shape. |
| Great barracuda | `great-barracuda` | 8.4/10 | **keep** | high | Very recognizable; teeth slightly exaggerated. |
| Stoplight parrotfish | `stoplight-parrotfish` | 7.6/10 | **provisional** | medium | Good beak/body; coloration is more stylized than field-realistic. |
| Caribbean reef squid | `caribbean-reef-squid` | 7.4/10 | **provisional** | medium | Recognizable, but large eyes and three-animal composition are less ideal for ID. |
| Caribbean spiny lobster | `caribbean-spiny-lobster` | 9.0/10 | **keep** | high | Excellent antennae, armored body and coloration. |
| Caribbean reef octopus | `caribbean-reef-octopus` | 7.1/10 | **provisional** | medium | Visually excellent; eye and arm/sucker anatomy are somewhat stylized. |
| French angelfish | `french-angelfish` | 9.0/10 | **keep** | high | Strong species-specific coloration and silhouette. |
| Spotted trunkfish | `spotted-trunkfish` | 3.0/10 | **remake** | low | Reads as a yellow Indo-Pacific boxfish rather than Caribbean spotted trunkfish. |
| Queen triggerfish | `—` | 8.6/10 | **keep** | high | Strong tail, body and facial coloration; outside current starter pack. |
| Nassau grouper | `nassau-grouper` | 8.2/10 | **keep** | high | Broad bars, grouper form and head pattern work well. |
| Blue tang | `blue-tang` | 4.0/10 | **remake** | low | Yellow-tail morphology is unreliable for Atlantic blue tang. |
| Southern stingray | `southern-stingray` | 8.2/10 | **keep** | high | Convincing silhouette and dorsal view. |
| Trumpetfish | `trumpetfish` | 7.2/10 | **provisional** | medium | Recognizable body/snout; fin configuration and proportions need checking. |
| Longsnout seahorse | `longsnout-seahorse` | 6.8/10 | **provisional** | medium | Beautiful but somewhat generic and over-spined. |
| Yellowtail snapper | `yellowtail-snapper` | 9.0/10 | **keep** | high | Excellent profile, stripe/tail and silver-blue body. |
| Porcupinefish | `porcupinefish` | 8.0/10 | **keep** | medium | Strong Diodon-type asset; canonical label must match. |
| Longspine sea urchin | `—` | 9.2/10 | **keep** | high | Excellent and highly recognizable; outside current starter pack. |
| Banded coral shrimp | `—` | 8.8/10 | **keep** | high | Strong red/white banding, antennae and claw profile; outside current pack. |
| Schoolmaster snapper | `schoolmaster-snapper` | 8.7/10 | **keep** | high | Good yellow fins/stripes and snapper silhouette. |
| Spanish hogfish | `spanish-hogfish` | 2.5/10 | **remake** | low | Wrong pattern/coloration for intended species. |
| Caribbean cushion sea star | `—` | 4.0/10 | **remake** | low | Thin-armed star shape rather than heavy cushion-like form. |
| Sergeant major | `sergeant-major` | 8.6/10 | **keep** | high | Strong five-bar appearance and Caribbean reef-fish form. |
| Porkfish | `porkfish` | 4.5/10 | **remake** | low | Attractive grunt-like form but unreliable porkfish markings. |
| Queen conch | `—` | 5.8/10 | **remake** | medium | Shell is attractive; animal anatomy and midwater pose are unreliable. |
| Juvenile spotted drum | `—` | 8.1/10 | **keep** | high | Strong juvenile black/white profile with trailing fins; outside current pack. |
| Green sea turtle | `green-sea-turtle` | 8.6/10 | **keep** | high | Good rounded head and smoother shell distinguish it from hawksbill. |

## Remake queue

1. Spotted eagle ray
2. Spotted trunkfish
3. Blue tang
4. Spanish hogfish
5. Caribbean cushion sea star
6. Porkfish
7. Queen conch

These are blocked from canonical promotion until replaced with biologically stronger candidates.

## Provisional QA queue

1. Nurse shark
2. Stoplight parrotfish
3. Caribbean reef squid
4. Caribbean reef octopus
5. Trumpetfish
6. Longsnout seahorse

## Starter-pack alignment

The source library may run ahead of the 50-creature content pack, but runtime promotion should use a stable content creature ID. Candidates currently outside the starter pack are tracked as source-only/provisional IDs and must not silently create taxonomy/content records:

- `queen-triggerfish`
- `longspine-sea-urchin`
- `banded-coral-shrimp`
- `caribbean-cushion-sea-star`
- `queen-conch`
- `juvenile-spotted-drum`

## Promotion workflow

1. Generate or replace one source candidate.
2. Record it in `catalog.json` with provenance/review state.
3. Biological/style QA; `remake` candidates stop here.
4. Map to an existing stable content ID, or land content work separately.
5. Promote through the canonical asset pipeline once the source treatment is supported.
6. Run asset validation.
7. Let the web app consume only generated `thumb` / `gallery` / `hero` variants through manifests.

## Stack and UI boundary

The active application integration in PR #10 already uses **React + Vite + TypeScript + Tailwind v4**, with **Lucide React** as the curated icon library. That is the appropriate component/UI layer. The asset library itself stays framework-neutral so artwork can be validated, replaced and reused without coupling editorial assets to React.

Do not create a second front-end stack or second icon system for the asset library.

## Related work

- **#11** — import the binary source bundle, validate the source catalog and add an explicit opaque-scene source mode without weakening the existing transparent-source contract.
- **#12** — remake the seven failed candidates, resolve the six provisional candidates, then expand reviewed coverage toward the 50-creature starter pack.
- **#5** — remains the parent residual product/artwork backlog after PR #10.

## Production rules

- Correct fallback art is preferable to biologically wrong finished art.
- Source art is immutable/versioned; replacement creates a new candidate revision.
- Runtime outputs are generated, not hand-edited.
- Dense surfaces use `thumb`; normal galleries use `gallery`; large detail surfaces use `hero`.
- Scores/status are production metadata and never user-facing rarity or progression.
- No UI component imports directly from `assets/source`.
