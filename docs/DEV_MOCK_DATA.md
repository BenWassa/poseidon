# Poseidon development mock-data mode

Status: **scoped, not yet implemented**  
Tracking issue: **#24 — Dev mode: temporary seeded mock history with zero Firebase initialization**

This document is the durable engineering contract for a local development mode that runs the real Poseidon application against temporary, deterministic personal-history data.

It is development tooling only. It does not change the production data model, account model or product behavior.

## Purpose

The normal application is intentionally gated by Firebase Authentication and an approved-user Firestore allowlist, then creates a `PoseidonStore` backed by `FirestorePersistence`.

That is correct for production but inefficient for repeated UI and screen-design work. A developer should be able to open the real application immediately with representative histories without signing in or risking real account data.

The mock mode therefore exists to support:

- rapid screen-by-screen design iteration;
- sparse, medium and dense-history composition checks;
- Collection, Atlas, Journal, Home and Creature Detail regression work;
- Log Dive create/edit/delete testing;
- safe Data & Backup / restore testing;
- deterministic screenshot and browser acceptance work.

It must remain the same app below the data-provider boundary.

## Non-negotiable isolation

**Mock mode must not initialize Firebase.**

This means more than “do not write to Firestore.” In mock mode the runtime must not load the Firebase-bearing production auth root at all.

The bootstrap decision must occur before importing modules that initialize or depend on:

- `AuthProvider`;
- `AuthGate`;
- `FirestorePersistence`;
- `firebase/config`;
- Firebase Auth;
- Firestore.

No Google sign-in state listener, approval lookup, Firebase SDK initialization or Firebase network request is permitted in mock mode.

The production path remains Firebase-backed and unchanged.

## Intended architecture

The existing application already has the correct seam:

```text
PersistenceAdapter
  -> PoseidonStore
  -> PoseidonClient
  -> PoseidonProvider
  -> application screens
```

The mock mode should branch only above that seam:

```text
bootstrap
  |
  +-- production/auth mode
  |     -> AuthProvider
  |     -> AuthGate
  |     -> FirestorePersistence
  |     -> PoseidonProvider
  |     -> App
  |
  +-- DEV mock mode
        -> MemoryPersistence
        -> deterministic seed
        -> PoseidonProvider
        -> App
```

Everything below `PoseidonProvider` should remain unaware of whether the active data source is Firestore or temporary memory.

The preferred implementation is a small development bootstrap/root loaded only when an explicit mock mode is selected. The production auth root should be loaded separately so Firebase modules never enter the mock runtime module graph.

`import.meta.env.DEV` is a hard gate. A production build must not activate mock mode even if a query parameter or stale environment variable is present.

## Persistence semantics

Mock personal history is in memory only.

During one page session:

- queries use the real `PoseidonStore`;
- create/edit/delete works normally;
- user-created creatures work normally;
- export works normally;
- restore merge/replace works normally against the in-memory store.

On reload:

- all mutations are discarded;
- the selected canonical seed is reconstructed;
- no mock Dive/history state is recovered from `localStorage`;
- no mock Dive/history state is read from or written to Firestore.

This reset-on-reload behavior is intentional. Mock mode is a disposable test state, not a second persistence system.

Existing unrelated browser preferences may remain browser preferences if they are already outside personal-history persistence.

## Seed presets

Required preset sizes:

| Preset | Purpose |
| ---: | --- |
| `0` | empty-state regression |
| `3` | sparse populated history |
| `5` | small realistic history with repetition |
| `15` | default medium history for normal design work |
| `30` | dense accumulated-history / scrolling stress |

The seed sequence must be deterministic. Prefer one ordered 30-dive scenario where each smaller preset is the first `N` dives of that sequence.

This gives stable comparisons across preset sizes and avoids random visual churn.

## Seed-data rules

Use the **canonical production content pack and runtime artwork**.

Do not mount the synthetic `fixtureContent` catalogue in the UI. The point of this mode is to exercise current production content, assets and selectors.

Only the personal history is synthetic.

The seeded history should progressively exercise:

- Cozumel and Playa del Carmen;
- several canonical sites plus repeated sites;
- same-day two-dive context;
- plausible varied depth and duration;
- repeated encounters and newly discovered creatures;
- highlight creatures;
- some notes and some note-free dives;
- operator/buddy fields where supported;
- date spacing that creates useful derived trip groupings;
- Creature Detail histories with repeated sightings;
- Atlas place summaries;
- Collection density;
- at least one deliberate user-created/unlisted creature in a larger preset if useful.

Seed creation should go through the normal domain methods such as `createDive` and `createUserCreature` rather than writing persisted JSON by hand. This keeps the scenario subject to normal validation and migration assumptions.

If a referenced canonical site/creature ID disappears, development/tests should fail clearly rather than substituting arbitrary data.

## Developer interface

The intended entry point is:

```bash
npm run dev:mock
```

The default preset is **15 dives**.

Preset selection must not require source edits. A development-only URL selector is acceptable, for example:

```text
http://localhost:5173/?mock=0#/
http://localhost:5173/?mock=3#/
http://localhost:5173/?mock=5#/
http://localhost:5173/?mock=15#/
http://localhost:5173/?mock=30#/
```

The exact syntax may change during implementation if there is a cleaner Vite-native solution. The contract is that selection remains explicit, deterministic, documented and development-only.

Do not create four or five separate fixture applications.

## Visual indication

A mock indicator is optional.

If one is added, it should be a small development-only marker such as `MOCK · 15 dives`, not new production navigation or account UI. It should be suppressible for screenshot/design review so mock tooling does not contaminate the screen being evaluated.

## Data & Backup

The real Data & Backup screen remains part of mock-mode testing.

In mock mode:

- export serializes the active in-memory state;
- restore merge/replace targets the in-memory state only;
- clearing/replacing history cannot touch Firebase or real account data;
- reload returns to the selected seed.

This provides a safe way to exercise destructive/refusal/restore UX repeatedly.

## Verification

Implementation must add regression coverage for both the data and isolation contracts.

Required checks:

1. presets yield exactly `0`, `3`, `5`, `15` and `30` dives;
2. repeated construction produces the same logical scenario;
3. seed entries resolve canonical content and pass normal domain validation;
4. in-session create/edit/delete works through the normal store;
5. reconstruct/reload resets mutations to the selected seed;
6. mock mode bypasses sign-in and approval surfaces;
7. browser acceptance fails on any Firebase/Auth/Firestore request while mock mode is active;
8. a production build cannot activate mock mode;
9. normal auth/Firestore tests remain green;
10. `npm run gate` remains green.

A Playwright network guard is preferred for the no-Firebase runtime assertion.

## Extension rules

When adding or changing seed scenarios later:

- keep the preset sequence deterministic;
- use canonical content IDs/keys;
- prefer realistic combinations over exhaustive edge-case noise;
- add a scenario only when it helps exercise a meaningful UI/product state;
- do not create new production taxonomy/content to satisfy a fixture;
- do not add random generation;
- do not bypass `PoseidonStore` validation;
- do not persist dev data to Firestore “temporarily”;
- do not add mock conditionals to individual product screens.

Mock mode should remain a thin bootstrap/data concern.

## Relationship to current work

Issue #21 is a separate Sunlit Reef brand-system migration. Mock-mode implementation must start from current `main`, preserve any newer brand/token work and avoid redesigning product surfaces.

The feature is developer infrastructure, not a v0 product requirement or owner-device field-readiness blocker.
