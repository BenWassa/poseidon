import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { registerPoseidonServiceWorker } from './pwa-registration';
import './index.css';

registerPoseidonServiceWorker();

async function bootstrap(): Promise<void> {
  const container = document.getElementById('root');
  if (!container) throw new Error('Poseidon could not find its root element.');

  let application: ReactNode = null;
  let devBadge: ReactNode = null;

  // Keep this guard inline: Vite replaces DEV at build time, which makes the
  // entire development block unreachable and removable from production output.
  // Nothing inside it — the selection, the badge, the seed — can be reached by
  // a stored preference or a `?mock=` parameter in a production build.
  if (import.meta.env.DEV) {
    const [{ readDevSelection }, { DevModeBadge }] = await Promise.all([
      import('./dev/selection'),
      import('./dev/DevModeBadge'),
    ]);
    const selection = readDevSelection(window.location.search);
    devBadge = <DevModeBadge selection={selection} />;

    if (selection.kind === 'mock') {
      const [{ App }, { PoseidonProvider }, mock] = await Promise.all([
        import('./App'),
        import('./data/provider'),
        import('./dev/mock-data'),
      ]);
      const client = await mock.createMockPoseidonClient(selection.preset);
      application = (
        <PoseidonProvider client={client}>
          <App />
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
          <App />
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

void bootstrap();
