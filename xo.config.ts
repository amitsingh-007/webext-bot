import { type FlatXoConfig } from 'xo';

const xoConfig: FlatXoConfig = [
  {
    prettier: true,
    space: true,
  },
  {
    rules: {
      'import-x/extensions': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-array-for-each': 'off',
    },
  },
];

export default xoConfig;
