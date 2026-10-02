/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  /** `'true'` only in the portfolio demo build (`npm run build:demo`). */
  readonly VITE_POSEIDON_DEMO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Injected by vite.config.ts / vitest.config.ts via `define`. See buildInfo.ts. */
declare const __POSEIDON_VERSION__: string;
declare const __POSEIDON_BUILD_SHA__: string;
