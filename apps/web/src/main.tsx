import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import { App } from './App';
import { PoseidonProvider } from './data/provider';
import './index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Poseidon could not find its root element.');

createRoot(container).render(
  <StrictMode>
    <HashRouter>
      <PoseidonProvider>
        <App />
      </PoseidonProvider>
    </HashRouter>
  </StrictMode>,
);
