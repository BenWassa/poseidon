import { describe, expect, it } from 'vitest';

import { DEMO_DEFAULT_PRESET, resolveDemoPreset } from '../src/dev/demo';

describe('portfolio demo preset', () => {
  it('defaults to a populated history, never the empty one', () => {
    expect(DEMO_DEFAULT_PRESET).toBe(15);
    expect(resolveDemoPreset('')).toBe(15);
    expect(resolveDemoPreset('?mock=')).toBe(15);
  });

  it('can never be pointed back at the real application', () => {
    expect(resolveDemoPreset('?mock=off')).toBe(15);
    expect(resolveDemoPreset('?mock=real')).toBe(15);
  });

  it('honours a supported preset and falls back quietly on anything else', () => {
    expect(resolveDemoPreset('?mock=30')).toBe(30);
    expect(resolveDemoPreset('?mock=0')).toBe(0);
    expect(resolveDemoPreset('?mock=7')).toBe(15);
    expect(resolveDemoPreset('?mock=abc')).toBe(15);
  });
});
