import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/posts/', '/posts/sample-post/', '/projects/', '/projects/sample-project/', '/cv/', '/this-page-does-not-exist/'];

for (const path of PAGES) {
	test(`no accessibility problems on ${path}`, async ({ page }) => {
		await page.goto(path);
		const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
		expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
	});

	test(`no sideways scrolling at 360px on ${path}`, async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 740 });
		await page.goto(path);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
	});
}

test('missing pages get a 404 with a way home', async ({ page }) => {
	const res = await page.goto('/this-page-does-not-exist/');
	expect(res?.status()).toBe(404);
	await expect(page.getByText('404 · page not found')).toBeVisible();
	await expect(page.locator('main').getByRole('link', { name: /home/ })).toHaveAttribute('href', '/');
});

test('RSS feed lists posts with their preview', async ({ request }) => {
	const res = await request.get('/rss.xml');
	expect(res.status()).toBe(200);
	const xml = await res.text();
	expect(xml).toContain('<title>Sample post: everything this site can render</title>');
	expect(xml).toContain('<link>https://msmashuri.com/posts/sample-post/</link>');
	expect(xml).toMatch(/<description>This is a sample post\./);
});

test('sitemap exists', async ({ request }) => {
	expect((await request.get('/sitemap-index.xml')).status()).toBe(200);
});
