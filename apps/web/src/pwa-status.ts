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

const INSTALL_DISMISSED_KEY = 'poseidon.pwa.install-dismissed-until';
const INSTALL_REMINDER_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

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
  emit({
    ...status,
    installPromptMode: canShowInstallPrompt() ? 'native' : null,
  });
}

export function announceIosInstallAvailable() {
  if (status.installPromptMode === 'native') return;
  emit({ ...status, installPromptMode: canShowInstallPrompt() ? 'ios' : null });
}

function canShowInstallPrompt(): boolean {
  try {
    return (
      Number(window.localStorage.getItem(INSTALL_DISMISSED_KEY) ?? 0) <=
      Date.now()
    );
  } catch {
    return true;
  }
}

export function clearInstallPrompt() {
  deferredInstallPrompt = null;
  emit({ ...status, installPromptMode: null });
}

export function dismissInstallPrompt() {
  try {
    window.localStorage.setItem(
      INSTALL_DISMISSED_KEY,
      String(Date.now() + INSTALL_REMINDER_DELAY_MS),
    );
  } catch {
    // Installation guidance must remain usable when storage is unavailable.
  }
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
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'dismissed') {
      dismissInstallPrompt();
      return;
    }
  } finally {
    clearInstallPrompt();
  }
}

export async function applyUpdate() {
  if (!updateServiceWorker) return;
  await updateServiceWorker(true);
}

export function resetPwaStatus() {
  status = INITIAL_STATUS;
  updateServiceWorker = null;
  deferredInstallPrompt = null;
  try {
    window.localStorage.removeItem(INSTALL_DISMISSED_KEY);
  } catch {
    // Tests can reset module state even if storage is disabled.
  }
  for (const listener of listeners) listener();
}
