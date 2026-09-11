import { useSyncExternalStore } from 'react';

export interface PwaStatus {
  offlineReady: boolean;
  updateAvailable: boolean;
}

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>;

const INITIAL_STATUS: PwaStatus = {
  offlineReady: false,
  updateAvailable: false,
};

let status = INITIAL_STATUS;
let updateServiceWorker: UpdateServiceWorker | null = null;
const listeners = new Set<() => void>();

function emit(next: PwaStatus) {
  status = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePwaStatus(): PwaStatus {
  return useSyncExternalStore(
    subscribe,
    () => status,
    () => INITIAL_STATUS,
  );
}

export function announceOfflineReady() {
  emit({ ...status, offlineReady: true });
}

export function announceUpdateAvailable(update: UpdateServiceWorker) {
  updateServiceWorker = update;
  emit({ ...status, updateAvailable: true });
}

export function dismissOfflineReady() {
  emit({ ...status, offlineReady: false });
}

export function dismissUpdate() {
  emit({ ...status, updateAvailable: false });
}

export async function applyUpdate() {
  if (!updateServiceWorker) return;
  await updateServiceWorker(true);
}

export function resetPwaStatus() {
  status = INITIAL_STATUS;
  updateServiceWorker = null;
  for (const listener of listeners) listener();
}
