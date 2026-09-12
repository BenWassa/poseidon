import { useSyncExternalStore } from 'react';

export type InstallPromptMode = 'native' | 'ios';

export interface DeferredInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform?: string;
  }>;
}

export interface PwaStatus {
  offlineReady: boolean;
  updateAvailable: boolean;
  installPromptMode: InstallPromptMode | null;
}

type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>;

const INITIAL_STATUS: PwaStatus = {
  offlineReady: false,
  updateAvailable: false,
  installPromptMode: null,
};

let status = INITIAL_STATUS;
let updateServiceWorker: UpdateServiceWorker | null = null;
let deferredInstallPrompt: DeferredInstallPrompt | null = null;
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

export function announceInstallAvailable(prompt: DeferredInstallPrompt) {
  deferredInstallPrompt = prompt;
  emit({ ...status, installPromptMode: 'native' });
}

export function announceIosInstallAvailable() {
  if (status.installPromptMode === 'native') return;
  emit({ ...status, installPromptMode: 'ios' });
}

export function clearInstallPrompt() {
  deferredInstallPrompt = null;
  emit({ ...status, installPromptMode: null });
}

export function dismissInstallPrompt() {
  clearInstallPrompt();
}

export function dismissOfflineReady() {
  emit({ ...status, offlineReady: false });
}

export function dismissUpdate() {
  emit({ ...status, updateAvailable: false });
}

export async function requestInstall() {
  const prompt = deferredInstallPrompt;
  if (!prompt) return;
  await prompt.prompt();
  await prompt.userChoice;
  clearInstallPrompt();
}

export async function applyUpdate() {
  if (!updateServiceWorker) return;
  await updateServiceWorker(true);
}

export function resetPwaStatus() {
  status = INITIAL_STATUS;
  updateServiceWorker = null;
  deferredInstallPrompt = null;
  for (const listener of listeners) listener();
}
