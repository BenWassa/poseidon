import { registerSW } from 'virtual:pwa-register';

import { announceOfflineReady, announceUpdateAvailable } from './pwa-status';

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
}
