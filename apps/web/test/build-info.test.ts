import { describe, expect, it } from 'vitest';

import { buildInfo } from '../src/lib/buildInfo';

describe('buildInfo', () => {
  it('exposes a valid SemVer product version', () => {
    expect(buildInfo.productVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('shortens the build revision to a 7-character prefix for display', () => {
    expect(buildInfo.shortRevision).toHaveLength(7);
    expect(buildInfo.buildRevision.startsWith(buildInfo.shortRevision)).toBe(
      true,
    );
  });

  it('renders a restrained, copyable display string', () => {
    expect(buildInfo.display).toBe(
      `Poseidon v${buildInfo.productVersion} · build ${buildInfo.shortRevision}`,
    );
  });
});
