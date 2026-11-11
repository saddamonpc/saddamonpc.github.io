import { expect, test } from '@playwright/test';

test('skip link is the first Tab stop and moves focus to main', async ({ page }) => {
	await page.goto('/');
	await page.keyboard.press('Tab');
	await expect(page.locator(':focus')).toHaveText('skip to content');
	await page.keyboard.press('Enter');
	await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('main');
});

test('nav marks the current page', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('nav[aria-label="Main"] a[aria-current="page"]')).toHaveText('home');
});

test('nav stays right-aligned at any desktop width', async ({ page }) => {
	for (const width of [640, 700, 1280]) {
		await page.setViewportSize({ width, height: 800 });
		await page.goto('/');
		const inner = (await page.locator('[data-header-inner]').boundingBox())!;
		const last = (await page.locator('nav[aria-label="Main"] a').last().boundingBox())!;
		const innerRight = inner.x + inner.width - Number.parseFloat(await page.locator('[data-header-inner]').evaluate((el) => getComputedStyle(el).paddingRight));
		expect(Math.abs(last.x + last.width - innerRight), `width ${width}`).toBeLessThanOrEqual(2);
	}
});

test.describe('phone', () => {
	test.use({ viewport: { width: 375, height: 740 } });

	test('burger toggles the menu', async ({ page }) => {
		await page.goto('/');
		// Located by what it controls: its label changes from "☰ menu" to "✕ close".
		const button = page.locator('button[aria-controls="main-nav"]');
		await expect(button).toHaveText('☰ menu');
		const links = page.locator('nav[aria-label="Main"] a');
		await expect(button).toHaveAttribute('aria-expanded', 'false');
		await expect(links.first()).toBeHidden();
		await button.click();
		await expect(button).toHaveAttribute('aria-expanded', 'true');
		await expect(button).toHaveText('✕ close');
		await expect(links).toHaveCount(4);
		for (const link of await links.all()) await expect(link).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(links.first()).toBeHidden();
		await expect(button).toBeFocused();
	});
});

test.describe('phone without JavaScript', () => {
	test.use({ viewport: { width: 375, height: 740 }, javaScriptEnabled: false });

	test('shows the links', async ({ page }) => {
		await page.goto('/');
		const links = page.locator('nav[aria-label="Main"] a');
		await expect(links).toHaveCount(4);
		for (const link of await links.all()) await expect(link).toBeVisible();
	});
});

test('footer has the four links and the copyright line', async ({ page }) => {
	await page.goto('/');
	const footerNav = page.locator('footer nav[aria-label="Elsewhere"]');
	await expect(footerNav.getByRole('link')).toHaveText(['email', 'github', 'linkedin', 'rss']);
	await expect(footerNav.getByRole('link', { name: 'email' })).toHaveAttribute('href', 'mailto:saddamonpc@gmail.com');
	await expect(footerNav.getByRole('link', { name: 'rss' })).toHaveAttribute('href', '/rss.xml');
	await expect(page.locator('footer')).toContainText(/© \d{4} Mohammad Saddam Mashuri · last updated \d{4}-\d{2}-\d{2}/);
});
