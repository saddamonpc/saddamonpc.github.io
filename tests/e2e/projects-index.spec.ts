import { expect, test } from '@playwright/test';

test('projects page shows cards', async ({ page }) => {
	await page.goto('/projects/');
	await expect(page.locator('h1')).toHaveText('Projects');
	const card = page.locator('[data-tags]', { hasText: 'Sample project' });
	await expect(card.getByRole('link').first()).toHaveAttribute('href', '/projects/sample-project/');
	const cover = card.locator('img').first();
	expect(await cover.getAttribute('src')).toContain('/_astro/');
	const box = (await cover.boundingBox())!;
	expect(Math.abs(box.width / box.height - 4 / 3)).toBeLessThan(0.02);
	await expect(page.locator('a a')).toHaveCount(0);
});

test('a card shows the month and year, with the reading time under it', async ({ page }) => {
	await page.goto('/projects/');
	const card = page.locator('[data-tags]', { hasText: 'Sample project' });
	const date = card.locator('time');
	await expect(date).toHaveText('Oct 2026');
	await expect(date).toHaveAttribute('datetime', '2026-10-01T00:00:00.000Z');
	const reading = card.getByText(/^[A-Z][a-z]+-minute read$|^\d+-minute read$/);
	expect((await reading.boundingBox())!.y).toBeGreaterThan((await date.boundingBox())!.y);
});

test('filtering projects by tag', async ({ page }) => {
	await page.goto('/projects/');
	await page.getByRole('button', { name: /^zbrush\s*\d+$/ }).click();
	await expect(page.getByText(/showing \d+ of \d+/)).toBeVisible();
	await expect(page.locator('[data-tags]', { hasText: 'Sample project' })).toBeVisible();
});

test('grid has 3 columns on wide screens and 1 on phones', async ({ page }) => {
	const columns = () => page.locator('[data-grid]').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/projects/');
	expect(await columns()).toBe(3);
	await page.setViewportSize({ width: 375, height: 740 });
	expect(await columns()).toBe(1);
});
