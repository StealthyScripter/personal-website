import { test, expect } from '@playwright/test';

for (const width of [375, 1440]) {
  for (const theme of ['light', 'dark']) {
    test(`biography expands with keyboard at ${width}px in ${theme} theme`, async ({ page, request }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const response = await request.get(`${process.env.PLAYWRIGHT_API_URL || 'http://localhost:4000'}/api/settings`);
      expect(response.ok()).toBe(true);
      const { about: paragraphs } = await response.json() as { about: string[] };
      expect(paragraphs).toHaveLength(5);
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      if (theme === 'dark') await page.getByRole('button', { name: 'Toggle light or dark theme' }).click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const section = page.locator('#about');
      const toggle = section.getByRole('button', { name: 'Read more about me', exact: true });
      const otherContent = () => page.locator('.hero, #projects, #notes, #contact').allTextContents();
      const before = await otherContent();
      await expect(section.locator('.prose p:visible')).toHaveText(paragraphs.slice(0, 2));
      await expect(toggle).toHaveAttribute('type', 'button');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      const contentId = await toggle.getAttribute('aria-controls');
      expect(contentId).toBeTruthy();
      const extra = section.locator('.biography-more');
      await expect(extra).toHaveAttribute('id', contentId!);
      await expect(extra).toBeHidden();
      await section.focus(); await page.keyboard.press('Tab');
      await expect(toggle).toBeFocused();
      expect(await toggle.evaluate((button) => getComputedStyle(button).outlineStyle)).toBe('solid');
      await section.screenshot({ path: `test-results/about-${width}-${theme}-collapsed.png` });
      const contactBefore = await page.locator('#contact').evaluate((element) => element.getBoundingClientRect().top + scrollY);
      await page.keyboard.press('Enter');
      const collapse = section.getByRole('button', { name: 'Show less', exact: true });
      await expect(collapse).toHaveAttribute('aria-expanded', 'true');
      await expect(collapse).toBeFocused();
      await expect(section.locator('.prose p:visible')).toHaveText(paragraphs);
      const typography = await section.locator('.prose p').evaluateAll((elements) => elements.map((element) => {
        const style = getComputedStyle(element);
        return [style.fontFamily, style.fontSize, style.lineHeight, style.fontWeight];
      }));
      expect(typography.every((value) => JSON.stringify(value) === JSON.stringify(typography[0]))).toBe(true);
      expect(await extra.evaluate((element) => getComputedStyle(element).marginTop)).toBe('20px');
      const contactAfter = await page.locator('#contact').evaluate((element) => element.getBoundingClientRect().top + scrollY);
      expect(contactAfter).toBeGreaterThan(contactBefore);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await section.screenshot({ path: `test-results/about-${width}-${theme}-expanded.png` });
      await page.keyboard.press('Space');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(section.locator('.prose p:visible')).toHaveText(paragraphs.slice(0, 2));
      // Pointer users get the same reversible interaction.
      await toggle.click(); await expect(extra).toBeVisible();
      await collapse.click(); await expect(extra).toBeHidden();
      expect(await otherContent()).toEqual(before);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}
