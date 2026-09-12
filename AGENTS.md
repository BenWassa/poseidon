# Poseidon Agent Guide

Read these before changing product behavior:

1. `PRODUCT.md`
2. `docs/PRD.md`
3. `docs/PROJECT_STATUS.md`
4. `docs/APPLICATION.md`
5. `docs/BRAND.md`
6. `docs/CONTENT_AND_ASSETS.md`
7. `docs/UI_DATA_CONTRACT.md`

## Current repository authority

Poseidon is **not** a greenfield project anymore.

The first coherent application shipped in PR #10 and is on `main`. Do not restart stack selection, recreate the former external prototype architecture, or split the app into a competing framework.

Current architecture:

- npm workspaces;
- `apps/web` — React + Vite + TypeScript + Tailwind CSS v4;
- React Router;
- Lucide React for application icons;
- `packages/domain` — framework-independent `PoseidonStore`, persistence and selectors;
- local-first persistence behind an injected adapter;
- Vite PWA/offline support;
- canonical content and creature-asset pipelines;
- Vitest/Testing Library and the repository gate.

The current programme state and open residual streams live in `docs/PROJECT_STATUS.md` and issue #5.

## Product context

Poseidon is primarily a personal-use recreational dive journal, not a public-growth startup product.

Do not optimize implementation decisions around:

- investor narratives;
- mass-market acquisition;
- subscription conversion;
- social virality;
- professional dive operations.

Optimize first for:

- a delightful phone experience;
- fast real-world dive logging;
- reliable offline behavior;
- durable personal history;
- visually rich creature encounters;
- maintainable content expansion.

## Product ancestor

`BenWassa/liebestraum` remains an important product reference for principles such as:

- personal history as the main character;
- latest-memory/home composition;
- quick creation;
- timeline/history;
- geographic history;
- restrained stats and collections;
- mobile-first interaction.

Do not clone its visual design or assume its Firebase/photo architecture belongs in Poseidon.

## Non-negotiable product laws

- Every dive can be recorded.
- The Dive is canonical personal history.
- Content availability must never prevent logging.
- Creature logging is visual and delightful first, with search/manual entry as escape hatches.
- Common names dominate the main UX.
- Core creation/browsing must tolerate no network.
- Missing creature artwork is a first-class state.
- Never invent rarity or encounter probability.
- Never gamify unsafe diving or wildlife interaction.
- Do not turn the product into a technical-diving suite.

## Engineering boundaries

Preserve the existing seams unless a specific issue requires a deliberate change:

- UI components consume `PoseidonStore`; they do not import persistence internals.
- Dives remain the source of truth; collection/stats/discoveries and similar personal-history views are derived where practical.
- Curated content is replaceable enrichment, not canonical personal data.
- `assets/creatures` is canonical runtime output.
- The source-art programme in #11/#13 introduces `assets/source/creatures` only as an editorial input layer; application code must not consume it directly.
- Keep the runtime `thumb` / `gallery` / `hero` manifest contract stable unless the asset issue explicitly changes it.
- Prefer mature, well-supported libraries over custom framework-like infrastructure.

## Current scope discipline

The north-star flow is already implemented:

`Open app → Log Dive → choose creatures visually → save → Home/Journal → Collection → restart offline → history remains.`

Do not reopen completed #2/#3/#4/#6 work merely because a later feature touches adjacent code.

Current residual work is tracked under #5, especially:

- #11 source-art system;
- #12 art QA/remakes/coverage;
- #14 deployment/restore/field readiness;
- #15 trips/milestones/richer Creature Detail;
- #16 sourced map/geodata.

Keep photos, dive-computer sync, PADI integration, social mechanics, technical telemetry, mandatory accounts and global content breadth out of these streams unless explicitly promoted into new scope.

## Visual implementation

The canonical colour authority is `docs/BRAND.md` (Sunlit Reef). Keep the interface light and aquatic, use the locked role hierarchy rather than ad-hoc hues, keep Coral separate from semantic danger, reserve Tuscan Sun for highlight, and let creature art remain the primary source of colour and personality. Preserve polished tactile interactions and phone-first hierarchy rather than a desktop analytics dashboard.

Inspect rendered mobile composition for visual changes. Delight does not mean loading full-resolution images into a dense gallery or bypassing the asset pipeline — follow the asset-performance contract in `docs/CONTENT_AND_ASSETS.md`.

## Verification

Before declaring repository work complete, run the relevant focused tests and the full gate:

```bash
npm run gate
```

For product/UI changes, also inspect the production build at realistic phone dimensions and preserve accessibility, reduced-motion and safe-area behavior.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
