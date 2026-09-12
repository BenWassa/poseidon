/**
 * The states that decide whether Poseidon is trustworthy rather than merely
 * pretty: no history at all, a single dive, creatures with no artwork, and
 * artwork that fails to load.
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/dom';
import { beforeEach, describe, expect, it } from 'vitest';

import type { Creature } from '@poseidon/domain';

import { CreatureImage } from '../src/components/CreatureImage';
import { renderPoseidon } from './harness';

const curated: Creature = {
  id: 'spotted-eagle-ray',
  commonName: 'Spotted eagle ray',
  category: 'ray',
  curated: true,
  artwork: {
    status: 'curated',
    aspectRatio: 1,
    thumb: '/assets/creatures/spotted-eagle-ray/thumb.webp',
    gallery: '/assets/creatures/spotted-eagle-ray/gallery.webp',
    hero: '/assets/creatures/spotted-eagle-ray/hero.webp',
  },
};

const unillustrated: Creature = {
  id: 'splendid-toadfish',
  commonName: 'Splendid toadfish',
  category: 'reef-fish',
  curated: true,
  artwork: { status: 'missing', aspectRatio: 1 },
};

const userCreated: Creature = {
  id: 'creature_local_1',
  commonName: 'Goliath grouper',
  curated: false,
  userCreated: true,
  artwork: { status: 'missing' },
};

describe('creature artwork', () => {
  it('requests the variant the surface asked for and reserves its geometry', () => {
    const { container, rerender } = render(
      <CreatureImage creature={curated} variant="thumb" />,
    );
    const thumb = screen.getByTestId('creature-artwork');
    expect(thumb).toHaveAttribute(
      'src',
      '/assets/creatures/spotted-eagle-ray/thumb.webp',
    );
    expect(thumb).toHaveAttribute('width', '192');
    expect(thumb).toHaveAttribute('loading', 'lazy');
    expect(container.firstElementChild).toHaveStyle({ aspectRatio: '1' });

    rerender(<CreatureImage creature={curated} variant="hero" priority />);
    const hero = screen.getByTestId('creature-artwork');
    expect(hero).toHaveAttribute(
      'src',
      '/assets/creatures/spotted-eagle-ray/hero.webp',
    );
    expect(hero).toHaveAttribute('width', '1024');
    // Above-the-fold artwork must not wait for lazy loading.
    expect(hero).toHaveAttribute('loading', 'eager');
  });

  it('renders a considered mark instead of a broken image when art is missing', () => {
    render(<CreatureImage creature={unillustrated} />);
    expect(screen.queryByTestId('creature-artwork')).not.toBeInTheDocument();
    expect(screen.getByTestId('creature-mark')).toBeInTheDocument();
  });

  it('gives a creature the diver typed in a typographic mark', () => {
    render(<CreatureImage creature={userCreated} />);
    expect(screen.getByTestId('creature-mark')).toHaveTextContent('GG');
  });

  it('falls back to the mark if a variant fails to load', async () => {
    render(
      <CreatureImage creature={curated} variant="gallery" plate={false} />,
    );
    const image = screen.getByTestId('creature-artwork');
    expect(screen.queryByTestId('creature-mark')).not.toBeInTheDocument();

    fireEvent.error(image);

    await waitFor(() =>
      expect(screen.getByTestId('creature-mark')).toBeInTheDocument(),
    );
    expect(screen.queryByTestId('creature-artwork')).not.toBeInTheDocument();
  });
});

describe('sparse and empty history', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('invites a first dive rather than showing empty statistics', async () => {
    renderPoseidon('/');
    expect(
      await screen.findByRole('heading', { name: 'Your atlas starts here' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'A beautifully kept record, waiting for its first entry.',
      ),
    ).toBeInTheDocument();
    // No fabricated totals anywhere on an empty profile.
    expect(screen.queryByText(/dives ·/)).not.toBeInTheDocument();
  });

  it('gives every empty surface a way back into logging', async () => {
    const { user } = renderPoseidon('/journal');
    expect(
      await screen.findByRole('heading', { name: 'No dives yet' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Atlas/ }));
    expect(
      await screen.findByRole('heading', { name: 'No places yet' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Collection/ }));
    expect(
      await screen.findByRole('heading', { name: 'Nothing collected yet' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Log a dive' }),
    ).toBeInTheDocument();
  });

  it('records a dive with no creatures at all, because every dive belongs', async () => {
    const { user } = renderPoseidon('/log');

    await user.click(
      await screen.findByRole('button', { name: 'Playa del Carmen' }),
    );
    await user.type(screen.getByLabelText('Dive site'), 'Shore entry');
    await user.click(screen.getByRole('button', { name: /Continue/ }));
    await user.type(await screen.findByLabelText('Max depth'), '9');
    await user.type(screen.getByLabelText('Duration'), '35');
    await user.click(screen.getByRole('button', { name: /Choose creatures/ }));
    await user.click(await screen.findByRole('button', { name: /Continue/ }));

    expect(
      await screen.findByText('No creatures selected'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the dive still belongs in your record/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Save this memory/ }));

    expect(
      await screen.findByRole('heading', { name: 'Shore entry' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No creatures were logged on this dive/),
    ).toBeInTheDocument();
  });
});

describe('depth units', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('remembers the unit chosen on the last dive instead of asking every time', async () => {
    const user = userEvent.setup();
    const { reload } = renderPoseidon('/log');

    await user.click(await screen.findByRole('button', { name: 'Cozumel' }));
    await user.type(screen.getByLabelText('Dive site'), 'Paraíso');
    await user.click(screen.getByRole('button', { name: /Continue/ }));
    await user.click(await screen.findByRole('button', { name: 'ft' }));
    await user.type(screen.getByLabelText('Max depth'), '60');
    await user.type(screen.getByLabelText('Duration'), '44');
    await user.click(screen.getByRole('button', { name: /Choose creatures/ }));
    await user.click(await screen.findByRole('button', { name: /Continue/ }));
    await user.click(screen.getByRole('button', { name: /Save this memory/ }));

    expect(
      await screen.findByRole('heading', { name: 'Paraíso' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('60 ft').length).toBeGreaterThan(0);

    reload('/log');
    await user.click(await screen.findByRole('button', { name: 'Cozumel' }));
    await user.type(screen.getByLabelText('Dive site'), 'Yucab Reef');
    await user.click(screen.getByRole('button', { name: /Continue/ }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'ft' })).toHaveAttribute(
        'aria-pressed',
        'true',
      ),
    );
  });
});

describe('the phone shell', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('hides the bottom navigation while the full-screen logging flow is open', async () => {
    const { user } = renderPoseidon('/');
    expect(
      await screen.findByRole('navigation', { name: 'Main' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Log a dive' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('navigation', { name: 'Main' }),
      ).not.toBeInTheDocument(),
    );

    await user.click(
      screen.getByRole('button', { name: 'Close without saving' }),
    );
    expect(
      await screen.findByRole('navigation', { name: 'Main' }),
    ).toBeInTheDocument();
  });
});
