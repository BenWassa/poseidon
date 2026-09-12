/**
 * Shown to a signed-in Google account that isn't (yet) on the allowlist.
 * There is no in-app admin UI: the owner reviews `accessRequests` in the
 * Firebase console and adds an `approvedUsers` entry by hand.
 */
import { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';

import { ACTION_PRIMARY, ACTION_QUIET, Card, Eyebrow } from '../components/ui';
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
    <div className="flex h-[100dvh] w-full items-center justify-center bg-frame px-5">
      <Card className="w-full max-w-sm p-7 text-center">
        <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-aqua-soft text-marine">
          <ShieldCheck size={36} aria-hidden="true" />
        </span>
        <Eyebrow>Poseidon</Eyebrow>
        <h1 className="mt-1 mb-2 text-2xl font-black text-abyss">
          Waiting for approval
        </h1>
        <p className="mb-6 text-sm leading-relaxed font-medium text-abyss/60">
          Signed in as{' '}
          <span className="font-bold text-abyss">{user?.email}</span>. This
          account isn't approved yet.
        </p>

        {hasRequestedAccess ? (
          <p className="mb-4 flex items-center justify-center gap-1.5 text-sm font-bold text-success">
            <Check size={16} aria-hidden="true" />
            Request sent — you'll get access once it's reviewed.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending}
            className={`${ACTION_PRIMARY} w-full disabled:opacity-60`}
          >
            {sending ? 'Sending…' : 'Request access'}
          </button>
        )}
        {(sendError ?? error) ? (
          <p role="alert" className="mt-3 text-sm font-bold text-danger">
            {sendError ?? error?.message}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void signOutUser()}
          className={`${ACTION_QUIET} mt-4 w-full`}
        >
          Sign out
        </button>
      </Card>
    </div>
  );
}
