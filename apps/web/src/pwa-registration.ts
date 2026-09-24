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
 * Dive logging keeps this tab open for long, backgrounded stretches (surface
 * interval, a full trip), so the browser's own "check for a new worker on
 * navigation" is not enough — nobody navigates. Poll the registration while
 * open, and re-check the moment the tab regains visibility (foregrounded
 * after being backgrounded, screen woken up), so a release made while the
 * app was idle still surfaces the "Update available" prompt promptly instead
 * of waiting for the next cold start.
 */
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

function watchForServiceWorkerUpdates(registration: ServiceWorkerRegistration) {
  const checkForUpdate = () => {
    if (navigator.onLine) void registration.update().catch(() => {});
  };

  checkForUpdate();
  window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });
  window.addEventListener('online', checkForUpdate);
  window.addEventListener('focus', checkForUpdate);
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
      onRegisteredSW(_swScriptUrl, registration) {
        if (registration) watchForServiceWorkerUpdates(registration);
      },
      onRegisterError(error) {
        console.error('Poseidon service worker registration failed', error);
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
