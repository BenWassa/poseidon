# Poseidon development mock-data mode

Status: **implemented on #24**  
Tracking issue: **#24 — Dev mode: temporary seeded mock history with zero Firebase initialization**

This is development tooling only. It runs the real Poseidon application against deterministic, disposable personal-history data without signing in or initializing Firebase.

## Launch

From the repository root:

```bash
npm run dev:mock
```

The default history is **15 dives**.

Select a preset with the development URL query parameter:

```text
http://localhost:5173/?mock=0#/
http://localhost:5173/?mock=3#/
http://localhost:5173/?mock=5#/
http://localhost:5173/?mock=15#/
http://localhost:5173/?mock=30#/
```

Available presets are `0`, `3`, `5`, `15` and `30`. Unsupported values fall back to 15 with a development-console warning.

Running normal `npm run dev` does **not** enable mock mode. The query parameter alone is insufficient.

## Hard Firebase boundary

Mock mode is selected only when both are true:

- Vite is serving a development build (`import.meta.env.DEV`);
- the active Vite mode is exactly `mock`.

`apps/web/src/main.tsx` makes that decision before loading either application root.

```text
bootstrap
  |
  +-- normal / production
  |     -> dynamic import AuthProvider + AuthGate
  |     -> FirestorePersistence
  |     -> PoseidonProvider
  |     -> App
  |
  +-- DEV mode=mock
        -> dynamic import mock-data
        -> MemoryPersistence
        -> deterministic seed
        -> PoseidonProvider
        -> App
```

The shared application no longer imports the Firebase-backed `AuthProvider` through `DataAndBackup`; the non-Firebase auth context contract lives separately in `apps/web/src/auth/AuthContext.tsx`.

Consequences in mock mode:

- Firebase configuration is not imported;
- Firebase Auth is not initialized;
- no Google auth listener or popup exists;
- no `approvedUsers` lookup occurs;
- `FirestorePersistence` is not constructed;
- no Firestore/Firebase request is made;
- a production build cannot enter mock mode even if it is built with mode `mock` or opened with `?mock=30`.

## Persistence and reset semantics

Mock personal history uses the domain package's `MemoryPersistence`, through the same `PersistenceAdapter -> PoseidonStore -> PoseidonClient` seam as the rest of the app.

During the current page session, all normal store behavior works:

- create/edit/delete dives;
- user-created creatures;
- derived Home/Journal/Collection/Atlas state;
- export;
- restore merge/replace.

No mock personal-history state is written to localStorage or Firestore.

A reload constructs a fresh in-memory store and reapplies the selected seed. Any edits, deletes, new dives or restores from the previous page session disappear by design.

Unrelated browser UI preferences can still use their existing browser storage.

## Seed authority

`apps/web/src/dev/mock-data.ts` owns one explicit 30-dive scenario. The smaller presets are prefixes of the same sequence.

The seed uses:

- the canonical Mexican-Caribbean content pack;
- canonical current dive sites and their region/coordinate metadata;
- canonical current creature IDs and runtime artwork;
- real `PoseidonStore.createDive()` validation;
- real `createUserCreature()` for one deliberate unlisted-creature example;
- deterministic IDs and timestamps.

The data covers Cozumel and Playa del Carmen, repeated sites and encounters, same-day pairs, multiple trip periods, highlights, sparse notes, operators/buddies, Atlas density, Collection density and repeated Creature Detail history.

Canonical sites and creatures are resolved by exact current content names. A removed/renamed dependency throws during seeding rather than silently substituting another record.

Only personal history is synthetic. The marine catalogue and art are production data.

## Data & Backup

The real Data & Backup screen works in mock mode because it talks only to the active `PoseidonStore`.

- export serializes the current in-memory record;
- merge/replace affects only the current in-memory record;
- real account history and the local Firestore shadow are unreachable;
- reload restores the selected seed.

The Account section is rendered only when an auth context is present, so it is absent in the unauthenticated mock root without teaching the screen about Firebase or mock persistence.

## Verification

`npm run gate` includes the dedicated mock browser acceptance probe.

Focused commands:

```bash
npm run test --workspace @poseidon/web
npm run test:mock
```

Coverage includes:

- exact `0 / 3 / 5 / 15 / 30` dive counts;
- deterministic reconstruction;
- smaller-preset prefix stability;
- canonical sighting resolution plus the deliberate user-created creature;
- normal create/edit/delete behavior in memory;
- reconstruction resetting session mutations;
- the production hard guard on mock mode;
- browser confirmation that sign-in is bypassed;
- browser access to the real Data & Backup screen;
- failure on any Firebase/Firestore/Auth module request or network request in mock mode.

The browser probe runs Vite in `mock` mode and records all requests. It therefore catches both accidental Firebase network traffic and local Vite dependency-module loading such as `firebase/auth` or `firebase/firestore`.

## Extension rules

When extending the scenarios:

- keep the sequence deterministic;
- preserve `0 / 3 / 5 / 15 / 30` unless there is a deliberate tooling change;
- make smaller histories prefixes of larger histories where practical;
- use canonical content rather than synthetic marine taxonomy;
- use normal domain methods rather than hand-writing persisted JSON;
- add data only when it exercises a meaningful product state;
- do not persist mock history;
- do not add Firebase emulator dependencies;
- do not scatter mock checks through product screens;
- do not add production-visible debug controls.

Issue #21 remains a separate brand-system migration. Mock tooling must preserve whichever production token system and screen design is current when the branches reconcile.
