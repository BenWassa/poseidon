# Field readiness

Issue: #14 — v0 field readiness.

## Production deployment

Poseidon uses GitHub Pages as the v0 production host because it is static, reproducible and requires no runtime service or account system.

`.github/workflows/deploy-pages.yml` builds and verifies the Vite PWA on every push to `main`, then deploys `apps/web/dist` with the official Pages actions. The deployment base is derived from the repository name, so this repository builds for `/poseidon/` without hard-coding a user or organization hostname.

The expected project-site URL is:

`https://benwassa.github.io/poseidon/`

GitHub Pages must have **Source: GitHub Actions** enabled for the repository. This is a one-time repository setting; the workflow itself contains no secrets.

## Routing and installation

Production navigation uses hash history. A route such as Journal is therefore addressable as:

`https://benwassa.github.io/poseidon/#/journal`

This is deliberate for v0: every deep link requests the same static Pages document, so refresh/open-from-link cannot produce a host-level 404. Browser/system Back still follows the route history.

The generated web-app manifest uses the deployment base for its scope, icons and `start_url`, and requests `display: standalone`. The service worker uses automatic updates, removes obsolete caches and precaches the application shell/content/artwork needed for an offline cold start after the first successful online load.

## Automated production acceptance

`npm run verify:field --workspace @poseidon/web` runs against the built `dist/` output at a Pixel-class 412 × 915 touch viewport. The repository gate runs it using the same `/poseidon/` base as production.

It verifies:

- installability signals: manifest, 512 px icon, standalone display mode and a controlling service worker;
- offline cold start after caching;
- offline create and edit of a representative dive;
- Home, Journal, Collection and Atlas/Places coherence;
- export through the real download surface;
- clean local state followed by file-picker restore and personal-record equivalence;
- offline delete and derived-history cleanup;
- browser/system Back history through a detail route;
- no horizontal overflow at the Pixel viewport;
- the safe-area-aware minimum bottom padding used by the navigation chrome.

The normal repository gate also continues to validate sourced content, creature assets, types, unit/application tests and the production build.

## Restore safety contract

A selected backup is parsed and validated before any mutation. Restore is refused for malformed envelopes, unsupported/future export versions, unsupported/future personal schema versions, invalid personal records, duplicate identifiers, invalid relationships or unavailable creature references.

Two restore modes are explicit:

- **Merge** keeps all current history, adds only records that are missing, skips byte-semantically identical records and refuses conflicting dive/custom-creature identities rather than choosing a winner.
- **Replace** makes the validated backup the complete local personal record. The UI shows how much current history differs from the backup and requires a separate destructive confirmation before committing.

The store validates again at commit time; a successful UI preview is not an authorization token and cannot bypass the domain refusal paths.

## Physical Pixel evidence still required

Browser automation can verify the production PWA contract but cannot truthfully prove Android OS installation UI or the behaviour of a particular physical device. The owner-side closeout is intentionally recorded separately:

1. Open the deployed URL in Chrome on the target Pixel and install/add Poseidon as an app.
2. Launch from the Android launcher and confirm there is no browser chrome (`standalone`).
3. After one complete online load, enable airplane mode, fully terminate Poseidon, then cold-launch it from the launcher.
4. Run one create/edit flow with the real Android software keyboard open and confirm fields/actions are not obscured by the IME.
5. Check top cutout/status-bar and bottom gesture-bar composition on the physical device.
6. Confirm Android system Back unwinds Poseidon navigation as expected before leaving the app.
7. If practical, use the installed build after a real dive day and record any field-blocking defect separately.

Any defect found in those physical checks is a product defect; the absence of physical-device automation is not evidence that the check has passed.
