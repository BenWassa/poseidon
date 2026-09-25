---
name: release
description: Release Poseidon using Release Please and publish Firebase Hosting.
---

# Poseidon release recipe

## Release Please

1. Read `docs/VERSIONING_AND_RELEASES.md` and `AGENTS.md`.
2. Confirm the working tree is clean and `main` is current with `origin/main`.
3. Run `npm run gate`. Do not continue if it fails.
4. Use the configured Release Please workflow to create/update its release PR; do
   not manually edit package versions, tags, or changelog. Review the proposed
   version and changes, then merge the release PR when the user has requested a
   release.
5. Confirm Release Please published the matching `poseidon-vX.Y.Z` tag and
   GitHub Release. GitHub Pages deploys automatically from `main` via
   `.github/workflows/deploy-pages.yml`.

## Firebase Hosting

Firebase Hosting is a separate production target configured in `firebase.json`.
The project default is `poseidon-e1e34` in `.firebaserc`.

After the release source is committed and pushed, run:

```bash
npm run release:hosting
```

This builds the app and deploys only Firebase Hosting. Firebase CLI uses the
configured project; verify `npx -y firebase-tools@latest use` before deployment.
Do not assume the GitHub Pages deployment also updated Firebase Hosting.
The Hosting config disables browser caching for the app shell, service worker,
and creature assets so phones fetch the current release; preserve these headers
when changing `firebase.json`.

If `firestore.rules` or `firestore.indexes.json` changed in the release, review
the change and deploy those targets too:

```bash
npx -y firebase-tools@latest deploy --only firestore:rules,firestore:indexes
```

When deploying Hosting and changed Firestore configuration together, use
`--only hosting,firestore:rules,firestore:indexes`. Do not deploy unrelated
Firestore changes when neither rules nor indexes changed. Verify deployment
output and the live Hosting response before reporting success.
