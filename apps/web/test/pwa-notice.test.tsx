import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PwaNotice } from '../src/components/PwaNotice';
import {
  announceInstallAvailable,
  announceIosInstallAvailable,
  announceOfflineReady,
  announceUpdateAvailable,
  resetPwaStatus,
} from '../src/pwa-status';

describe('PWA notices', () => {
  afterEach(resetPwaStatus);

  it('announces when the application is ready offline', async () => {
    render(<PwaNotice />);
    announceOfflineReady();

    expect(await screen.findByText('Ready offline')).toBeInTheDocument();
    await userEvent
      .setup()
      .click(
        screen.getByRole('button', { name: 'Dismiss offline-ready message' }),
      );
    expect(screen.queryByText('Ready offline')).not.toBeInTheDocument();
  });

  it('waits for explicit consent before applying an update', async () => {
    const update = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<PwaNotice />);

    announceUpdateAvailable(update);
    expect(await screen.findByText('Update available')).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Later' }));
    expect(update).not.toHaveBeenCalled();
    expect(screen.queryByText('Update available')).not.toBeInTheDocument();

    announceUpdateAvailable(update);
    await user.click(await screen.findByRole('button', { name: 'Update' }));
    expect(update).toHaveBeenCalledWith(true);
  });

  it('offers the native install prompt only after the user chooses Install', async () => {
    const prompt = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<PwaNotice />);

    announceInstallAvailable({
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    });

    expect(await screen.findByText('Install Poseidon')).toBeInTheDocument();
    expect(prompt).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Install' }));
    expect(prompt).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByText('Install Poseidon')).not.toBeInTheDocument(),
    );
  });

  it('shows the real iPhone Add to Home Screen instructions', async () => {
    const user = userEvent.setup();
    render(<PwaNotice />);

    announceIosInstallAvailable();

    expect(
      await screen.findByText('Add Poseidon to your Home Screen'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Tap Share in your browser, then choose Add to Home Screen.',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Got it' }));
    expect(
      screen.queryByText('Add Poseidon to your Home Screen'),
    ).not.toBeInTheDocument();
  });
});
