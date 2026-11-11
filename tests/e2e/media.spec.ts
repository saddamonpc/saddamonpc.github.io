import { expect, test } from '@playwright/test';

test('audio stored beside a post is playable from the post page', async ({ page, request }) => {
	await page.goto('/posts/sample-post/');
	await expect(page.locator('audio[src="./sample-take.wav"]')).toHaveCount(1);
	const res = await request.get('/posts/sample-post/sample-take.wav');
	expect(res.status()).toBe(200);
	expect(res.headers()['content-type']).toMatch(/audio\/(x-)?wav/);
});

test('every picture in a post is optimised and loads, including names with spaces', async ({ page, request }) => {
	await page.goto('/posts/sample-post/');
	const sources = await page.locator('main img').evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src') ?? ''));
	expect(sources.length).toBeGreaterThanOrEqual(8);
	for (const src of sources) {
		expect(src, src).toContain('/_astro/');
		expect((await request.get(src)).status(), src).toBe(200);
	}
});
