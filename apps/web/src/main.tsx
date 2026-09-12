import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { App } from './App';
import { AuthGate } from './auth/AuthGate';
import { AuthProvider } from './auth/AuthProvider';
import { registerPoseidonServiceWorker } from './pwa-registration';
import './index.css';

registerPoseidonServiceWorker();

const container = document.getElementById('root');
if (!container) throw new Error('Poseidon could not find its root element.');

createRoot(container).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
);
