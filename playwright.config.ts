import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, 'apps/extension/dist');

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 30000,

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium-extension',
      use: {
        browserName: 'chromium',
        headless: false,
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
          ],
        },
      },
    },
  ],

  webServer: {
    command: 'npx serve e2e/fixtures -l 3333',
    port: 3333,
    reuseExistingServer: !process.env.CI,
  },
});
