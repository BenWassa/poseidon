/**
 * Gates the whole app behind Google sign-in plus an admin-managed allowlist.
 *
 * The one rule every branch below protects: a cache miss or offline read
 * must never be read as "not approved". Firestore's `approvedUsers` read is
 * identical in shape whether the document is genuinely absent or simply
 * unreachable right now, so only a server-CONFIRMED negative is allowed to
 * demote someone from `approved`. A previously-approved diver who opens the
 * app with no network stays in. See FirestorePersistence's doc comment for
 * the matching data-side rule.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDocFromServer,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { auth, db, googleProvider } from '../firebase/config';

export type AuthStatus =
  'loading' | 'signed-out' | 'pending' | 'approved' | 'error';

interface StickyApproval {
  uid: string;
  email: string;
  approved: true;
  at: string;
}

const STICKY_KEY = 'poseidon.auth.approved';
const REQUESTED_KEY_PREFIX = 'poseidon.auth.requested.';

function readSticky(): StickyApproval | null {
  try {
    const raw = window.localStorage.getItem(STICKY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StickyApproval>;
    if (parsed.uid && parsed.email && parsed.approved === true) {
      return parsed as StickyApproval;
    }
    return null;
  } catch {
    return null;
  }
}

function writeSticky(value: StickyApproval): void {
  try {
    window.localStorage.setItem(STICKY_KEY, JSON.stringify(value));
  } catch {
    // Best-effort only; worst case is no offline fallback next time.
  }
}

function clearSticky(): void {
  try {
    window.localStorage.removeItem(STICKY_KEY);
  } catch {
    // ignore
  }
}

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  error: Error | null;
  hasRequestedAccess: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  requestAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [hasRequestedAccess, setHasRequestedAccess] = useState(false);
  const checkId = useRef(0);

  useEffect(
    () =>
      onAuthStateChanged(auth, (nextUser) => {
        checkId.current += 1;
        const thisCheck = checkId.current;
        setUser(nextUser);
        setError(null);

        if (!nextUser) {
          setStatus('signed-out');
          setHasRequestedAccess(false);
          return;
        }

        const email = nextUser.email;
        if (!email) {
          setStatus('error');
          setError(new Error('This Google account has no email address.'));
          return;
        }

        try {
          setHasRequestedAccess(
            window.localStorage.getItem(
              `${REQUESTED_KEY_PREFIX}${nextUser.uid}`,
            ) === '1',
          );
        } catch {
          setHasRequestedAccess(false);
        }
        setStatus('loading');

        const sticky = readSticky();

        void (async () => {
          try {
            const snap = await getDocFromServer(
              doc(db, 'approvedUsers', email),
            );
            if (checkId.current !== thisCheck) return; // stale: user changed mid-check

            if (snap.exists() && snap.data().approved === true) {
              writeSticky({
                uid: nextUser.uid,
                email,
                approved: true,
                at: new Date().toISOString(),
              });
              setStatus('approved');
            } else {
              // Server-confirmed negative — the only case allowed to demote.
              if (sticky?.uid === nextUser.uid) clearSticky();
              setStatus('pending');
            }
          } catch {
            if (checkId.current !== thisCheck) return;
            if (sticky?.uid === nextUser.uid && sticky.email === email) {
              setStatus('approved'); // fail-open: offline, previously approved
            } else {
              setStatus('pending'); // fail-closed: offline, never confirmed
            }
          }
        })();
      }),
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error(String(caught)));
    }
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const requestAccess = useCallback(async () => {
    if (!user?.email) return;
    await setDoc(doc(db, 'accessRequests', user.uid), {
      uid: user.uid,
      email: user.email,
      ...(user.displayName ? { displayName: user.displayName } : {}),
      requestedAt: serverTimestamp(),
    });
    try {
      window.localStorage.setItem(`${REQUESTED_KEY_PREFIX}${user.uid}`, '1');
    } catch {
      // ignore
    }
    setHasRequestedAccess(true);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        error,
        hasRequestedAccess,
        signInWithGoogle,
        signOutUser,
        requestAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider.');
  return context;
}
