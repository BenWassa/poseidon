/**
 * The one place the app reads its own build identity. Everything else that
 * needs to show or report a version imports `buildInfo` rather than reading
 * the injected globals directly. See docs/VERSIONING_AND_RELEASES.md.
 */
export interface BuildInfo {
  /** Canonical SemVer product version, from root package.json. */
  productVersion: string;
  /** Full Git SHA of the commit this bundle was built from. */
  buildRevision: string;
  /** First 7 characters of `buildRevision`, for restrained display. */
  shortRevision: string;
  /** Restrained, human-readable, easy-to-copy support string. */
  display: string;
}

function shorten(revision: string): string {
  return revision === 'unknown' ? revision : revision.slice(0, 7);
}

const productVersion = __POSEIDON_VERSION__;
const buildRevision = __POSEIDON_BUILD_SHA__;
const shortRevision = shorten(buildRevision);

export const buildInfo: BuildInfo = {
  productVersion,
  buildRevision,
  shortRevision,
  display: `Poseidon v${productVersion} · build ${shortRevision}`,
};
