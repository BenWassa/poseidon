import { createContext, useContext, type ReactNode } from 'react';

export type AuthStatus =
  'loading' | 'signed-out' | 'pending' | 'approved' | 'error';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  error: Error | null;
  hasRequestedAccess: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  requestAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthContextProvider({
  value,
  children,
}: {
  value: AuthContextValue;
  children: ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider.');
  return context;
}

export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}
