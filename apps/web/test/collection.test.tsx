import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { contentPack, creatures } from '../src/data/content';
import { renderPoseidon } from './harness';

describe('Marine Collection full guide', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the complete curated guide before the first logged dive', async () => {
    renderPoseidon('/collection');

    expect(
      await screen.findByRole('heading', {
        name: `0 of ${creatures.length} seen`,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Not yet seen/ })).toHaveLength(
      creatures.length,
    );

    const statusFilters = screen.getByRole('group', {
      name: 'Filter by discovery status',
    });
    expect(
      within(statusFilters).getByRole('button', { name: /All/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(statusFilters).getByRole('button', { name: /Seen/ }),
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps search and discovery filters usable together', async () => {
    const { user } = renderPoseidon('/collection');
    await screen.findByRole('heading', {
      name: `0 of ${creatures.length} seen`,
    });

    await user.type(screen.getByLabelText('Search marine guide'), 'Chelonia');
    expect(screen.getByText('Green sea turtle')).toBeInTheDocument();

    const statusFilters = screen.getByRole('group', {
      name: 'Filter by discovery status',
    });
    await user.click(
      within(statusFilters).getByRole('button', { name: /^Seen\s*0$/ }),
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'No creatures match these filters.',
    );

    await user.click(
      within(statusFilters).getByRole('button', {
        name: new RegExp(`^Not yet seen\\s*${creatures.length}$`),
      }),
    );
    expect(screen.getByText('Green sea turtle')).toBeInTheDocument();
  });

  it('opens unseen Creature Detail with full curated information', async () => {
    const { user } = renderPoseidon('/collection');
    await screen.findByRole('heading', {
      name: `0 of ${creatures.length} seen`,
    });

    await user.click(screen.getByRole('link', { name: /Green sea turtle/ }));

    expect(
      await screen.findByRole('heading', { name: 'Green sea turtle' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Chelonia mydas')).toBeInTheDocument();
    expect(
      screen.getByText(/You have not logged this creature yet/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Curated context' }),
    ).toBeInTheDocument();
  });

  it('keeps a curated missing-art creature browseable through the fallback', async () => {
    const fallbackCreature = {
      ...creatures[0],
      artwork: { status: 'missing' as const, aspectRatio: 1 },
    };
    const fallbackContent = {
      ...contentPack,
      creatures: (contentPack.creatures ?? []).map((creature) =>
        creature.id === fallbackCreature.id ? fallbackCreature : creature,
      ),
    };

    const { user } = renderPoseidon('/collection', {
      content: fallbackContent,
    });
    await screen.findByRole('heading', {
      name: `0 of ${creatures.length} seen`,
    });

    await user.type(
      screen.getByLabelText('Search marine guide'),
      fallbackCreature.commonName,
    );
    const link = screen.getByRole('link', {
      name: new RegExp(fallbackCreature.commonName, 'i'),
    });
    expect(link).toHaveTextContent('Not yet seen');
    expect(within(link).queryByTestId('creature-artwork')).not.toBeInTheDocument();

    await user.click(link);
    expect(
      await screen.findByRole('heading', { name: fallbackCreature.commonName }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Artwork for this creature is still to come/),
    ).toBeInTheDocument();
  });
});
