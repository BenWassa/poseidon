import { render, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { App } from '../src/App';
import {
  createPoseidonClient,
  type CreateClientOptions,
} from '../src/data/client';
import { PoseidonProvider } from '../src/data/provider';

/**
 * Renders the real application against the real browser persistence adapter.
 *
 * `reload` unmounts everything and builds a fresh client over the same
 * localStorage, which is exactly what a cold start does — so the persistence
 * assertions in these tests are not simulated.
 */
export function renderPoseidon(
  route = '/',
  clientOptions: CreateClientOptions = {},
) {
  const user = userEvent.setup();
  let view: RenderResult | null = null;

  const mount = (at: string) => {
    const client = createPoseidonClient(clientOptions);
    view = render(
      <MemoryRouter initialEntries={[at]}>
        <PoseidonProvider client={client}>
          <App />
        </PoseidonProvider>
      </MemoryRouter>,
    );
    return view;
  };

  mount(route);

  return {
    user,
    /** Simulates closing and reopening the app at `at`. */
    reload(at = route) {
      view?.unmount();
      return mount(at);
    },
  };
}
