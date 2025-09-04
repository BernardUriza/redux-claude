// ESLint v9 Configuration - Migrated from .eslintrc.json
// Created by Bernard Orozco

const js = require('@eslint/js')
const typescript = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require('@typescript-eslint/parser')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const jsxA11y = require('eslint-plugin-jsx-a11y')
// const prettier = require('eslint-plugin-prettier');

module.exports = [
  // Base recommended configurations
  js.configs.recommended,

  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      'node_modules/**',
      '.pnp',
      '.pnp.js',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      '.env*',
      '!.env.example',
      '.vscode/**',
      '.idea/**',
      '*.swp',
      '*.swo',
      '.DS_Store',
      'Thumbs.db',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '.cache/**',
      '.parcel-cache/**',
      '.eslintcache',
      'coverage/**',
      '*.tsbuildinfo',
      '.turbo/**',
      'packages/**/dist/**',
      'packages/**/build/**',
      'PLAN_MIGRACION_SOAP.md',
      '*.md',
      '!README.md',
      '!MIGRACION_MOCK_DATA.md',
    ],
  },

  // TypeScript and React files
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      // 'prettier': prettier
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',

      // React rules
      'react/react-in-jsx-scope': 'off', // Next.js doesn't require React import
      'react/prop-types': 'off', // Using TypeScript instead
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',
      'react/no-unused-state': 'error',
      'react/jsx-key': 'error',

      // General ESLint rules
      'no-console': ['warn', { allow: ['warn', 'error', 'info', 'log'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-unused-expressions': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',

      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',

      // Prettier integration (disabled for v9 migration)
      // 'prettier/prettier': [
      //   'error',
      //   {
      //     endOfLine: 'auto'
      //   }
      // ],

      // Medical/Redux specific rules
      'no-magic-numbers': [
        'warn',
        {
          ignore: [
            -10, -8, -1, 0, 1, 2, 3, 5, 7, 8, 9, 10, 15, 20, 24, 30, 36, 50, 60, 80, 85, 90, 95,
            100, 200, 250, 300, 375, 500, 600, 700, 768, 800, 900, 1000, 1500, 3000, 5000, 10000,
            24000, 60000, 86400000, 3600000,
          ],
        },
      ],
      'max-lines-per-function': ['warn', { max: 300 }],
      complexity: ['warn', 15],
    },
  },

  // Test files overrides
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-magic-numbers': 'off',
    },
  },

  // Component files overrides
  {
    files: ['src/components/**/*.tsx'],
    rules: {
      'max-lines-per-function': ['warn', { max: 200 }],
      'react/display-name': 'error',
    },
  },

  // Cognitive core overrides
  {
    files: ['packages/cognitive-core/**/*.ts'],
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
]
