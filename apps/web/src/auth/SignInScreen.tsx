/**
 * The only screen a not-signed-in visitor can reach. Full-bleed, no bottom
 * nav — this sits outside AppShell's chrome (see AuthGate).
 */
import { Waves } from 'lucide-react';

import { ACTION_PRIMARY, Card, Eyebrow } from '../components/ui';
import { useAuth } from './AuthProvider';

export function SignInScreen() {
  const { signInWithGoogle, error } = useAuth();

  return (
    <div className="flex h-[100dvh] w-full items-center justify-center bg-tide px-5">
      <Card className="w-full max-w-sm p-7 text-center">
        <span className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-shallows text-marine">
          <Waves size={36} aria-hidden="true" />
        </span>
        <Eyebrow>Poseidon</Eyebrow>
        <h1 className="mt-1 mb-2 text-2xl font-black text-ocean">
          Sign in to your dive log
        </h1>
        <p className="mb-6 text-sm leading-relaxed font-medium text-ocean/60">
          Poseidon is a personal record, kept in your account. Sign in with
          Google to reach it.
        </p>
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className={ACTION_PRIMARY}
        >
          Continue with Google
        </button>
        {error ? (
          <p role="alert" className="mt-4 text-sm font-bold text-coral">
            {error.message}
          </p>
        ) : null}
      </Card>
    </div>
  );
}
