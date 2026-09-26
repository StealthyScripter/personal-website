import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', workers: 1, fullyParallel: false, timeout: 90000, reporter: 'list',
  use: { baseURL: 'http://localhost:5183', browserName: 'chromium', ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } } : {}) },
  webServer: [
    { command: 'node node_modules/tsx/dist/cli.mjs --env-file=.env scripts/browser-fixture.ts', cwd: '../personal-website-backend', url: 'http://localhost:4100/health', timeout: 60000 },
    { command: 'node node_modules/next/dist/bin/next dev -p 3100', cwd: '../personal-website-v4', url: 'http://localhost:3100', timeout: 120000, env: { NEXT_DIST_DIR: '.next-integration', BACKEND_URL: 'http://localhost:4100', NEXT_PUBLIC_API_URL: 'http://localhost:4100' } },
    { command: 'node node_modules/vite/bin/vite.js --host localhost --port 5183 --strictPort', url: 'http://localhost:5183', env: { VITE_API_URL: 'http://localhost:4100' } },
  ],
});
