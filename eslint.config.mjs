import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    plugins: { '@stylistic': stylistic },
    extends: [js.configs.recommended, stylistic.configs.recommended],
    rules: {
      '@stylistic/indent': ['error', 2],
      '@stylistic/linebreak-style': ['error', 'windows'],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
      'eqeqeq': 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': [
        'error', 'always',
      ],
      'arrow-spacing': [
        'error', { before: true, after: true },
      ],
      'no-console': 0,
    },
    ignores: ['dist'],
  },
  {
    files: ['**/*.{mjs,cjs}'],
    languageOptions: { globals: globals.node, sourceType: 'modules' },
  },
  {
    files: ['**/*.js'],
    languageOptions: { globals: globals.node, sourceType: 'commonjs' },
  },
])
