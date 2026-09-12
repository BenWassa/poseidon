# Poseidon versioning and release contract

Issue authority: [#26 — Versioning & release system: SemVer, build identity, changelog and GitHub Releases](https://github.com/BenWassa/poseidon/issues/26)

Status: **infrastructure implemented; bootstrap release pending** (see `docs/PROJECT_STATUS.md`)

This document defines the intended versioning and release model for Poseidon. It is deliberately separate from persistence/export schema versioning, asset schema versioning and deployment mechanics.

## Purpose

Poseidon needs durable answers to four separate questions:

1. What named product release is this?
2. What exact source revision is running?
3. What changed between named releases?
4. Can this build safely read/migrate/restore a particular data shape?

One number cannot answer all four without creating ambiguity. The system therefore uses separate identifiers with explicit responsibilities.

## Terminology

### Product version

The human-facing Poseidon release version.

Format:

```text
MAJOR.MINOR.PATCH
```

Example:

```text
0.3.0
```

The corresponding Git tag and GitHub Release are:

```text
v0.3.0
```

### Build revision

The exact Git commit used to build the running application.

Human display uses a short SHA, for example:

```text
build a1b2c3d
```

Machine-readable diagnostics may retain the full SHA.

The build revision identifies deployments between named releases and is the authority when debugging an exact deployed build.

### Schema version

A compatibility identifier for a persisted or serialized data structure.

Schema versions are not product versions. They exist only where migration/validation logic requires them.

### Deployment

A built revision published to GitHub Pages.

The current repository deploys `main` continuously. A deployment therefore does not automatically create a named product release.

### Release

An intentional named checkpoint consisting of:

- a SemVer product version;
- an immutable `vX.Y.Z` Git tag;
- a GitHub Release;
- a changelog entry;
- one exact source revision.

## Standards

Poseidon follows:

- Semantic Versioning 2.0.0: https://semver.org/
- Conventional Commits 1.0.0 at the merge/squash boundary: https://www.conventionalcommits.org/
- GitHub Releases as the release record: https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
- Release Please as the preferred release-PR automation: https://github.com/googleapis/release-please

The intent is to use mature standards while keeping the workflow proportionate to a single private-product monorepo.

## Canonical product version

The root `package.json` `version` field is the canonical Poseidon product version.

Current repository state declares `0.1.0` in:

- root `package.json`;
- `apps/web/package.json`;
- `packages/domain/package.json`.

The implementation of #26 must remove this duplication as independent state. The preferred end state is:

- root `package.json` retains the canonical product version;
- private workspaces do not maintain independently meaningful release versions;
- application code does not define another handwritten version constant.

If tooling requires workspace package versions, they must be mechanically synchronized and validated against the root. They must never become separate release streams.

## Semantic Versioning policy

### Pre-1.0

Poseidon remains pre-1.0 until the owner explicitly declares the product contract stable enough for `1.0.0`.

For `0.MINOR.PATCH` releases:

#### Minor bump

Use a minor bump for a meaningful new product capability or substantial product/content expansion.

Examples:

- adding a new major user workflow;
- substantial Atlas/Collection capability;
- meaningful new dive-history functionality;
- a large new supported-region/content expansion;
- an intentionally incompatible product contract while Poseidon is still pre-1.0.

Example:

```text
0.3.2 -> 0.4.0
```

#### Patch bump

Use a patch bump for backwards-compatible corrections and refinements.

Examples:

- bug fixes;
- accessibility fixes;
- safe UX corrections;
- performance fixes;
- browser/PWA compatibility fixes;
- content corrections;
- biological/art corrections;
- deployment/release infrastructure fixes that do not create a new product capability.

Example:

```text
0.4.0 -> 0.4.1
```

#### No immediate release required

The following do not require a named release merely because they merge:

- documentation-only work;
- tests;
- CI refactors;
- internal refactors with no product effect;
- developer tooling;
- planning/status updates.

They remain part of the exact deployed build revision if they reach `main`.

### 1.0 and later

After the explicit `1.0.0` decision:

- **MAJOR** — incompatible public/product contract change;
- **MINOR** — backwards-compatible functionality;
- **PATCH** — backwards-compatible fixes.

A breaking persisted-data change is not automatically a major release if users are migrated safely and the supported product contract remains compatible. Conversely, a change can warrant a major product version without changing any persistence schema.

## What counts as the public/product contract

For Poseidon, SemVer is not describing a published library API. It describes the stable behavior relied on by the owner/user and by the app's own durable data lifecycle.

Relevant contract surfaces include:

- ability to open and use existing personal dive history;
- documented export/restore guarantees;
- supported navigation and primary workflows;
- meaning of canonical personal-history records;
- documented compatibility promises;
- release/install/update expectations where explicitly guaranteed.

Internal component APIs, file locations and implementation details are not product-contract surfaces unless intentionally documented as such.

## Build identity

Every production build must expose both:

```text
productVersion = 0.3.0
buildRevision = a1b2c3d...
```

Recommended visible form:

```text
Poseidon v0.3.0 · build a1b2c3d
```

### Rules

- Product version comes from the canonical root package metadata.
- Git SHA is injected by the build/deployment environment.
- A source edit is not required for every deployment.
- The full SHA should remain available to diagnostics/tests even if the UI shows only seven characters.
- Timestamps may be recorded as supplementary diagnostics but are not release identity.
- Do not use timestamps as the product version.
- Do not infer compatibility from a Git SHA.

### UI placement

Build information should live in a restrained support-oriented surface, preferably the existing Data & Backup/account area.

It should not appear persistently on Home, Journal, Collection, Atlas or Log Dive.

The implementation should make the version/build string easy to report or copy when debugging.

## Continuous deployment versus releases

Poseidon currently deploys GitHub Pages on every push to `main`.

That model remains valid.

Therefore:

```text
main deployment != named release
```

A running build may contain commits newer than the latest GitHub Release.

This is acceptable because:

- the build revision identifies the exact deployed code;
- the named release remains a stable human checkpoint;
- feature work does not need a version bump merely to deploy;
- release notes remain meaningful rather than becoming one-entry-per-commit noise.

The implementation of #26 must not silently change production deployment to tag-only releases unless a separate deliberate product decision is made.

## Existing independent version domains

Poseidon already contains multiple legitimate non-product version identifiers. They must remain separate.

### Persisted personal-state schema

The domain persistence layer currently uses `CURRENT_SCHEMA_VERSION` and migration logic.

Its only purpose is safe local/persisted state compatibility.

Rules:

- bump only when the persisted shape/meaning requires migration or stricter validation;
- preserve migration tests;
- never compare this value with app SemVer.

### Export/restore compatibility

Export/restore validation depends on the persisted/export structure and schema compatibility.

Rules:

- app product version may optionally be added later as diagnostic provenance;
- restore acceptance must continue to depend on explicit schema/validation logic, not on app SemVer;
- an export created by an older app version may remain perfectly valid.

### Creature runtime manifest version

Creature runtime manifests use a format/schema version for deterministic asset metadata.

It is independent from the Poseidon app version.

### Source-art catalog schema version

The editorial source-art catalog has its own schema version.

It changes only when the catalog format changes.

### Firestore rules language version

`rules_version = '2'` is Firebase Rules syntax/language configuration and has no relationship to Poseidon product releases.

## Changelog policy

Add a root `CHANGELOG.md` as the durable human-readable release history.

### Principles

- Release notes describe product/user impact rather than raw Git mechanics.
- Published release entries are treated as immutable historical records.
- Factual corrections happen through explicit follow-up commits rather than silent history rewriting.
- Do not invent historical releases for commits that were never released as such.
- The first release after #26 is a deliberate bootstrap release from a known-green baseline.

### Preferred categories

The generated/reviewed changelog should prioritize useful categories such as:

- Features
- Fixes
- Performance
- Accessibility
- Content / data
- Internal / infrastructure only when materially relevant

Routine refactors, formatting and test churn should not dominate user-facing notes.

## Conventional Commit policy

Poseidon adopts Conventional Commits prospectively at the final merge/squash boundary.

The goal is deterministic release automation, not policing every local work-in-progress commit.

### Minimum release-relevant types

```text
feat: ...
fix: ...
perf: ...
```

Additional accepted types include:

```text
docs:
test:
ci:
build:
chore:
refactor:
```

Breaking intent is expressed with either:

```text
feat!: ...
```

or a `BREAKING CHANGE:` footer.

### Pull requests

Poseidon generally uses focused PRs and squash merges. The PR title should therefore be suitable as the final squash commit message.

Examples:

```text
feat(atlas): add regional dive-site map
fix(pwa): preserve offline cold start after update
docs: define versioning and release policy
```

Historical commits are not rewritten to conform.

## Release automation

Preferred implementation: Release Please via GitHub Actions.

### Why Release Please

It provides a reviewable release PR rather than publishing directly from arbitrary merges.

Expected lifecycle:

1. normal focused work merges to `main`;
2. Release Please evaluates release-relevant merged commits;
3. it maintains a release PR proposing the next version and changelog;
4. the release PR is reviewed like normal source changes;
5. merging the release PR creates the `vX.Y.Z` tag and GitHub Release;
6. the release points to one immutable source revision.

This avoids a bespoke release database or opaque custom script.

### Pre-1.0 automation requirement

The automation must be configured/tested so a pre-1.0 breaking change does not accidentally force `1.0.0` merely because a generic SemVer tool interprets `BREAKING CHANGE` as a major bump.

The repository policy above remains authority until the owner explicitly chooses `1.0.0`.

## Release bootstrap

Poseidon has no existing GitHub Releases at the time this policy is written.

Bootstrap rules:

1. Land #26 release/versioning infrastructure without creating a tag as an incidental CI side effect.
2. Keep `0.1.0` as the starting declared product version unless implementation discovers a concrete technical conflict.
3. Establish one known-green baseline after the infrastructure is merged.
4. Create the first `v0.1.0` GitHub Release intentionally from that baseline.
5. Do not create fictional historical `v0.x.y` tags for older commits.
6. Future releases follow the release-PR flow.

## Git tag and GitHub Release rules

For every named release:

```text
tag: vX.Y.Z
release title: Poseidon vX.Y.Z
```

Rules:

- the tag points at the exact released revision;
- the tag is not moved after publication;
- the release is not silently replaced with different code;
- prereleases, if introduced later, must use valid SemVer prerelease identifiers such as `0.5.0-beta.1`;
- build metadata such as `+sha.abc1234` is diagnostic and does not replace the Git tag.

## PWA and cache behavior

The product version must not become a service-worker cache invalidation mechanism.

Vite/PWA asset revisioning continues to own cache invalidation and update behavior.

The versioning implementation must preserve:

- installability;
- standalone launch;
- offline cold start after cache establishment;
- base-path/hash-route behavior;
- update behavior;
- auth/persistence boundaries;
- existing field-readiness acceptance.

A version bump alone should not cause a special data reset, cache purge or forced reload.

## Verification and drift prevention

Implementation should add the smallest useful deterministic checks.

Required checks:

- canonical product version is valid SemVer;
- duplicated workspace package metadata cannot disagree with the canonical version;
- build receives a product version;
- production/CI build receives a Git SHA;
- build-info utility has tests;
- the UI support surface renders the expected version/build form;
- release workflow/configuration is parseable and repository-scoped;
- existing full repository gate remains green.

The preferred pattern is a single build-info module/utility, not repeated environment reads throughout React components.

## Expected implementation shape

The exact filenames may change during implementation, but #26 should produce roughly:

```text
package.json                         # canonical product version
CHANGELOG.md                         # named release history
.github/workflows/release*.yml      # release-PR / tag automation
release-please-config.json          # or equivalent mature-tool config
.release-please-manifest.json       # if required by chosen strategy
apps/web/src/.../buildInfo.ts       # typed application-facing build identity
apps/web/...                        # restrained support UI
```

A small repository-owned validation script may be added if existing tooling cannot verify version consistency cleanly.

## Release decision examples

| Change | Version effect before 1.0 | Reason |
| --- | --- | --- |
| Add a major new Log Dive capability | minor | new product capability |
| Add a substantial new geographic/content expansion | minor | meaningful product expansion |
| Fix incorrect back-navigation behavior | patch | backwards-compatible correction |
| Correct species copy/art | patch | content correctness |
| Fix offline install/update defect | patch | compatibility/reliability fix |
| Refactor store internals with no behavior change | none required | internal only |
| Add developer mock-data tooling | none required unless bundled with other release work | developer-only capability |
| Change persistence schema with safe automatic migration and unchanged user contract | based on user impact, often patch/minor | schema version and product version are independent |
| Remove support for existing personal history without migration after 1.0 | major | incompatible product/data contract |

## Non-goals

#26 does not introduce:

- independent release versions for `apps/web` and `packages/domain`;
- npm package publishing;
- Android `versionCode` / `versionName`;
- iOS bundle/build numbers;
- native-store release workflows;
- forced updates;
- release-per-commit versioning;
- Calendar Versioning;
- automatic data-schema changes from SemVer;
- historical tag reconstruction;
- broad deployment redesign.

If a native wrapper is added later, platform-specific build/version integers should map from this product release system without replacing it.

## Implementation acceptance

#26 is complete only when all of the following are true:

- exactly one authoritative product version exists;
- a running build can report both product version and exact Git revision;
- release, deployment and schema terminology is unambiguous;
- pre-1.0 bump behavior is automated deliberately;
- a root changelog exists;
- the release process is reviewable before tags/releases are published;
- GitHub Release/tag creation is deterministic and documented;
- release automation does not publish on ordinary CI by accident;
- existing PWA/update/offline/auth/persistence behavior is preserved;
- `npm run gate` passes;
- the initial release is intentionally bootstrapped rather than retroactively fabricated.
