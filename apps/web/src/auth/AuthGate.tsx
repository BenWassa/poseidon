/**
 * Nothing in the app tree below this renders until a signed-in, approved
 * user exists. `PoseidonProvider` (and the Firestore-backed store behind it)
 * is only ever constructed once that's true, so it always has a valid uid.
 */
import { useMemo, type ReactNode } from 'react';

import { createPoseidonClient } from '../data/client';
import { PoseidonProvider } from '../data/provider';
import { FirestorePersistence } from '../firebase/FirestorePersistence';
import { useAuth } from './AuthProvider';
import { PendingApprovalScreen } from './PendingApprovalScreen';
import { SignInScreen } from './SignInScreen';

function LoadingScreen() {
  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-tide">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-shallows border-t-marine"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

function ApprovedApp({ uid, children }: { uid: string; children: ReactNode }) {
  const client = useMemo(
    () => createPoseidonClient({ persistence: new FirestorePersistence(uid) }),
    [uid],
  );
  return <PoseidonProvider client={client}>{children}</PoseidonProvider>;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  if (status === 'approved' && user) {
    return <ApprovedApp uid={user.uid}>{children}</ApprovedApp>;
  }
  if (status === 'pending') return <PendingApprovalScreen />;
  if (status === 'signed-out' || status === 'error') return <SignInScreen />;
  return <LoadingScreen />;
}
