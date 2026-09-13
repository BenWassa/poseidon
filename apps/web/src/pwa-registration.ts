import { registerSW } from 'virtual:pwa-register';

import {
  announceInstallAvailable,
  announceIosInstallAvailable,
  announceOfflineReady,
  announceUpdateAvailable,
  clearInstallPrompt,
  type DeferredInstallPrompt,
} from './pwa-status';

function isStandalone(): boolean {
  const iosNavigator = navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    iosNavigator.standalone === true
  );
}

function isIosDevice(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/**
 * Development never wants a service worker, and one left over from a production
 * build, `npm run preview`, the PWA probes or an installed PWA on the same
 * origin does real damage: it keeps serving its precached production bundle on
 * top of the development server. The symptom is silent — no console error, no
 * development badge, no `?mock=` handling, and source edits that never appear,
 * because the development code is never fetched at all.
 *
 * So in a development build, release any worker and its caches instead of
 * registering one. Production behaviour is untouched.
 */
async function releaseDevelopmentServiceWorkers(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length === 0) return;

    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );

    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
    }

    // Unregistering does not detach a worker that is already controlling this
    // page; only a reload does. The reloaded page finds no registration and
    // falls straight through the early return above, so this cannot loop.
    if (navigator.serviceWorker.controller) window.location.reload();
  } catch {
    // Nothing here may stop the development application from booting.
  }
}

/**
 * `registerType: 'prompt'` (vite.config.ts) deliberately never swaps a diver's
 * live app out from under them — the "Update" banner only appears once the
 * browser's own service worker has re-fetched sw.js and found new precache
 * revisions, and applying it is always the diver's own click. Left to the
 * browser alone, that re-fetch is only guaranteed on navigation and throttled
 * to roughly once every 24 hours, so a diver who reopens an already-installed
 * PWA can sit on a build from before the latest deploy far longer than a
 * fresh HD-art promotion should ever be invisible for. Polling `update()`
 * here just asks the browser to redo that same safe check sooner — hourly,
 * and whenever the app is foregrounded again — so the prompt shows up
 * promptly without ever forcing a reload on its own.
 */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function registerPoseidonServiceWorker() {
  if (import.meta.env.DEV) {
    void releaseDevelopmentServiceWorkers();
  } else {
    const updateServiceWorker = registerSW({
      immediate: true,
      onNeedRefresh() {
        announceUpdateAvailable(updateServiceWorker);
      },
      onOfflineReady() {
        announceOfflineReady();
      },
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;

        setInterval(() => void registration.update(), UPDATE_CHECK_INTERVAL_MS);

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible')
            void registration.update();
        });
      },
    });
  }

  if (!isStandalone() && isIosDevice()) {
    announceIosInstallAvailable();
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    if (isStandalone()) return;
    event.preventDefault();
    announceInstallAvailable(event as unknown as DeferredInstallPrompt);
  });

  window.addEventListener('appinstalled', clearInstallPrompt);
}
