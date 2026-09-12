/**
 * Development-only choice of which personal history the application boots with.
 *
 * One dev server serves both worlds. The choice lives in browser storage so it
 * survives reloads, and the `?mock=` query parameter still sets it directly for
 * scripted runs. None of this is reachable from a production build: every use
 * in `main.tsx` sits behind `import.meta.env.DEV`, which Vite replaces with
 * `false` when building for production.
 *
 * The preset vocabulary lives here rather than in `mock-data.ts` so that
 * deciding what to boot never pulls the seeded 30-dive history into the bundle.
 */

export const MOCK_PRESETS = [0, 3, 5, 15, 30] as const;
export type MockPreset = (typeof MOCK_PRESETS)[number];

export const DEFAULT_MOCK_PRESET: MockPreset = 15;

export const DEV_SELECTION_KEY = 'poseidon.dev.selection';

export type DevSelection =
  | { readonly kind: 'real' }
  | { readonly kind: 'mock'; readonly preset: MockPreset };

/**
 * Nothing stored means the real application, so a plain `npm run dev` behaves
 * exactly as it always has until someone deliberately opts into mock history.
 */
export const DEFAULT_DEV_SELECTION: DevSelection = { kind: 'real' };

function isMockPreset(value: number): value is MockPreset {
  return (MOCK_PRESETS as readonly number[]).includes(value);
}

export function resolveMockPreset(search: string): MockPreset {
  const raw = new URLSearchParams(search).get('mock');
  if (raw === null || raw === '') return DEFAULT_MOCK_PRESET;
  const parsed = Number(raw);
  if (Number.isInteger(parsed) && isMockPreset(parsed)) return parsed;
  console.warn(
    `[poseidon] unsupported mock preset "${raw}"; using ${DEFAULT_MOCK_PRESET}. Expected one of ${MOCK_PRESETS.join(', ')}.`,
  );
  return DEFAULT_MOCK_PRESET;
}

/**
 * `?mock=<preset>` selects seeded history, `?mock=off` returns to the real
 * application, and an absent parameter defers to whatever is stored.
 */
export function selectionFromSearch(search: string): DevSelection | null {
  const raw = new URLSearchParams(search).get('mock');
  if (raw === null || raw === '') return null;
  if (raw === 'off' || raw === 'real') return { kind: 'real' };
  return { kind: 'mock', preset: resolveMockPreset(search) };
}

export function parseDevSelection(raw: string | null): DevSelection | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<{ kind: string; preset: number }>;
    if (parsed.kind === 'real') return { kind: 'real' };
    if (
      parsed.kind === 'mock' &&
      typeof parsed.preset === 'number' &&
      isMockPreset(parsed.preset)
    ) {
      return { kind: 'mock', preset: parsed.preset };
    }
    return null;
  } catch {
    return null;
  }
}

export function writeDevSelection(selection: DevSelection): void {
  try {
    window.localStorage.setItem(DEV_SELECTION_KEY, JSON.stringify(selection));
  } catch {
    // A blocked store only means the choice lasts for this page session.
  }
}

/**
 * Resolve in priority order: query parameter, stored choice, then the real
 * application. A query parameter is also persisted so that the badge, later
 * reloads and in-app navigation all agree on one answer.
 */
export function readDevSelection(search: string): DevSelection {
  const fromSearch = selectionFromSearch(search);
  if (fromSearch) {
    writeDevSelection(fromSearch);
    return fromSearch;
  }
  try {
    return (
      parseDevSelection(window.localStorage.getItem(DEV_SELECTION_KEY)) ??
      DEFAULT_DEV_SELECTION
    );
  } catch {
    return DEFAULT_DEV_SELECTION;
  }
}

export function describeDevSelection(selection: DevSelection): string {
  return selection.kind === 'real'
    ? 'Real · Firebase'
    : `Mock · ${selection.preset}`;
}
