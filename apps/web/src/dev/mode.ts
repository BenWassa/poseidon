import type { DevSelection } from './selection';

/**
 * Seeded history is reachable only from a development build. `dev` is
 * `import.meta.env.DEV`, which Vite replaces with `false` when building for
 * production, so the entire mock branch is removed from the shipped bundle no
 * matter what is stored in the browser or passed on the URL.
 */
export function isMockMode(dev: boolean, selection: DevSelection): boolean {
  return dev && selection.kind === 'mock';
}
