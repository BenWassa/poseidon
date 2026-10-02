import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { registerPoseidonServiceWorker } from './pwa-registration';
import './index.css';

registerPoseidonServiceWorker();

/**
 * The portfolio demo build: seeded in-memory history, no sign-in, no Firebase.
 * Nothing here is reachable from a default build, and nothing in
 * `bootstrapStandard` (auth, Firestore) is reachable from this one.
 */
async function bootstrapDemo(container: HTMLElement): Promise<void> {
  const [{ App }, { PoseidonProvider }, mock, { resolveDemoPreset }, notice] =
    await Promise.all([
      import('./App'),
      import('./data/provider'),
      import('./dev/mock-data'),
      import('./dev/demo'),
      import('./dev/DemoNotice'),
    ]);
  const client = await mock.createMockPoseidonClient(
    resolveDemoPreset(window.location.search),
  );

  createRoot(container).render(
    <StrictMode>
      <HashRouter>
        <PoseidonProvider client={client}>
          <App banner={<notice.DemoNotice />} />
        </PoseidonProvider>
      </HashRouter>
    </StrictMode>,
  );
}

async function bootstrapStandard(container: HTMLElement): Promise<void> {
  let application: ReactNode = null;
  let devBadge: ReactNode = null;
  let devAssetReview: ReactNode = null;

  // Keep this guard inline: Vite replaces DEV at build time, which makes the
  // entire development block unreachable and removable from production output.
  // Nothing inside it — the selection, the badge, the seed — can be reached by
  // a stored preference or a `?mock=` parameter in a production build.
  if (import.meta.env.DEV) {
    const [{ readDevSelection }, { DevModeBadge }, { DevAssetReview }] =
      await Promise.all([
        import('./dev/selection'),
        import('./dev/DevModeBadge'),
        import('./dev/DevAssetReview'),
      ]);
    const selection = readDevSelection(window.location.search);
    devBadge = <DevModeBadge selection={selection} />;
    devAssetReview = <DevAssetReview />;

    if (selection.kind === 'mock') {
      const [{ App }, { PoseidonProvider }, mock] = await Promise.all([
        import('./App'),
        import('./data/provider'),
        import('./dev/mock-data'),
      ]);
      const client = await mock.createMockPoseidonClient(selection.preset);
      application = (
        <PoseidonProvider client={client}>
          <App devAssetReview={devAssetReview} />
        </PoseidonProvider>
      );
    }
  }

  if (application === null) {
    const [{ App }, { AuthGate }, { AuthProvider }] = await Promise.all([
      import('./App'),
      import('./auth/AuthGate'),
      import('./auth/AuthProvider'),
    ]);
    application = (
      <AuthProvider>
        <AuthGate>
          <App devAssetReview={devAssetReview} />
        </AuthGate>
      </AuthProvider>
    );
  }

  createRoot(container).render(
    <StrictMode>
      <HashRouter>
        {application}
        {devBadge}
      </HashRouter>
    </StrictMode>,
  );
}

async function bootstrap(): Promise<void> {
  const container = document.getElementById('root');
  if (!container) throw new Error('Poseidon could not find its root element.');

  // Keep this check inline, like the DEV guard below: Vite replaces the env
  // constant at build time, so a default build drops the demo path entirely and
  // a demo build drops the whole real path (AuthProvider, AuthGate, Firebase).
  if (import.meta.env.VITE_POSEIDON_DEMO === 'true') {
    await bootstrapDemo(container);
  } else {
    await bootstrapStandard(container);
  }
}

void bootstrap();
