// eslint.config.js
import pluginJs from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import globals from 'globals';

/**
 * ESLint Flat Config for a TypeScript + Playwright + Cucumber project
 */
export default [
  // Base ESLint rules for JavaScript
  pluginJs.configs.recommended,

  // Recommended rules from @typescript-eslint
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es2021,
        ...globals.typescript, // optional, if using the `globals` lib
        WebdriverIO: 'readonly',
        expect: 'readonly',
        driver: 'readonly',
        $: 'readonly',
        $$: 'readonly',
        browser: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
    },
  },

  // Extra rules for Page Object Model files
  {
    files: ['**/*.pom.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        ...globals.typescript,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-useless-escape': 'off',
    },
  },

  // JavaScript support (e.g. for config files or CJS)
  // {
  //     files: ["**/*.js"],
  //     languageOptions: {
  //         ecmaVersion: 2021,
  //         sourceType: "commonjs",
  //         globals: {
  //             ...globals.node,
  //         },
  //     },
  //     rules: {
  //         ...pluginJs.configs.recommended.rules,
  //         "prefer-const": "error",
  //         semi: "error",
  //     },
  // },
];
