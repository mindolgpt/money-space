const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: [
      '**/__tests__/**',
      '**/__mocks__/**',
      'node_modules/**',
      '.expo/**',
      'dist/**',
    ],
  },
  {
    rules: {
      'no-console': 'off',
    },
  },
]);