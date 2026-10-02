import { MOCK_PRESETS, type MockPreset } from './selection';

/**
 * The portfolio demo build (`npm run build:demo`, `VITE_POSEIDON_DEMO=true`).
 *
 * Unlike development mock mode, this has no real world to switch back to:
 * there is no `?mock=off`, no stored choice and no localStorage write, so a
 * visitor can never reach the sign-in path and every reload starts from the
 * same baseline.
 *
 * Fifteen dives is the preset that reads best at a glance: enough Atlas and
 * Collection density to look lived-in, without the long scroll of thirty.
 */
export const DEMO_DEFAULT_PRESET: MockPreset = 15;

/**
 * `?mock=<preset>` may pick another seeded size (handy for screenshots).
 * Anything else — absent, `off`, `real`, unsupported — gets the default
 * populated preset rather than the real application.
 */
export function resolveDemoPreset(search: string): MockPreset {
  const raw = new URLSearchParams(search).get('mock');
  if (raw === null || raw === '') return DEMO_DEFAULT_PRESET;
  const parsed = Number(raw);
  return Number.isInteger(parsed) &&
    (MOCK_PRESETS as readonly number[]).includes(parsed)
    ? (parsed as MockPreset)
    : DEMO_DEFAULT_PRESET;
}
