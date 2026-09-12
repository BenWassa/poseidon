import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { buildInfo } from '../src/lib/buildInfo';
import { renderPoseidon } from './harness';

describe('build info support surface', () => {
  it('shows the restrained version/build string on Data & backup', () => {
    renderPoseidon('/data');
    expect(screen.getByText(buildInfo.display)).toBeInTheDocument();
  });
});
