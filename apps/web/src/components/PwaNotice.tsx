import { CloudCheck, Download, RefreshCw, Share2, X } from 'lucide-react';

import {
  applyUpdate,
  dismissInstallPrompt,
  dismissOfflineReady,
  dismissUpdate,
  requestInstall,
  usePwaStatus,
} from '../pwa-status';

export function PwaNotice() {
  const { offlineReady, updateAvailable, installPromptMode } = usePwaStatus();
  const showingInstall = !updateAvailable && installPromptMode !== null;
  const showingOffline = !updateAvailable && !showingInstall && offlineReady;

  if (!updateAvailable && !showingInstall && !showingOffline) return null;

  const title = updateAvailable
    ? 'Update available'
    : installPromptMode === 'native'
      ? 'Install Poseidon'
      : installPromptMode === 'ios'
        ? 'Add Poseidon to your Home Screen'
        : 'Ready offline';

  const message = updateAvailable
    ? 'Install it when you are ready. Your current dive will stay open until then.'
    : installPromptMode === 'native'
      ? 'Add Poseidon to your home screen for full-screen launch and reliable offline access.'
      : installPromptMode === 'ios'
        ? 'Tap Share in your browser, then choose Add to Home Screen.'
        : 'Poseidon can now open without a connection.';

  const NoticeIcon = updateAvailable
    ? RefreshCw
    : installPromptMode === 'native'
      ? Download
      : installPromptMode === 'ios'
        ? Share2
        : CloudCheck;

  return (
    <aside
      aria-live="polite"
      className="safe-top absolute inset-x-4 top-0 z-50 rounded-card border border-border bg-surface p-4 shadow-float"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aqua-soft text-marine">
          <NoticeIcon size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-black text-abyss">{title}</p>
          <p className="mt-0.5 text-sm font-medium text-abyss/60">{message}</p>

          {updateAvailable ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void applyUpdate()}
                className="min-h-11 rounded-full bg-marine px-4 text-sm font-black text-white"
              >
                Update
              </button>
              <button
                type="button"
                onClick={dismissUpdate}
                className="min-h-11 rounded-full border border-border px-4 text-sm font-bold text-abyss"
              >
                Later
              </button>
            </div>
          ) : installPromptMode === 'native' ? (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void requestInstall()}
                className="min-h-11 rounded-full bg-marine px-4 text-sm font-black text-white"
              >
                Install
              </button>
              <button
                type="button"
                onClick={dismissInstallPrompt}
                className="min-h-11 rounded-full border border-border px-4 text-sm font-bold text-abyss"
              >
                Not now
              </button>
            </div>
          ) : installPromptMode === 'ios' ? (
            <button
              type="button"
              onClick={dismissInstallPrompt}
              className="mt-3 min-h-11 rounded-full border border-border px-4 text-sm font-bold text-abyss"
            >
              Got it
            </button>
          ) : null}
        </div>

        {showingOffline ? (
          <button
            type="button"
            onClick={dismissOfflineReady}
            aria-label="Dismiss offline-ready message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-abyss/50"
          >
            <X size={19} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </aside>
  );
}
