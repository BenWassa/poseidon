# Poseidon — Claude context

Before implementation, read:

1. `PRODUCT.md`
2. `docs/PRD.md`
3. `docs/PROJECT_STATUS.md`
4. `docs/APPLICATION.md`
5. `docs/CONTENT_AND_ASSETS.md`
6. `AGENTS.md`
7. the GitHub issue you are executing

Poseidon is primarily a **personal-use recreational dive journal**, not a public-growth startup product.

The application is already integrated on `main`; do not restart stack selection or recreate the former external prototype architecture. Current authority is React + Vite + TypeScript + Tailwind CSS v4 in `apps/web`, backed by the framework-independent `PoseidonStore` in `packages/domain`.

The north-star flow is implemented:

`Open app → Log Dive → choose creatures visually → save → Home/Journal → Collection → restart offline → history remains.`

Key product laws:

- accumulated personal history is the main character;
- the Dive is canonical personal history;
- every dive belongs in the record;
- creatures are the emotional centre;
- creature logging is a delightful visual gallery with common names;
- content/artwork availability must never prevent logging;
- core use must tolerate no network;
- missing artwork is a first-class state;
- never invent rarity;
- do not gamify unsafe diving or wildlife interaction;
- do not bloat the product into PADI integration, photo management, social networking or technical dive software.

Current residual work is tracked under issue #5 and the child issues listed in `docs/PROJECT_STATUS.md`. Preserve completed #2/#3/#4/#6 work unless the active issue explicitly requires a compatible extension.

`BenWassa/liebestraum` remains the strongest product ancestor for memory-first hierarchy and accumulated-history UX. Learn from it selectively; do not clone its visual design or assume its Firebase/photo architecture belongs here.
