# Creature assets

Generated creature assets live at `assets/creatures/<stable-creature-id>/`.

Do not hand-edit generated variants or manifests. Use the framework-independent tooling documented in [`docs/ASSET_PIPELINE.md`](../../docs/ASSET_PIPELINE.md).

This directory is the canonical runtime library for the current 56-creature
Mexican-Caribbean pack. Each stable creature ID has a generated manifest plus
deterministic `thumb.webp`, `gallery.webp` and `hero.webp` variants.

Runtime-file coverage does not itself grant display approval. The application
also consults `assets/source/creatures/catalog.json`: the current 22 `keep`
records render canonical art, while the 34 `remake` records render the shared
neutral fallback until an accepted immutable replacement is promoted.
