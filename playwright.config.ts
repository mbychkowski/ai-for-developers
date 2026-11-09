import { defineConfig, devices } from '@playwright/test';

// Ensure Playwright installs and finds browsers in a user-writable cache directory
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && process.env.HOME) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = `${process.env.HOME}/.cache/ms-playwright`;
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4321/ai-for-developers/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'CONTENT_DIR=tests/fixtures/content pnpm build && pnpm preview --port 4321 --ignore-lock',
    url: 'http://localhost:4321/ai-for-developers/',
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
