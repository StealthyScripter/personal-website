import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests/browser', workers: 1, reporter: 'list', use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000', browserName: 'chromium', ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } } : {}) } });
