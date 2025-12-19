import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', '_legacy/**'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node, // Add Node.js globals for scripts
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react/jsx-no-target-blank': 'warn',
      'react/prop-types': 'error', // Enable prop-types validation
      'no-unused-vars': ['warn', { varsIgnorePattern: '^React$' }], // Ignore unused React import
      'no-undef': 'error', // Strict undefined variable check
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
