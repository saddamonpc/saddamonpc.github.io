import { expect, test } from '@playwright/test';

test('greeting, photo and bio', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveText("Hi! I'm Mohammad Saddam Mashuri.");
	const photo = page.getByRole('img', { name: 'Photo of Mohammad Saddam Mashuri' });
	await expect(photo).toBeVisible();
	const column = (await page.locator('[data-home]').boundingBox())!;
	const box = (await photo.boundingBox())!;
	const share = box.width / column.width;
	expect(share).toBeGreaterThan(0.28);
	expect(share).toBeLessThan(0.36);
	const bio = page.locator('[data-bio]');
	await expect(bio).not.toContainText(/ctrl\+k/i);
	await expect(bio).not.toContainText(/search function/i);
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
