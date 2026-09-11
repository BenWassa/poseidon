import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'apps/web/public/assets/**',
      'assets/**',
      'graphify-out/**',
    ],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,mjs}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/require-await': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: [
      'apps/web/src/components/**/*.{ts,tsx}',
      'apps/web/src/screens/**/*.{ts,tsx}',
    ],
    extends: [reactRefresh.configs.vite],
    rules: {
      'react-refresh/only-export-components': [
        'error',
        {
          allowExportNames: [
            'heroCreature',
            'ACTION_PRIMARY',
            'ACTION_CORAL',
            'ACTION_QUIET',
          ],
        },
      ],
    },
  },
  {
    files: ['apps/web/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
);
