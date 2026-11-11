import { expect, test } from '@playwright/test';

test('posts grouped by year, with a preview', async ({ page }) => {
	await page.goto('/posts/');
	await expect(page.locator('h1')).toHaveText('Posts');
	await expect(page.locator('[data-filter-group]').filter({ hasText: '2026' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Sample post: everything this site can render' })).toHaveAttribute('href', '/posts/sample-post/');
	const preview = page.locator('.excerpt').first();
	await expect(preview).toHaveText(/^This is a sample post\./);
	await expect(preview).not.toContainText('Writing basics');
	expect(await preview.evaluate((el) => getComputedStyle(el).webkitLineClamp)).toBe('2');
});

test('picture strip: 6 thumbnails, then +3', async ({ page }) => {
	await page.goto('/posts/');
	const thumbs = page.locator('.thumb');
	await expect(thumbs).toHaveCount(6);
	await expect(page.locator('.more')).toHaveText('+3');
	await expect(thumbs.nth(0)).toHaveAttribute('aria-label', 'View picture 1 of 9: Header image');
	await expect(thumbs.nth(1)).toHaveAttribute('aria-label', 'View picture 2 of 9: A placeholder photo');
	// Thumb 5 is the Obsidian pasted image with spaces in its name: it must be optimised too.
	for (const img of await page.locator('.thumb > img').all()) {
		expect(await img.getAttribute('src')).toContain('/_astro/');
		await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
		expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeLessThanOrEqual(200);
	}
});

test('hovering a thumbnail shows a bigger preview', async ({ page }) => {
	await page.goto('/posts/');
	await page.locator('.thumb').nth(1).hover();
	await expect(page.locator('.thumb').nth(1).locator('.pop')).toBeVisible();
});

test('viewer: keyboard opens it, arrows flip, Esc closes and returns focus', async ({ page }) => {
	await page.goto('/posts/');
	const first = page.locator('.thumb').first();
	await first.focus();
	await page.keyboard.press('Enter');
	const counter = page.locator('.pswp__counter');
	await expect(counter).toHaveText('1 / 9');
	// PhotoSwipe takes keys once its opening animation has finished.
	await expect(page.locator('.pswp')).toHaveClass(/pswp--ui-visible/);
	await page.waitForTimeout(400);
	await page.keyboard.press('ArrowRight');
	await expect(counter).toHaveText('2 / 9');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await expect(counter).toHaveText('9 / 9');
	await expect(page.locator('.pswp').getByRole('link', { name: 'open post →' })).toHaveAttribute('href', '/posts/sample-post/');
	await page.keyboard.press('Escape');
	await expect(page.locator('.pswp')).toHaveCount(0);
	await expect(first).toBeFocused();
});

test('the +3 button opens the viewer at picture 7', async ({ page }) => {
	await page.goto('/posts/');
	await page.locator('.more').click();
	await expect(page.locator('.pswp__counter')).toHaveText('7 / 9');
});

test.describe('phone', () => {
	test.use({ viewport: { width: 375, height: 740 }, hasTouch: true });

	test('tapping a thumbnail opens the viewer directly', async ({ page }) => {
		await page.goto('/posts/');
		await page.locator('.thumb').nth(2).tap();
		await expect(page.locator('.pswp__counter')).toHaveText('3 / 9');
	});
});

test('filtering by tag', async ({ page }) => {
	await page.goto('/posts/');
	const guitar = page.getByRole('button', { name: /^guitar\s*1$/ });
	await guitar.click();
	await expect(guitar).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByText('showing 1 of 1')).toBeVisible();
	await expect(page).toHaveURL(/\/posts\/\?tag=guitar$/);
	await guitar.click();
	await expect(page).toHaveURL(/\/posts\/$/);
});

test('a filter with no matches says so and hides the empty year', async ({ page }) => {
	await page.goto('/posts/?tag=zzz');
	await expect(page.getByText('Nothing matches every selected tag.')).toBeVisible();
	await expect(page.locator('[data-filter-group]').first()).toBeHidden();
});

test.describe('without JavaScript', () => {
	test.use({ javaScriptEnabled: false });

	test('everything is listed and the filter bar is hidden', async ({ page }) => {
		await page.goto('/posts/');
		await expect(page.getByRole('link', { name: 'Sample post: everything this site can render' })).toBeVisible();
		await expect(page.locator('[data-tag-filter]')).toBeHidden();
	});
});
