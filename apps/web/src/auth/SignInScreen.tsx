/**
 * The only screen a not-signed-in visitor can reach. Full-bleed, no bottom
 * nav — this sits outside AppShell's chrome (see AuthGate).
 */
import { Waves } from 'lucide-react';

import { ACTION_PRIMARY, Eyebrow } from '../components/ui';
import { useAuth } from './AuthProvider';

export function SignInScreen() {
  const { signInWithGoogle, error } = useAuth();

  return (
    <div className="flex h-[100dvh] w-full flex-col justify-between bg-frame px-6 pt-16 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center">
        <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-aqua-soft text-marine">
          <Waves size={36} aria-hidden="true" />
        </span>
        <Eyebrow>Poseidon</Eyebrow>
        <h1 className="mt-2 text-3xl font-black text-abyss">
          Your underwater life
        </h1>
        <p className="mt-3 text-sm leading-relaxed font-medium text-abyss/60">
          A beautiful personal atlas of every dive and marine-life encounter.
          Sign in to open your log.
        </p>
      </div>

      <div className="safe-bottom px-0 pt-4 pb-8">
        <button
          type="button"
          onClick={() => void signInWithGoogle()}
          className={ACTION_PRIMARY}
        >
          Continue with Google
        </button>
        {error ? (
          <p
            role="alert"
            className="mt-4 text-center text-sm font-bold text-coral"
          >
            {error.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
