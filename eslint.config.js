import js from '@eslint/js';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  /* =========================================
     [1] 전역 무시 설정
  ========================================= */
  globalIgnores(['dist', 'node_modules']),


  /* =========================================
     [2] 모든 파일에 적용되는 전역 설정
  ========================================= */
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      // 모든 파일 끝에 개행 문자 강제
      '@stylistic/eol-last': ['error', 'always'],
    },
  },


  /* =========================================
     [3] 공통 설정 (JS, TS 모두 적용)
     - 스타일링(Formatting)
     - 기본적인 자바스크립트 로직
  ========================================= */
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],

    extends: [
      js.configs.recommended,
    ],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },

    plugins: {
      '@stylistic': stylistic,
    },

    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
      '@stylistic/jsx-quotes': ['error', 'prefer-double'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/max-len': ['error', { 'code': 100 }],
      '@stylistic/comma-dangle': ['error', {
        'arrays': 'always-multiline',
        'objects': 'always-multiline',
        'imports': 'never',
        'functions': 'never',
      }],

      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
      'no-empty': 'warn',
    },
  },


  /* =========================================
     [4] TypeScript 및 React 전용 설정
     - TS 파서 및 타입 체크
     - React 관련 규칙
  ========================================= */
  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      ...tseslint.configs.recommended,
      eslintPluginReactHooks.configs.flat.recommended,
      eslintPluginReactRefresh.configs.vite,
    ],

    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      react: eslintPluginReact,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      /* TypeScript 전용 */
      // JS의 기본 no-unused-vars는 끄고 TS 전용 규칙 사용
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 'argsIgnorePattern': '^_' },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports' },
      ],


      /* React / Hooks / Refresh */
      ...eslintPluginReact.configs.flat.recommended.rules,

      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]);
