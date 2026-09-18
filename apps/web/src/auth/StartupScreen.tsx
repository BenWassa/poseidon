import { useCallback, useEffect, useRef, useState } from 'react';

import { ACTION_PRIMARY } from '../components/ui';
import { useAuth } from './AuthProvider';

const INTRO_SEEN_KEY = 'poseidon.startup.seen';
const STARTUP_ASSET_ROOT = `${import.meta.env.BASE_URL}assets/brand/startup`;

function shouldSkipMotion(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return (
      window.sessionStorage.getItem(INTRO_SEEN_KEY) === '1' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  } catch {
    return (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? true
    );
  }
}

function rememberIntro(): void {
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, '1');
  } catch {
    // The sequence still works when storage is unavailable.
  }
}

export function StartupScreen({ authReady }: { authReady: boolean }) {
  const { signInWithGoogle, error } = useAuth();
  const [introComplete, setIntroComplete] = useState(shouldSkipMotion);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const finishIntro = useCallback(() => {
    rememberIntro();
    setIntroComplete(true);
  }, []);

  useEffect(() => {
    if (introComplete) return;
    const fallback = window.setTimeout(finishIntro, 12_000);
    return () => window.clearTimeout(fallback);
  }, [finishIntro, introComplete]);

  useEffect(() => {
    if (introComplete) return;
    const video = videoRef.current;
    if (!video) return;
    const playback = video.play() as Promise<void> | undefined;
    void playback?.catch(finishIntro);
  }, [finishIntro, introComplete]);

  return (
    <main className="startup" aria-label="Poseidon welcome">
      <div className="startup__brand" aria-hidden={introComplete || videoReady}>
        <span className="startup__wordmark">Poseidon</span>
        <span className="startup__rule" />
        <span className="startup__tagline">Your underwater life</span>
      </div>

      <img
        className={`startup__still ${introComplete ? 'startup__still--visible' : ''}`}
        src={`${STARTUP_ASSET_ROOT}/splash-still.webp`}
        alt=""
        width="1088"
        height="1445"
        fetchPriority="high"
      />

      {!introComplete ? (
        <video
          ref={videoRef}
          className={`startup__video ${videoReady ? 'startup__video--visible' : ''}`}
          src={`${STARTUP_ASSET_ROOT}/splash.mp4`}
          muted
          playsInline
          autoPlay
          preload="auto"
          aria-hidden="true"
          onCanPlay={() => setVideoReady(true)}
          onEnded={finishIntro}
          onError={finishIntro}
        />
      ) : null}

      <div className="startup__shade" aria-hidden="true" />

      <section
        className={`startup__welcome ${introComplete ? 'startup__welcome--visible' : ''}`}
        aria-hidden={!introComplete}
      >
        <div>
          <p className="startup__eyebrow">Poseidon</p>
          <h1>Your underwater life</h1>
          <p className="startup__copy">
            Every dive, place and creature, kept as one beautiful personal
            atlas.
          </p>
        </div>

        <div className="startup__action safe-bottom">
          {authReady ? (
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              className={`${ACTION_PRIMARY} startup__button`}
              tabIndex={introComplete ? 0 : -1}
            >
              Continue with Google
            </button>
          ) : (
            <p className="startup__loading" role="status">
              Opening your atlas…
            </p>
          )}
          {error ? (
            <p role="alert" className="startup__error">
              {error.message}
            </p>
          ) : null}
        </div>
      </section>
    </main>
  );
}
