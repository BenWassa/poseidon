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

export function registerPoseidonServiceWorker() {
  const updateServiceWorker = registerSW({
    immediate: true,
    onNeedRefresh() {
      announceUpdateAvailable(updateServiceWorker);
    },
    onOfflineReady() {
      announceOfflineReady();
    },
  });

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
