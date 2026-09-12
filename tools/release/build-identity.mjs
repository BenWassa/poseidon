/**
 * Resolves the two identifiers a production build must expose: the
 * canonical product version (root package.json) and the exact Git revision
 * that produced the build. See docs/VERSIONING_AND_RELEASES.md.
 *
 * The Git SHA prefers CI's own record of the commit (`GITHUB_SHA`) over a
 * local `git rev-parse`, since a shallow checkout or a build run from an
 * extracted archive may not have a working `.git` at all.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function readProductVersion() {
  const pkg = JSON.parse(
    readFileSync(resolve(repoRoot, 'package.json'), 'utf8'),
  );
  return pkg.version;
}

function readBuildRevision() {
  const fromEnv = process.env.GITHUB_SHA ?? process.env.POSEIDON_BUILD_SHA;
  if (fromEnv) return fromEnv;
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'unknown';
  }
}

export function getBuildIdentity() {
  return {
    productVersion: readProductVersion(),
    buildRevision: readBuildRevision(),
  };
}
