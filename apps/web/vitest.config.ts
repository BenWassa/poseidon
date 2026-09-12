import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { getBuildIdentity } from '../../tools/release/build-identity.mjs';

const { productVersion, buildRevision } = getBuildIdentity();

export default defineConfig({
  define: {
    __POSEIDON_VERSION__: JSON.stringify(productVersion),
    __POSEIDON_BUILD_SHA__: JSON.stringify(buildRevision),
  },
  resolve: {
    alias: {
      '@poseidon/domain': fileURLToPath(
        new URL('../../packages/domain/src/index.ts', import.meta.url),
      ),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
