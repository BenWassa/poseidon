/**
 * The representative acceptance scenario from docs/PRD.md section 14, driven
 * through the real application against real persistence.
 */
import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { renderPoseidon } from './harness';

async function logCozumelDive(user: ReturnType<typeof renderPoseidon>['user']) {
  // Step 1 — where and when.
  await user.click(await screen.findByRole('button', { name: 'Cozumel' }));
  await user.type(screen.getByLabelText('Dive site'), 'Palancar Gardens');
  await user.click(screen.getByRole('button', { name: /Continue/ }));

  // Step 2 — dive basics.
  await user.type(await screen.findByLabelText('Max depth'), '21');
  await user.type(screen.getByLabelText('Duration'), '48');
  await user.click(screen.getByRole('button', { name: /Choose creatures/ }));

  // Step 3 — the visual gallery, with real local content.
  expect(await screen.findByText('Likely here')).toBeInTheDocument();
  await user.click(
    await screen.findByRole('button', { name: /Green sea turtle/ }),
  );
  await user.click(screen.getByRole('button', { name: /Spotted eagle ray/ }));

  // An unlisted creature must always be possible.
  await user.type(screen.getByLabelText('Search creatures'), 'Goliath grouper');
  await user.click(
    await screen.findByRole('button', { name: /Add “Goliath grouper”/ }),
  );

  await user.click(screen.getByRole('button', { name: /Continue/ }));

  // Step 4 — highlight and memory.
  await user.click(
    await screen.findByRole('button', {
      name: 'Make Spotted eagle ray the highlight of this dive',
    }),
  );
  await user.type(
    screen.getByLabelText('Note'),
    'An eagle ray came out of the blue.',
  );
  await user.click(screen.getByRole('button', { name: /Save this memory/ }));
}

describe('the representative dive-logging scenario', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('logs a dive and reflects it across the whole product, offline and across restarts', async () => {
    const { user, reload } = renderPoseidon('/log');

    await logCozumelDive(user);

    // Saving lands on the new dive, rendered as a memory.
    expect(
      await screen.findByRole('heading', { name: 'Palancar Gardens' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Cozumel').length).toBeGreaterThan(0);
    expect(screen.getAllByText('21 m').length).toBeGreaterThan(0);
    expect(screen.getAllByText('48 min').length).toBeGreaterThan(0);
    expect(
      screen.getByText('An eagle ray came out of the blue.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Creatures met' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Goliath grouper')).toBeInTheDocument();

    // Home reflects the dive and the derived lifetime shape immediately.
    await user.click(screen.getByRole('link', { name: /Home/ }));
    expect(await screen.findByText(/1 dive · 3 creatures/)).toBeInTheDocument();
    expect(screen.getByText('Latest dive')).toBeInTheDocument();

    // Journal derives a trip and restrained history marker from canonical dives.
    await user.click(screen.getByRole('link', { name: /Journal/ }));
    expect(
      await screen.findByRole('heading', { name: 'Palancar Gardens' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Cozumel —/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('First dive in this journal')).toBeInTheDocument();

    // Collection is built from the actual sightings, unlisted creature included.
    await user.click(screen.getByRole('link', { name: /Collection/ }));
    expect(await screen.findByText('3 creatures')).toBeInTheDocument();
    expect(screen.getByText('Green sea turtle')).toBeInTheDocument();
    expect(screen.getByText('Goliath grouper')).toBeInTheDocument();

    // Creature detail is grounded in personal encounter history, with sourced
    // catalogue context following rather than displacing that personal record.
    await user.click(screen.getByRole('link', { name: /Spotted eagle ray/ }));
    expect(
      await screen.findByRole('heading', { name: 'Spotted eagle ray' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Aetobatus narinari')).toBeInTheDocument();
    expect(screen.getByText('1 dive')).toBeInTheDocument();
    // The site appears both as a place chip and in the related-dive list.
    expect(screen.getAllByText('Palancar Gardens').length).toBeGreaterThan(1);
    expect(
      screen.getByRole('heading', { name: 'Curated context' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Regional relevance')).toBeInTheDocument();
    expect(
      screen.getAllByText(/REEF Geographic Zone Report/).length,
    ).toBeGreaterThan(0);

    // A creature typed by the diver still gets a complete personal history,
    // but never receives invented catalogue/source metadata.
    await user.click(
      screen.getByRole('button', { name: 'Back to collection' }),
    );
    await user.click(
      await screen.findByRole('link', { name: /Goliath grouper/ }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Goliath grouper' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 dive')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Curated context' }),
    ).not.toBeInTheDocument();

    // A cold start rebuilds everything from persisted data.
    reload('/journal');
    expect(
      await screen.findByRole('heading', { name: 'Palancar Gardens' }),
    ).toBeInTheDocument();
  });

  it('edits a dive without corrupting the derived collection or history', async () => {
    const { user, reload } = renderPoseidon('/log');
    await logCozumelDive(user);
    await screen.findByRole('heading', { name: 'Palancar Gardens' });

    await user.click(screen.getByRole('link', { name: 'Edit this dive' }));

    // Correct the site and the depth.
    const site = await screen.findByLabelText('Dive site');
    await user.clear(site);
    await user.type(site, 'Palancar Caves');
    await user.click(screen.getByRole('button', { name: /Continue/ }));

    const depth = await screen.findByLabelText('Max depth');
    await user.clear(depth);
    await user.type(depth, '24');
    await user.click(screen.getByRole('button', { name: /Choose creatures/ }));

    // Drop one creature; the highlight must survive because it is still sighted.
    await user.click(
      await screen.findByRole('button', { name: /Green sea turtle/ }),
    );
    await user.click(screen.getByRole('button', { name: /Continue/ }));
    await user.click(screen.getByRole('button', { name: /Save changes/ }));

    expect(
      await screen.findByRole('heading', { name: 'Palancar Caves' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('24 m').length).toBeGreaterThan(0);

    // The collection now reflects two creatures, not three.
    await user.click(screen.getByRole('link', { name: /Collection/ }));
    expect(await screen.findByText('2 creatures')).toBeInTheDocument();
    expect(screen.queryByText('Green sea turtle')).not.toBeInTheDocument();

    reload('/collection');
    expect(await screen.findByText('2 creatures')).toBeInTheDocument();
  });

  it('deletes a dive only behind a safeguard, and leaves history consistent', async () => {
    const { user, reload } = renderPoseidon('/log');
    await logCozumelDive(user);
    await screen.findByRole('heading', { name: 'Palancar Gardens' });

    // The destructive action is never one tap.
    await user.click(screen.getByRole('button', { name: 'Delete dive' }));
    expect(await screen.findByText('Delete this dive?')).toBeInTheDocument();

    // Backing out changes nothing.
    await user.click(screen.getByRole('button', { name: 'Keep it' }));
    expect(screen.queryByText('Delete this dive?')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete dive' }));
    await user.click(await screen.findByRole('button', { name: /^Delete$/ }));

    expect(
      await screen.findByRole('heading', { name: 'No dives yet' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Collection/ }));
    expect(
      await screen.findByRole('heading', { name: 'Nothing collected yet' }),
    ).toBeInTheDocument();

    reload('/');
    expect(
      await screen.findByRole('heading', { name: 'Your atlas starts here' }),
    ).toBeInTheDocument();
  });

  it('reuses same-day trip context for a second dive', async () => {
    const { user } = renderPoseidon('/log');
    await logCozumelDive(user);
    await screen.findByRole('heading', { name: 'Palancar Gardens' });

    await user.click(screen.getByRole('button', { name: 'Log a dive' }));

    const reuse = await screen.findByRole('button', { name: 'Same trip' });
    expect(
      screen.getByText(/You already logged Palancar Gardens/),
    ).toBeInTheDocument();
    await user.click(reuse);

    await waitFor(() =>
      expect(screen.getByLabelText('Area')).toHaveValue('Cozumel'),
    );
  });

  it('surfaces places in the atlas without inventing coordinates', async () => {
    const { user } = renderPoseidon('/log');
    await logCozumelDive(user);
    await screen.findByRole('heading', { name: 'Palancar Gardens' });

    await user.click(screen.getByRole('link', { name: /Atlas/ }));
    expect(await screen.findByText('1 place')).toBeInTheDocument();
    expect(
      screen.getByText(/does not plot dive sites it cannot source/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /Cozumel/ }));
    const heading = await screen.findByRole('heading', { name: 'Cozumel' });
    expect(heading).toBeInTheDocument();
    expect(
      within(document.body).getByRole('heading', { name: 'Sites' }),
    ).toBeInTheDocument();
  });
});
