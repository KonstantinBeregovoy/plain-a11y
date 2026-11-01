import { defineConfig } from '@playwright/test';

// Browser end-to-end tests: they load the built extension (.output/chrome-mv3) into a real
// Chromium. Run them with `npm run test:e2e`. `npm run test` (Vitest) does not run them.
export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.ts',
  // One browser with the extension for the whole run, tests one after another.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  outputDir: '.playwright-results',
});
