/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    include: [
      'apps/extension/src/**/*.test.{ts,tsx}',
      'apps/extension/src/**/__tests__/**/*.{ts,tsx}',
    ],
    exclude: [
      'node_modules',
      'apps/extension/dist',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: [
        'apps/extension/src/utils/**/*.ts',
        'apps/extension/src/hooks/**/*.ts',
        'apps/extension/src/components/**/*.tsx',
        'apps/extension/src/background.ts',
        'apps/extension/src/content.tsx',
      ],
      exclude: [
        'apps/extension/src/**/*.test.{ts,tsx}',
        'apps/extension/src/**/__tests__/**',
        'apps/extension/src/vite-env.d.ts',
        'apps/extension/src/types/**',
      ],
      thresholds: {
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
    globals: true,
    reporters: ['verbose'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'apps/extension/src'),
      '@test': resolve(__dirname, 'test'),
    },
  },
});
