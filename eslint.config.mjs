import globals from 'globals';
import js from '@eslint/js';
import { configs as tsConfigs } from '@typescript-eslint/eslint-plugin';

export default [
  {
    languageOptions: {
      globals: globals.browser,
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
  },
  js.configs.recommended,
  tsConfigs.recommended,
  {
    rules: {
      'no-console': 'warn',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
    },
  },
];
