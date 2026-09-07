/**
 * Resolves a Chromium for local rendering/rasterisation.
 *
 * Sandboxes and CI images often ship a pre-installed browser that does not
 * match the Playwright package's expected build. Honour an explicit override
 * or a pre-installed browser when one exists, otherwise fall back to whatever
 * Playwright resolves for itself.
 */
import { existsSync } from 'node:fs';

const CANDIDATES = [process.env.POSEIDON_CHROMIUM, '/opt/pw-browsers/chromium'].filter(Boolean);

export function launchOptions(extra = {}) {
  const executablePath = CANDIDATES.find((candidate) => existsSync(candidate));
  return { ...(executablePath ? { executablePath } : {}), ...extra };
}
