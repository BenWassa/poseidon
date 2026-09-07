# Poseidon Agent Guide

Read these before changing product behavior:

1. `PRODUCT.md`
2. `docs/PRD.md`
3. `docs/CONTENT_AND_ASSETS.md`

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

`BenWassa/liebestraum` is an important product reference.

Use it to understand principles such as:

- personal history as the main character;
- latest-memory/home composition;
- quick creation;
- timeline/history;
- map/geographic history;
- restrained stats and collections;
- mobile-first interaction.

Do not clone its visual design or assume its Firebase/photo architecture belongs in Poseidon.

## Non-negotiable product laws

- Every dive can be recorded.
- Content availability must never prevent logging.
- Creature logging is visual and delightful first, with search/manual entry as escape hatches.
- Common names dominate the main UX.
- The core experience must tolerate no network.
- Missing creature artwork must degrade gracefully.
- Never gamify unsafe diving or wildlife interaction.
- Do not turn the MVP into a technical diving suite.

## Engineering approach

The repository begins essentially from zero.

Before locking major architecture, assess the simplest stack that can provide:

- excellent mobile/PWA or app ergonomics;
- local/offline persistence;
- reliable migrations/backups;
- image lazy loading and caching;
- future optional sync without forcing an account in the first personal build;
- deterministic automated testing.

Prefer boring, well-supported dependencies over custom infrastructure.

Use existing high-quality libraries for gestures, routing, persistence, image handling and maps when those capabilities are needed. Do not invent framework-like code unnecessarily.

## Scope discipline

The first excellent flow is:

`Open app → Log Dive → choose creatures visually → save → see dive in Journal/Home → see creatures in Collection → restart offline → history remains.`

If this flow is not excellent, do not distract the project with social features, dive-computer integration, photo management, broad global content or elaborate gamification.

## Visual implementation

The desired character is light, aquatic, saturated and alive:

- rich ocean blues;
- aquatic greens;
- coral/tropical accents;
- polished tactile interactions;
- creature art as a primary source of colour and personality.

Delight does not mean loading full-resolution images into a dense gallery. Follow the asset-performance contract in `docs/CONTENT_AND_ASSETS.md`.
