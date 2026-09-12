import { CloudCheck, RefreshCw, X } from 'lucide-react';

import {
  applyUpdate,
  dismissOfflineReady,
  dismissUpdate,
  usePwaStatus,
} from '../pwa-status';

export function PwaNotice() {
  const { offlineReady, updateAvailable } = usePwaStatus();

  if (!offlineReady && !updateAvailable) return null;

  return (
    <aside
      aria-live="polite"
      className="safe-top absolute inset-x-4 top-0 z-50 rounded-card border border-border bg-surface p-4 shadow-float"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aqua-soft text-marine">
          {updateAvailable ? (
            <RefreshCw size={20} aria-hidden="true" />
          ) : (
            <CloudCheck size={20} aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-black text-abyss">
            {updateAvailable ? 'Update available' : 'Ready offline'}
          </p>
          <p className="mt-0.5 text-sm font-medium text-abyss/60">
            {updateAvailable
              ? 'Install it when you are ready. Your current dive will stay open until then.'
              : 'Poseidon can now open without a connection.'}
          </p>
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
          ) : null}
        </div>
        {!updateAvailable ? (
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
