import { test, expect } from '@playwright/test';

for (const width of [320, 375, 430, 768, 1024, 1440]) test(`public site at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await page.goto('/');
  await expect(page.getByRole('link', { name: 'Brian Wendot — Home' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Toggle light or dark theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ reducedMotion: 'reduce' }); expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});
test('published content is server rendered and old landing pages return to anchors', async ({ page, request }) => {
  const response = await request.get('/'); expect(response.status()).toBe(200); expect(await response.text()).toContain('Phone Calling App');
  await page.goto('/projects/phone-calling-app/'); await expect(page.getByRole('heading', { level: 1 })).toHaveText('Phone Calling App');
  await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click(); await expect(page).toHaveURL(/\/#contact$/);
  expect((await request.get('/notes/example-original/')).status()).toBe(404);
  for (const asset of ['/favicon.svg', '/favicon.ico', '/favicon-16x16.png', '/favicon-32x32.png', '/apple-touch-icon.png', '/brand/social-preview.png']) expect((await request.get(asset)).status()).toBe(200);
});
