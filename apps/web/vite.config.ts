import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const workspaceRoot = searchForWorkspaceRoot(process.cwd());

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Core logging and browsing must survive a cold start with no network,
      // so the shell, the content pack and the creature variants are precached.
      workbox: {
        globPatterns: ['**/*.{js,css,html,webp,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'Poseidon',
        short_name: 'Poseidon',
        description: 'A beautiful personal atlas of your underwater life.',
        start_url: '/',
        display: 'standalone',
        background_color: '#F2FBFC',
        theme_color: '#F2FBFC',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@poseidon/domain': fileURLToPath(new URL('../../packages/domain/src/index.ts', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    fs: { allow: [workspaceRoot] },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['test/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
