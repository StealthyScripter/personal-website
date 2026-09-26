import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
const publicUrl = 'http://localhost:3100';
const apiUrl = 'http://localhost:4100';
const imagePath = '../personal-website-backend/seed/media/project-phone.png';
async function signIn(page: Page) {
  const credentials = JSON.parse(await fs.readFile('../personal-website-backend/.local/browser-session.json', 'utf8'));
  await page.goto('/'); await page.getByLabel('Email', { exact: true }).fill(credentials.email); await page.getByLabel('Password', { exact: true }).fill(credentials.password); await page.getByRole('button', { name: 'Sign in', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Overview', exact: true })).toBeVisible();
}
async function section(page: Page, name: string) { await page.getByRole('navigation').getByRole('button', { name, exact: true }).click(); }
async function save(page: Page) { await page.getByRole('button', { name: /^Save (project|note)$/ }).last().click(); await expect(page.getByRole('status')).toContainText(/saved|Published/); }

test('admin project workflow publishes actual content to server-rendered V4', async ({ page, context, request }) => {
  await signIn(page); await section(page, 'Projects'); await page.getByRole('button', { name: 'Create project', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Browser verification project'); await page.getByLabel('Slug', { exact: true }).fill('browser-verification'); await page.getByLabel('Summary / excerpt').fill('A browser-created project summary.'); await page.getByLabel('Overview (blank lines separate paragraphs)').fill('This project was created through the admin interface.');
  await page.getByLabel('Upload cover image', { exact: true }).setInputFiles(imagePath); await expect(page.getByLabel('Cover image alt text', { exact: true })).toBeVisible(); await page.getByLabel('Cover image alt text', { exact: true }).fill('Browser project cover');
  for (const [index, caption] of ['First screenshot caption', 'Second screenshot caption'].entries()) {
    await page.getByLabel('Upload screenshot', { exact: true }).setInputFiles(imagePath); await page.getByLabel(`Screenshot ${index + 1} alt text`, { exact: true }).fill(`Browser screenshot ${index + 1}`); await page.getByLabel(`Screenshot ${index + 1} caption`, { exact: true }).fill(caption);
  }
  await page.getByRole('button', { name: 'Move screenshot 2 up' }).click();
  await page.getByRole('button', { name: 'Add feature', exact: true }).click(); await page.getByLabel('Feature 1 title', { exact: true }).fill('Verified feature'); await page.getByLabel('Feature 1 description', { exact: true }).fill('This feature was entered through the UI.');
  await page.getByLabel('Technologies (one per line)').fill('TypeScript\nPostgreSQL'); await page.getByLabel('Live URL', { exact: true }).fill('https://example.com/demo'); await page.getByLabel('Repository URL').fill('https://example.com/repository'); await page.getByLabel('Current status', { exact: true }).fill('Browser verification in progress'); await page.getByLabel('Next steps (one per line)').fill('Finish browser verification');
  await page.getByRole('checkbox', { name: 'Open to collaborators', exact: true }).check(); await page.getByLabel(/Collaboration description/i).fill('Help verify this example.');
  await save(page); expect((await request.get(`${apiUrl}/api/projects/browser-verification`)).status()).toBe(404);
  await page.getByLabel('Published', { exact: true }).check(); await save(page);
  const publicPage = await context.newPage(); await publicPage.goto(`${publicUrl}/projects/browser-verification/`); await expect(publicPage.getByRole('heading', { level: 1 })).toContainText('Browser verification project'); await expect(publicPage.getByText('Verified feature', { exact: true })).toBeVisible(); await expect(publicPage.locator('.collaboration-panel')).toBeVisible();
  const html = await (await request.get(`${publicUrl}/projects/browser-verification/`)).text(); expect(html).toContain('This project was created through the admin interface.'); expect(html).toContain('Browser verification in progress');
  await expect(publicPage.locator('.gallery-grid figure').first()).toContainText('Second screenshot caption');
  await publicPage.getByRole('button', { name: 'Enlarge image: Browser screenshot 2' }).click(); await expect(publicPage.getByRole('dialog')).toBeVisible(); await publicPage.keyboard.press('Escape'); await expect(publicPage.getByRole('dialog')).not.toBeVisible();
  await page.getByLabel('Title', { exact: true }).fill('Browser project edited'); await save(page); await publicPage.reload(); await expect(publicPage.getByRole('heading', { level: 1 })).toContainText('Browser project edited');
  await page.getByLabel('Published', { exact: true }).uncheck(); await save(page); expect((await request.get(`${publicUrl}/projects/browser-verification/`)).status()).toBe(404);
});

test('original notes, external references and Currently are editable without React changes', async ({ page, request }) => {
  await signIn(page); await section(page, 'Notes'); await page.getByRole('button', { name: 'Create note', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill('Browser original note'); await page.getByLabel('Slug', { exact: true }).fill('browser-original'); await page.getByLabel('Summary / excerpt').fill('An original note excerpt.'); await page.getByLabel('Category', { exact: true }).fill('Testing'); await page.getByLabel('Tags (one per line)').fill('Verification'); await page.getByLabel(/Body/).fill('The original note body is server rendered.');
  await page.getByLabel('Upload cover image', { exact: true }).setInputFiles(imagePath); await page.getByLabel('Cover image alt text', { exact: true }).fill('Original note image');
  await save(page); expect((await request.get(`${apiUrl}/api/notes/browser-original`)).status()).toBe(404);
  await page.getByLabel('Published', { exact: true }).check(); await save(page); expect(await (await request.get(`${publicUrl}/notes/browser-original/`)).text()).toContain('The original note body is server rendered.');
  await page.getByLabel('Title', { exact: true }).fill('Original note edited'); await save(page); expect(await (await request.get(`${publicUrl}/notes/browser-original/`)).text()).toContain('Original note edited');
  await page.getByLabel('Published', { exact: true }).uncheck(); await save(page); expect((await request.get(`${apiUrl}/api/notes/browser-original`)).status()).toBe(404);
  await page.getByRole('button', { name: 'Back to list' }).click(); await page.getByRole('button', { name: 'Create note', exact: true }).click(); await page.getByLabel('Note type').selectOption('external');
  await page.getByLabel('Title', { exact: true }).fill('Browser external reference'); await page.getByLabel('Slug', { exact: true }).fill('browser-external'); await page.getByLabel('Summary / excerpt').fill('An external reference description.'); await page.getByLabel('Category', { exact: true }).fill('Testing'); await page.getByLabel('Source / publication', { exact: true }).fill('Example source'); await page.getByLabel('External URL').fill('https://example.com/reference'); await page.getByLabel(/My comment/).fill('A reason to share this reference.'); await page.getByLabel('Published', { exact: true }).check(); await save(page);
  await section(page, 'Currently'); await page.getByLabel('Building text').fill('Testing the three applications together'); await page.getByLabel('Show Building').check(); await page.getByRole('button', { name: 'Save Building' }).click(); await expect(page.getByRole('status')).toContainText('Saved.'); expect(await (await request.get(`${publicUrl}/`)).text()).toContain('Testing the three applications together');
  await page.getByLabel('Building text').fill(''); await page.getByLabel('Show Building').uncheck(); await page.getByRole('button', { name: 'Save Building' }).click(); await expect(page.getByRole('status')).toContainText('Saved.');
  await page.goto(publicUrl); const external = page.getByRole('link', { name: /Browser external reference/ }); await expect(external).toHaveAttribute('href', 'https://example.com/reference'); await expect(page.getByText('A reason to share this reference.')).toBeVisible();
});

test('contact form failure and success, then real admin inbox status transitions', async ({ page, context }) => {
  const visitor = await context.newPage(); await visitor.goto(publicUrl); await visitor.getByLabel('Name', { exact: true }).fill('Browser visitor'); await visitor.getByLabel('Email', { exact: true }).fill('visitor@example.test'); await visitor.getByLabel('Subject', { exact: false }).fill('Browser inbox verification'); await visitor.getByLabel('Message', { exact: true }).fill('This message travels from the public form into PostgreSQL.');
  await visitor.route(`${apiUrl}/api/messages`, (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'Temporarily unavailable. Please retry.' }) })); await visitor.getByRole('button', { name: 'Send message' }).click(); await expect(visitor.locator('.conversation-form').getByRole('alert')).toContainText('Temporarily unavailable'); await expect(visitor.getByLabel('Message', { exact: true })).not.toHaveValue('');
  await visitor.unroute(`${apiUrl}/api/messages`); await visitor.getByRole('button', { name: 'Send message' }).click(); await expect(visitor.getByRole('status')).toContainText('Your message has been received.');
  await signIn(page); await section(page, 'Inbox'); await expect(page.getByText('Browser inbox verification', { exact: true })).toBeVisible(); await expect(page.locator('.entry-list')).toContainText('unread'); await page.getByRole('button', { name: 'Open message' }).first().click(); await expect(page.getByText('This message travels from the public form into PostgreSQL.')).toBeVisible();
  for (const [action, status] of [['Mark read', 'read'], ['Mark unread', 'unread'], ['Archive', 'archived']]) { await page.getByRole('button', { name: action, exact: true }).click(); await expect(page.locator('article')).toContainText(`· ${status}`); }
  await page.getByRole('button', { name: 'Sign out' }).click(); await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});

test('admin media deletion, settings and concurrent editor feedback', async ({ page, context }) => {
  await signIn(page); await section(page, 'Media');
  await page.getByLabel('Upload image', { exact: true }).setInputFiles(imagePath);
  const uploaded = page.locator('.cards article').first(); await expect(uploaded).toContainText('project-phone.png');
  page.once('dialog', (dialog) => dialog.accept()); await uploaded.getByRole('button', { name: 'Delete media' }).click();
  await section(page, 'Settings'); await page.getByLabel('Hero thought').fill('A browser-tested thought.'); await page.getByRole('button', { name: 'Save settings', exact: true }).click(); await expect(page.getByRole('status')).toContainText('Settings saved.');
  const second = await context.newPage(); await second.goto('/'); await section(second, 'Settings'); await expect(second.getByLabel('Hero thought')).toHaveValue('A browser-tested thought.');
  await page.getByLabel('Hero thought').fill('Curiosity turns ordinary days into interesting ones.'); await page.getByRole('button', { name: 'Save settings', exact: true }).click(); await expect(page.getByRole('status')).toContainText('Settings saved.');
  await second.getByLabel('Hero thought').fill('An outdated editor value.'); await second.getByRole('button', { name: 'Save settings', exact: true }).click(); await expect(second.getByRole('alert')).toContainText('Settings changed. Reload first.'); await expect(second.getByLabel('Hero thought')).toHaveValue('An outdated editor value.');
  await page.setViewportSize({ width: 375, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: 'test-results/admin-settings-mobile.png', fullPage: true });
});

for (const width of [320, 375, 430, 768, 1024, 1440]) test(`brand, navigation and media at ${width}px in both themes`, async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: 1000 }); await page.goto(publicUrl);
  await expect(page.getByRole('link', { name: 'Brian Wendot — Home', exact: true })).toBeVisible();
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.getByRole('button', { name: 'Toggle light or dark theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#projects').scrollIntoViewIfNeeded(); await expect.poll(() => page.locator('.project-card img').evaluateAll((images) => images.every((image) => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await page.screenshot({ path: `test-results/brand-${width}-${theme}.png`, fullPage: true });
  }
  if (width < 768) await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'About', exact: true }).click(); await expect(page).toHaveURL(/\/#about$/);
  await page.goto(`${publicUrl}/projects/phone-calling-app/`); if (width < 768) await page.getByRole('button', { name: 'Menu', exact: true }).click(); await page.getByRole('navigation').getByRole('link', { name: 'Contact', exact: true }).click(); await expect(page).toHaveURL(/\/#contact$/);
  await page.emulateMedia({ reducedMotion: 'reduce' }); expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto'); expect(errors).toEqual([]);
});
