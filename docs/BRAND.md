# Poseidon brand system — Sunlit Reef

This document is the canonical colour authority for Poseidon. Application code uses product-role tokens from `apps/web/src/index.css`; raw brand hex values should not be scattered through components.

## Locked palette

| Swatch | Hex | Role |
| --- | --- | --- |
| Jet Black | `#05323F` | Primary ink, depth and grounding |
| Cerulean | `#087EA4` | Primary ocean and primary action |
| Ocean Mist | `#34B6A4` | Supporting aquatic / sea-glass accent |
| Vibrant Coral | `#F7735C` | Expressive interaction, selection and delight |
| Tuscan Sun | `#EFC15E` | Sunlight, highlight creature and special emphasis |
| Mint Cream | `#F3FAFA` | Cool default application canvas |
| Floral White | `#FFF8EC` | Warm memory/detail surface |

Pure white is a neutral raised surface, not an eighth expressive brand colour.

The hierarchy is Jet Black for legibility and depth, Cerulean for ocean/action, Coral for signature expression, Ocean Mist for support, Tuscan Sun sparingly for highlight, then Mint Cream / Floral White / white as the environmental surface system. Creature artwork remains the main source of chromatic variety.

## Application tokens

The locked anchors map to `abyss`, `marine`, `lagoon`, `coral`, `sun`, `canvas` and `shell`. Supporting functional tints are deliberately small: `frame #DDEEEE`, `border #D3E7E6`, `aqua-soft #E5F5F3`, `coral-soft #FFF0EC` and `sun-soft #FFF6DE`.

Functional status colours are separate from the brand palette: `danger #A73931` / `danger-soft #FCEDEB`, and `success #176B55` / `success-soft #E7F5EF`. Do not make Coral mean danger or Ocean Mist mean success.

## Contrast and foreground rules

Important WCAG contrast relationships for the exact anchors:

| Pair | Approx. contrast | Use |
| --- | ---: | --- |
| white on Cerulean | 4.64:1 | normal control text/icons |
| Jet Black on Ocean Mist | 5.46:1 | normal text |
| Jet Black on Coral | 4.93:1 | normal text |
| Jet Black on Tuscan Sun | 8.12:1 | normal text |
| Jet Black on Mint Cream / Floral White | ~13:1 | primary and secondary copy |
| white on Ocean Mist | 2.51:1 | **do not use for normal text** |
| white on Coral | 2.78:1 | **do not use for normal text** |
| white on Tuscan Sun | 1.69:1 | **do not use for text** |

Cerulean text is safe on pure white but is slightly below 4.5:1 on the pale brand canvases, so small labels on Mint Cream or Floral White use Jet Black (often with opacity for hierarchy). Ocean Mist is an accent/fill, not small secondary copy. Selection/focus also needs shape, ring, iconography or state attributes; colour alone is never enough.

## Surfaces and composition

- **Mint Cream** is the default cool application canvas.
- **Floral White** is reserved for warm memory/detail moments such as written dive memories; it should not alternate with Mint Cream decoratively.
- **White** is the neutral raised-card surface.
- A typical screen should read as cool ocean + pale surface first, Coral second and Tuscan Sun only occasionally.

## Gradients

Use few gradients. The standard deep-ocean field is **Cerulean → Jet Black**. A shallow **Ocean Mist → Cerulean** treatment is allowed only where it improves composition. Do not build seven-stop/rainbow gradients; Coral and Tuscan Sun are normally discrete marks.

## App icon

The approved Poseidon app icon is a close-up illustration of two dive buddies in sunlit Caribbean water. The man is on the left; his mask reflects reef fish and coral. The woman is on the right; her mask reflects a sea turtle, coral and supporting fish. The surrounding water carries bright surface light, distant reef silhouettes and marine life. The icon is intentionally an illustration rather than a flat palette mark: its ocean, coral and sunlight colours harmonize with Sunlit Reef without forcing every artwork pixel onto the seven UI anchors.

The canonical source is hash-locked under `tools/brand/source/`. `tools/brand/build.py` deterministically creates the browser favicons, 180px Apple touch icon, standard 192/512 PWA icons and a separate Android maskable 512 icon.

- **iPhone/iPad:** use the full sharp composition in the Apple touch icon.
- **Pixel/Android:** use the maskable asset. Important faces and mask reflections are inset into the safe area, with a blurred full-bleed ocean treatment behind them so circular, squircle and other launcher masks do not expose blank corners or cut away the subject.
- **Browser/PWA:** use the standard full-frame composition.

Do not replace the approved artwork by regenerating a new interpretation from a prompt. Any future icon revision should replace the canonical source deliberately and update its locked SHA-256.

## Installation

Poseidon may offer installation after the browser declares the PWA installable. On Chromium/Android, the app shows a restrained in-product prompt and only invokes the native installation dialog after the user taps **Install**. On iPhone/iPad, browsers do not expose the same programmable install dialog, so Poseidon gives the truthful **Share → Add to Home Screen** instruction. Standalone launches do not show installation guidance.

## Do / don't

- **Do:** use Cerulean + white for primary actions; Coral + Jet Black for expressive fills; Tuscan Sun + Jet Black for highlights; semantic danger for delete/refusal states.
- **Do:** keep creature artwork visually dominant and use pale surfaces around it.
- **Don't:** use white text on Coral, Ocean Mist or Tuscan Sun; use Ocean Mist for small body/eyebrow text; reuse Coral for errors; scatter raw brand hex values through UI components; recolour creature artwork to match the interface.
