/**
 * Shown to a signed-in Google account that isn't (yet) on the allowlist.
 * There is no in-app admin UI: the owner reviews `accessRequests` in the
 * Firebase console and adds an `approvedUsers` entry by hand.
 */
import { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';

import { ACTION_PRIMARY, ACTION_QUIET, Eyebrow } from '../components/ui';
import { useAuth } from './AuthProvider';

export function PendingApprovalScreen() {
  const { user, hasRequestedAccess, requestAccess, signOutUser, error } =
    useAuth();
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const send = async () => {
    setSending(true);
    setSendError(null);
    try {
      await requestAccess();
    } catch (caught) {
      setSendError(
        caught instanceof Error
          ? caught.message
          : 'Could not send the request.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col justify-between bg-frame px-6 pt-16 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center">
        <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-aqua-soft text-marine">
          <ShieldCheck size={36} aria-hidden="true" />
        </span>
        <Eyebrow>Poseidon</Eyebrow>
        <h1 className="mt-2 text-3xl font-black text-abyss">
          Waiting for approval
        </h1>
        <p className="mt-3 text-sm leading-relaxed font-medium text-abyss/60">
          Signed in as{' '}
          <span className="font-bold text-abyss">{user?.email}</span>. This
          account isn't approved yet.
        </p>

        {hasRequestedAccess ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-aqua-soft/50 px-5 py-3.5 text-sm font-bold text-marine">
            <Check size={16} aria-hidden="true" />
            Request sent for review
          </div>
        ) : null}
      </div>

      <div className="safe-bottom flex flex-col gap-3 px-0 pt-4 pb-8">
        {!hasRequestedAccess ? (
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending}
            className={`${ACTION_PRIMARY} w-full disabled:opacity-60`}
          >
            {sending ? 'Sending…' : 'Request access'}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => void signOutUser()}
          className={`${ACTION_QUIET} w-full`}
        >
          Sign out
        </button>

        {(sendError ?? error) ? (
          <p
            role="alert"
            className="mt-2 text-center text-sm font-bold text-coral"
          >
            {sendError ?? error?.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
