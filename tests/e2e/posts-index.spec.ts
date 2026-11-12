import { expect, type Page, test } from '@playwright/test';

// Checks look inside the sample post's own row, so adding real posts never breaks them.
const sample = (page: Page) => page.locator('article', { hasText: 'Sample post: everything this site can render' });

test('posts grouped by year, with a preview', async ({ page }) => {
	await page.goto('/posts/');
	await expect(page.locator('h1')).toHaveText('Posts');
	await expect(page.locator('[data-filter-group]').filter({ hasText: '2026' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Sample post: everything this site can render' })).toHaveAttribute('href', '/posts/sample-post/');
	const preview = sample(page).locator('.excerpt');
	await expect(preview).toHaveText(/^This is a sample post\./);
	await expect(preview).not.toContainText('Writing basics');
	expect(await preview.evaluate((el) => getComputedStyle(el).webkitLineClamp)).toBe('2');
});

test('picture strip: 6 thumbnails, then +5', async ({ page }) => {
	await page.goto('/posts/');
	const thumbs = sample(page).locator('.thumb');
	await expect(thumbs).toHaveCount(6);
	await expect(sample(page).locator('.more')).toHaveText('+5');
	await expect(thumbs.nth(0)).toHaveAttribute('aria-label', 'View picture 1 of 11: Header image');
	await expect(thumbs.nth(1)).toHaveAttribute('aria-label', 'Play video 2 of 11: A sample clip');
	await expect(thumbs.nth(2)).toHaveAttribute('aria-label', 'Play video 3 of 11: YouTube video');
	await expect(thumbs.nth(3)).toHaveAttribute('aria-label', 'View picture 4 of 11: A placeholder photo');
	// Pictures (and the YouTube still) are shrunk and served from this site.
	// Where YouTube can't be reached while building, its still is a plain box instead (a data: picture).
	for (const img of await sample(page).locator('.thumb > img').all()) {
		expect(await img.getAttribute('src')).toMatch(/\/_astro\/|^data:image\/svg/);
		await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
		expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeLessThanOrEqual(200);
	}
	// Including the ones behind "+5", like the Obsidian pasted image with spaces in its name.
	const strip = JSON.parse((await sample(page).locator('[data-strip]').getAttribute('data-strip'))!);
	for (const item of strip.media.filter((i: { kind: string }) => i.kind === 'image')) expect(item.thumb).toContain('/_astro/');
});

test('video thumbnails have a play badge; hovering one plays it silently', async ({ page }) => {
	await page.goto('/posts/');
	const video = sample(page).locator('.thumb[data-kind="video"]');
	await expect(video.locator('.play')).toBeVisible();
	await expect(sample(page).locator('.thumb[data-kind="youtube"] .play').first()).toBeVisible();
	await expect(sample(page).locator('.thumb[data-kind="image"] .play')).toHaveCount(0);
	await video.hover();
	const preview = video.locator('.pop video');
	await expect.poll(() => preview.evaluate((v: HTMLVideoElement) => v.muted && !v.paused)).toBe(true);
	await page.mouse.move(0, 0);
	await expect.poll(() => preview.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test.describe('with reduced motion', () => {
	test.use({ reducedMotion: 'reduce' });

	test('hovering a video thumbnail shows a still frame instead of playing', async ({ page }) => {
		await page.goto('/posts/');
		const video = sample(page).locator('.thumb[data-kind="video"]');
		await video.hover();
		const preview = video.locator('.pop video');
		await expect.poll(() => preview.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThan(0);
		expect(await preview.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
	});
});

test('the viewer plays videos: the file in a player, YouTube in its own player', async ({ page }) => {
	await page.goto('/posts/');
	await sample(page).locator('.thumb[data-kind="video"]').click();
	await expect(page.locator('.pswp__counter')).toHaveText('2 / 11');
	const player = page.locator('.pswp video');
	await expect.poll(() => player.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
	expect((await player.boundingBox())!.width).toBeGreaterThan(300); // actually on screen, not squashed
	await expect(page.locator('.pswp-caption')).toHaveText('A sample clip, from “Sample post: everything this site can render”');
	await page.waitForTimeout(400);
	await page.keyboard.press('ArrowRight');
	await expect(page.locator('.pswp__counter')).toHaveText('3 / 11');
	await expect.poll(() => player.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true); // flipping away pauses it
	await expect(page.locator('.pswp iframe[title="YouTube video"]')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
});

test('hovering a thumbnail shows a bigger preview', async ({ page }) => {
	await page.goto('/posts/');
	await sample(page).locator('.thumb').nth(1).hover();
	await expect(sample(page).locator('.thumb').nth(1).locator('.pop')).toBeVisible();
});

test('viewer: keyboard opens it, arrows flip, Esc closes and returns focus', async ({ page }) => {
	await page.goto('/posts/');
	const first = sample(page).locator('.thumb').first();
	await first.focus();
	await page.keyboard.press('Enter');
	const counter = page.locator('.pswp__counter');
	await expect(counter).toHaveText('1 / 11');
	// PhotoSwipe takes keys once its opening animation has finished.
	await expect(page.locator('.pswp')).toHaveClass(/pswp--ui-visible/);
	await page.waitForTimeout(400);
	await page.keyboard.press('ArrowRight');
	await expect(counter).toHaveText('2 / 11');
	await page.keyboard.press('ArrowLeft');
	await page.keyboard.press('ArrowLeft');
	await expect(counter).toHaveText('11 / 11');
	await expect(page.locator('.pswp').getByRole('link', { name: 'Open the post ->' })).toHaveAttribute('href', '/posts/sample-post/');
	await page.keyboard.press('Escape');
	await expect(page.locator('.pswp')).toHaveCount(0);
	await expect(first).toBeFocused();
});

test('the +5 button opens the viewer at picture 7', async ({ page }) => {
	await page.goto('/posts/');
	await sample(page).locator('.more').click();
	await expect(page.locator('.pswp__counter')).toHaveText('7 / 11');
});

test.describe('phone', () => {
	test.use({ viewport: { width: 375, height: 740 }, hasTouch: true });

	test('tapping a thumbnail opens the viewer directly', async ({ page }) => {
		await page.goto('/posts/');
		await sample(page).locator('.thumb').nth(2).tap();
		await expect(page.locator('.pswp__counter')).toHaveText('3 / 11');
	});
});

test('filtering by tag', async ({ page }) => {
	await page.goto('/posts/');
	// Only the sample post is tagged 'practice' (the newer test post isn't).
	const practice = page.getByRole('button', { name: /^practice\s*\d+$/ });
	await practice.click();
	await expect(practice).toHaveAttribute('aria-pressed', 'true');
	await expect(page.getByText(/showing \d+ of \d+/)).toBeVisible();
	await expect(sample(page)).toBeVisible();
	await expect(page.locator('article', { hasText: 'Test: a newer post' })).toBeHidden();
	await expect(page).toHaveURL(/\/posts\/\?tag=practice$/);
	await practice.click();
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
