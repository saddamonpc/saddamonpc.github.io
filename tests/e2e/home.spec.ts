import { expect, test } from '@playwright/test';

test('greeting, photo with its caption, and bio', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText("Hi! I'm Mohammad Saddam Mashuri.");
	const photo = page.getByRole('img', { name: 'Photo of Mohammad Saddam Mashuri' });
	await expect(photo).toBeVisible();
	await expect(page.locator('[data-home] figure figcaption')).toHaveText('Why hello there!');
	const bio = page.locator('[data-bio]');
	await expect(bio).not.toContainText(/ctrl\+k/i);
	await expect(bio).not.toContainText(/search function/i);
});

test('bio lines stay a comfortable length, with the photo beside them', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/');
	const bio = (await page.locator('[data-bio]').boundingBox())!;
	const photo = (await page.getByRole('img', { name: 'Photo of Mohammad Saddam Mashuri' }).boundingBox())!;
	const charWidth = await page.locator('[data-bio] p').first().evaluate((p) => {
		const s = getComputedStyle(p);
		const c = document.createElement('canvas').getContext('2d')!;
		c.font = `${s.fontSize} ${s.fontFamily}`;
		return c.measureText('abcdefghijklmnopqrstuvwxyz').width / 26;
	});
	expect(bio.width / charWidth).toBeLessThanOrEqual(80); // characters per line
	expect(photo.x).toBeGreaterThanOrEqual(bio.x + bio.width); // photo beside, not inside, the text
});

test('links in the bio work', async ({ page, request }) => {
	await page.goto('/');
	for (const href of await page.locator('[data-bio] a').evaluateAll((links) => links.map((a) => a.getAttribute('href')!))) {
		if (href.startsWith('/')) expect((await request.get(href)).status(), href).toBe(200);
	}
});

test('recent posts', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('recent posts', { exact: true })).toBeVisible();
	const rows = page.locator('[data-recent] > li');
	expect(await rows.count()).toBeLessThanOrEqual(3);
	// Newest first: the newer test post comes before the sample.
	await expect(rows.first()).toContainText('Test: a newer post');
	const row = rows.filter({ hasText: 'Sample post' });
	await expect(row.getByRole('link').first()).toHaveAttribute('href', '/posts/sample-post/');
	await expect(row).toContainText('2026-11-02');
});

test.describe('phone', () => {
	test.use({ viewport: { width: 375, height: 740 } });

	test('heading first, then the photo, then the bio', async ({ page }) => {
		await page.goto('/');
		const heading = (await page.locator('h1').boundingBox())!;
		const photo = (await page.getByRole('img', { name: 'Photo of Mohammad Saddam Mashuri' }).boundingBox())!;
		const bio = (await page.locator('[data-bio]').boundingBox())!;
		expect(photo.y).toBeGreaterThanOrEqual(heading.y + heading.height);
		expect(bio.y).toBeGreaterThanOrEqual(photo.y + photo.height);
		const lineHeight = await page.locator('h1').evaluate((el) => Number.parseFloat(getComputedStyle(el).lineHeight));
		expect(heading.height).toBeLessThanOrEqual(lineHeight * 2 + 1); // at most two lines
	});

	test('recent posts always put the title under the date', async ({ page }) => {
		await page.goto('/');
		for (const row of await page.locator('[data-recent] > li').all()) {
			const date = (await row.locator('time').boundingBox())!;
			const title = (await row.getByRole('link').first().boundingBox())!;
			expect(title.y).toBeGreaterThanOrEqual(date.y + date.height - 1);
		}
	});
});
