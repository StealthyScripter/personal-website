import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';

test('imported case studies remain editable and publish in the requested order after media review', async ({ page, context, request }) => {
  test.skip(process.env.PORTFOLIO_IMPORT_FIXTURE !== '1', 'Run with the isolated imported-project fixture.');
  test.setTimeout(180000);
  const titles = ['Jenga', 'Jukwaa', 'Companion', 'Smart Inventory System', 'PesaFlow', 'WiBuddy', 'Sauti Tamu'];
  const slugs = ['jenga', 'jukwaa', 'companion', 'smart-inventory-system', 'pesaflow', 'wibuddy', 'sauti-tamu'];
  const credentials = JSON.parse(await fs.readFile('../personal-website-backend/.local/browser-session.json', 'utf8'));
  await page.goto('/');
  await page.getByLabel('Email', { exact: true }).fill(credentials.email);
  await page.getByLabel('Password', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('navigation').getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(page.locator('.entry-list article')).toHaveCount(10);
  for (const slug of slugs) expect((await request.get(`http://localhost:3100/projects/${slug}/`)).status()).toBe(404);
  const save = async () => {
    await page.getByRole('button', { name: 'Save project', exact: true }).click();
    await expect(page.getByRole('status')).toContainText(/saved|Published/);
  };
  // These images are disposable test fixtures, never media for the real imported records.
  for (const [index, title] of titles.entries()) {
    await page.getByRole('button', { name: `Edit ${title}`, exact: true }).click();
    await expect(page.getByLabel('Display order (lower first)')).toHaveValue(String(index + 1));
    if (index < 3) await expect(page.getByLabel('Repository URL')).toHaveValue('');
    await page.getByLabel('Summary / excerpt').fill(`${title}: edited through the existing Admin.`);
    await page.getByLabel('Display order (lower first)').fill(String(index + 21)); await save();
    await page.getByLabel('Display order (lower first)').fill(String(index + 1));
    await page.getByLabel('Upload cover image', { exact: true }).setInputFiles('../personal-website-backend/seed/media/project-phone.png');
    await page.getByLabel('Cover image alt text', { exact: true }).fill(`${title} disposable verification cover`);
    await page.getByLabel('Published', { exact: true }).check(); await save();
    await page.getByRole('button', { name: 'Back to list' }).click();
  }
  const visitor = await context.newPage();
  const errors: string[] = []; visitor.on('pageerror', (error) => errors.push(error.message));
  await visitor.goto('http://localhost:3100');
  await expect(visitor.locator('#projects > .project-grid .project-card h3')).toHaveText(titles.slice(0, 3));
  await visitor.locator('#projects summary').click();
  await expect(visitor.locator('#projects .project-card h3')).toHaveText([...titles, 'Phone Calling App', 'AI Trading Analytics Dashboard', 'Social Collaboration Tool']);
  for (const [index, slug] of slugs.entries()) {
    await visitor.goto(`http://localhost:3100/projects/${slug}/`);
    await expect(visitor.getByRole('heading', { level: 1 })).toHaveText(titles[index]);
    await expect(visitor.locator('.tags li').first()).toBeVisible();
    await expect(visitor.locator('.feature').first()).toBeVisible();
    await expect(visitor.locator('.content-figure img').first()).toHaveAttribute('alt', `${titles[index]} disposable verification cover`);
    if (index < 3) await expect(visitor.getByRole('link', { name: 'View source' })).toHaveCount(0);
  }
  for (const width of [375, 1440]) {
    await visitor.setViewportSize({ width, height: 1000 }); await visitor.goto('http://localhost:3100');
    await visitor.locator('#projects summary').click();
    expect(await visitor.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await visitor.screenshot({ path: `test-results/imported-projects-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'Edit Sauti Tamu', exact: true }).click();
  await page.getByLabel('Published', { exact: true }).uncheck(); await save();
  expect((await request.get('http://localhost:3100/projects/sauti-tamu/')).status()).toBe(404);
  await page.getByRole('button', { name: 'Back to list' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete Sauti Tamu', exact: true }).click();
  await expect(page.locator('.entry-list article')).toHaveCount(9);
  expect(errors).toEqual([]);
});
