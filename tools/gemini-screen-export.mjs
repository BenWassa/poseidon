#!/usr/bin/env node

import { copyFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const outputDir = path.join(root, 'gemini-export');
const requestedPack = (process.argv[2] ?? 'plan').toLowerCase();

const sources = {
  product: ['01_PRODUCT.md', 'PRODUCT.md'],
  app: ['02_App.tsx', 'apps/web/src/App.tsx'],
  css: ['03_index.css', 'apps/web/src/index.css'],
  shell: ['04_AppShell.tsx', 'apps/web/src/components/AppShell.tsx'],
  ui: ['05_ui.tsx', 'apps/web/src/components/ui.tsx'],
  hooks: ['06_hooks.ts', 'apps/web/src/data/hooks.ts'],
  format: ['07_format.ts', 'apps/web/src/lib/format.ts'],
  domain: ['08_domain.ts', 'packages/domain/src/domain.ts'],
  selectors: ['09_selectors.ts', 'packages/domain/src/selectors.ts'],

  home: ['10_Home.tsx', 'apps/web/src/screens/Home.tsx'],
  diveHero: ['11_DiveHero.tsx', 'apps/web/src/components/DiveHero.tsx'],
  creatureTile: [
    '12_CreatureTile.tsx',
    'apps/web/src/components/CreatureTile.tsx',
  ],
  creatureImage: [
    '13_CreatureImage.tsx',
    'apps/web/src/components/CreatureImage.tsx',
  ],

  journal: ['20_Journal.tsx', 'apps/web/src/screens/Journal.tsx'],
  diveDetail: ['21_DiveDetail.tsx', 'apps/web/src/screens/DiveDetail.tsx'],

  logDive: ['30_LogDive.tsx', 'apps/web/src/screens/LogDive.tsx'],
  logModel: ['31_log-dive-model.ts', 'apps/web/src/features/log-dive/model.ts'],
  logSteps: [
    '32_log-dive-steps.tsx',
    'apps/web/src/features/log-dive/steps.tsx',
  ],
  logController: [
    '33_useLogDiveController.ts',
    'apps/web/src/features/log-dive/useLogDiveController.ts',
  ],
  suggestions: ['34_suggestions.ts', 'apps/web/src/lib/suggestions.ts'],

  atlas: ['40_Atlas.tsx', 'apps/web/src/screens/Atlas.tsx'],
  placeDetail: ['41_PlaceDetail.tsx', 'apps/web/src/screens/PlaceDetail.tsx'],
  atlasMap: ['42_AtlasMap.tsx', 'apps/web/src/components/AtlasMap.tsx'],
  atlasMotif: ['43_AtlasMotif.tsx', 'apps/web/src/components/AtlasMotif.tsx'],
  atlasLib: ['44_atlas.ts', 'apps/web/src/lib/atlas.ts'],
  content: ['45_content.ts', 'apps/web/src/data/content.ts'],

  collection: ['50_Collection.tsx', 'apps/web/src/screens/Collection.tsx'],
  creatureDetail: [
    '51_CreatureDetail.tsx',
    'apps/web/src/screens/CreatureDetail.tsx',
  ],

  dataBackup: [
    '60_DataAndBackup.tsx',
    'apps/web/src/screens/DataAndBackup.tsx',
  ],
  provider: ['61_provider.tsx', 'apps/web/src/data/provider.tsx'],
  preferences: ['62_preferences.ts', 'apps/web/src/lib/preferences.ts'],
  authProvider: ['63_AuthProvider.tsx', 'apps/web/src/auth/AuthProvider.tsx'],

  signIn: ['70_SignInScreen.tsx', 'apps/web/src/auth/SignInScreen.tsx'],
  authGate: ['71_AuthGate.tsx', 'apps/web/src/auth/AuthGate.tsx'],
  firebaseConfig: ['72_firebase-config.ts', 'apps/web/src/firebase/config.ts'],
  pendingApproval: [
    '73_PendingApprovalScreen.tsx',
    'apps/web/src/auth/PendingApprovalScreen.tsx',
  ],
};

const packs = {
  // Initial architecture/design pass: README + 9 files = Gemini's 10-file limit.
  plan: [
    'product',
    'app',
    'css',
    'shell',
    'ui',
    'home',
    'journal',
    'atlas',
    'collection',
  ],

  // Screen passes. Keep each pack at README + <=9 source files.
  home: [
    'css',
    'shell',
    'ui',
    'hooks',
    'format',
    'home',
    'diveHero',
    'creatureTile',
    'creatureImage',
  ],
  journal: [
    'css',
    'shell',
    'ui',
    'hooks',
    'format',
    'domain',
    'selectors',
    'journal',
    'diveDetail',
  ],
  log: [
    'css',
    'shell',
    'ui',
    'hooks',
    'logDive',
    'logModel',
    'logSteps',
    'logController',
    'suggestions',
  ],
  atlas: [
    'css',
    'shell',
    'ui',
    'atlas',
    'placeDetail',
    'atlasMap',
    'atlasMotif',
    'atlasLib',
    'content',
  ],
  collection: [
    'css',
    'shell',
    'ui',
    'hooks',
    'format',
    'creatureTile',
    'creatureImage',
    'collection',
    'creatureDetail',
  ],
  data: [
    'css',
    'shell',
    'ui',
    'hooks',
    'format',
    'dataBackup',
    'provider',
    'preferences',
    'authProvider',
  ],
  auth: [
    'css',
    'shell',
    'ui',
    'authProvider',
    'authGate',
    'signIn',
    'pendingApproval',
    'firebaseConfig',
  ],
};

const keys = packs[requestedPack];
if (!keys) {
  console.error(
    `Unknown Gemini export pack: ${requestedPack}. Valid packs: ${Object.keys(packs).join(', ')}`,
  );
  process.exitCode = 1;
} else {
  if (keys.length + 1 > 10) {
    throw new Error(`Pack ${requestedPack} exceeds Gemini's 10-file limit.`);
  }

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  let commit = 'unknown';
  try {
    commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: root,
      encoding: 'utf8',
    }).trim();
  } catch {
    // Export remains useful outside a Git checkout.
  }

  const mappings = [];
  for (const key of keys) {
    const [flatName, sourcePath] = sources[key];
    await copyFile(path.join(root, sourcePath), path.join(outputDir, flatName));
    mappings.push(`- \`${flatName}\` ← \`${sourcePath}\``);
  }

  const readme = `# Poseidon Gemini handoff — ${requestedPack}

Generated from the current checkout at commit \`${commit}\`.

This folder is a disposable, flat handoff for Gemini. It is **not** a runnable
copy of Poseidon and it is **not** source authority. Never integrate changes by
replacing the repo with this folder; map any accepted edits back to the original
paths below and review them in the real app.

## Design sprint rules

- Poseidon is a mobile-first personal dive journal and atlas, not a dive-computer dashboard or generic SaaS app.
- Preserve the existing React/Vite/TypeScript architecture, domain behaviour, data model, routes, offline behaviour, accessibility and real user history.
- The current \`03_index.css\` is the palette/token authority. Do not resurrect older colors or invent a parallel palette.
- Treat the palette as semantic design material, not an instruction to use every color or build rainbow gradients.
- Preserve real content and real derived statistics. Do not add fake totals, rarity, levels, decorative KPIs or invented data.
- Pixel/Android mobile composition is the primary target. Keep touch targets, safe areas, system Back behaviour and bottom navigation usable.
- Prefer improving hierarchy, spacing, typography, composition, component treatment, imagery and interaction polish over adding features.
- Shared primitives may change when that clearly improves multiple screens, but avoid broad architectural rewrites during a screen pass.

## Flattened file map

${mappings.join('\n')}
`;

  await writeFile(path.join(outputDir, '00_READ_ME_FIRST.md'), readme, 'utf8');

  console.log(
    `Gemini export ready: gemini-export/ (${keys.length + 1} files, pack: ${requestedPack})`,
  );
  console.log('Upload every file in that folder to Gemini.');
}
