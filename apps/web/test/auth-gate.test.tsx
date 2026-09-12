/**
 * The gate's one job: a cache miss or offline read must never be read as
 * "not approved". Only a server-confirmed negative may demote a previously
 * approved diver.
 */
import { render, screen, waitFor } from '@testing-library/react';
import type { DocumentSnapshot } from 'firebase/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/firebase/config', () => ({
  db: {},
  auth: {},
  googleProvider: {},
}));

const authStateListeners = new Set<(user: unknown) => void>();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(
    (_auth: unknown, listener: (user: unknown) => void) => {
      authStateListeners.add(listener);
      return () => authStateListeners.delete(listener);
    },
  ),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db: unknown, _collection: string, id: string) => ({ id })),
  getDocFromServer: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
}));

const { getDocFromServer } = await import('firebase/firestore');
const { AuthProvider } = await import('../src/auth/AuthProvider');
const { AuthGate } = await import('../src/auth/AuthGate');

function emitUser(user: { uid: string; email: string } | null) {
  for (const listener of authStateListeners) listener(user);
}

function missing(): DocumentSnapshot {
  return { exists: () => false as const } as unknown as DocumentSnapshot;
}

function approved(): DocumentSnapshot {
  return {
    exists: () => true as const,
    data: () => ({ approved: true }),
  } as unknown as DocumentSnapshot;
}

const diver = { uid: 'uid-1', email: 'diver@example.com' };

describe('AuthGate', () => {
  beforeEach(() => {
    window.localStorage.clear();
    authStateListeners.clear();
    vi.mocked(getDocFromServer).mockReset();
  });

  it('shows sign-in when signed out', async () => {
    render(
      <AuthProvider>
        <AuthGate>
          <div>secret dive log</div>
        </AuthGate>
      </AuthProvider>,
    );
    emitUser(null);

    expect(await screen.findByText('Your underwater life')).toBeInTheDocument();
  });

  it('shows the pending screen for a signed-in user the server confirms is not approved', async () => {
    vi.mocked(getDocFromServer).mockResolvedValue(missing());
    render(
      <AuthProvider>
        <AuthGate>
          <div>secret dive log</div>
        </AuthGate>
      </AuthProvider>,
    );
    emitUser(diver);

    expect(await screen.findByText('Waiting for approval')).toBeInTheDocument();
  });

  it('reveals the app for a server-confirmed approved user', async () => {
    vi.mocked(getDocFromServer).mockResolvedValue(approved());
    render(
      <AuthProvider>
        <AuthGate>
          <div>secret dive log</div>
        </AuthGate>
      </AuthProvider>,
    );
    emitUser(diver);

    expect(await screen.findByText('secret dive log')).toBeInTheDocument();
  });

  it('does not lock out a previously-approved diver when the approval check is offline', async () => {
    window.localStorage.setItem(
      'poseidon.auth.approved',
      JSON.stringify({
        uid: diver.uid,
        email: diver.email,
        approved: true,
        at: 'x',
      }),
    );
    vi.mocked(getDocFromServer).mockRejectedValue(new Error('unavailable'));

    render(
      <AuthProvider>
        <AuthGate>
          <div>secret dive log</div>
        </AuthGate>
      </AuthProvider>,
    );
    emitUser(diver);

    expect(await screen.findByText('secret dive log')).toBeInTheDocument();
  });

  it('does not fall back to a stale sticky flag once the server confirms approval was revoked', async () => {
    window.localStorage.setItem(
      'poseidon.auth.approved',
      JSON.stringify({
        uid: diver.uid,
        email: diver.email,
        approved: true,
        at: 'x',
      }),
    );
    vi.mocked(getDocFromServer).mockResolvedValue(missing());

    render(
      <AuthProvider>
        <AuthGate>
          <div>secret dive log</div>
        </AuthGate>
      </AuthProvider>,
    );
    emitUser(diver);

    expect(await screen.findByText('Waiting for approval')).toBeInTheDocument();
    await waitFor(() =>
      expect(window.localStorage.getItem('poseidon.auth.approved')).toBeNull(),
    );
  });
});
