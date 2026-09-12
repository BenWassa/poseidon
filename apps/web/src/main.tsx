import { StrictMode, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { registerPoseidonServiceWorker } from './pwa-registration';
import './index.css';

registerPoseidonServiceWorker();

async function bootstrap(): Promise<void> {
  const container = document.getElementById('root');
  if (!container) throw new Error('Poseidon could not find its root element.');

  let application: ReactNode;

  if (import.meta.env.DEV && import.meta.env.MODE === 'mock') {
    const [{ App }, { PoseidonProvider }, mock] = await Promise.all([
      import('./App'),
      import('./data/provider'),
      import('./dev/mock-data'),
    ]);
    const preset = mock.resolveMockPreset(window.location.search);
    const client = await mock.createMockPoseidonClient(preset);
    application = (
      <PoseidonProvider client={client}>
        <App />
      </PoseidonProvider>
    );
  } else {
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
      <HashRouter>{application}</HashRouter>
    </StrictMode>,
  );
}

void bootstrap();
