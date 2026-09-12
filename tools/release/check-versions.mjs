/**
 * The root package.json version is the sole canonical Poseidon product
 * version (docs/VERSIONING_AND_RELEASES.md). Workspace packages must never
 * drift into an independent release stream, so this check fails the gate
 * the moment one disagrees with root.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function readVersion(relativePath) {
  const pkg = JSON.parse(readFileSync(resolve(repoRoot, relativePath), 'utf8'));
  return pkg.version;
}

const SEMVER = /^\d+\.\d+\.\d+$/;

const rootVersion = readVersion('package.json');
assert.match(
  rootVersion,
  SEMVER,
  `root package.json version "${rootVersion}" is not valid SemVer`,
);

const workspaces = ['apps/web/package.json', 'packages/domain/package.json'];
for (const workspace of workspaces) {
  const version = readVersion(workspace);
  assert.equal(
    version,
    rootVersion,
    `${workspace} declares version ${version}, which disagrees with the canonical root version ${rootVersion}`,
  );
}

const releaseConfig = JSON.parse(
  readFileSync(resolve(repoRoot, 'release-please-config.json'), 'utf8'),
);
const rootPackageConfig = releaseConfig.packages?.['.'];
assert.ok(
  rootPackageConfig,
  'release-please-config.json is missing a "." package entry',
);
for (const workspace of workspaces) {
  assert.ok(
    rootPackageConfig.extraFiles?.includes(workspace) ||
      rootPackageConfig['extra-files']?.includes(workspace),
    `release-please-config.json's "." package must list ${workspace} under extra-files so a release keeps it in sync`,
  );
}

const manifest = JSON.parse(
  readFileSync(resolve(repoRoot, '.release-please-manifest.json'), 'utf8'),
);
assert.equal(
  manifest['.'],
  rootVersion,
  `.release-please-manifest.json declares ${manifest['.']}, which disagrees with the canonical root version ${rootVersion}`,
);

console.log(
  `[release] canonical product version ${rootVersion} matches across all workspaces and release-please state`,
);
