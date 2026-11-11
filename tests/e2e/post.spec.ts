import { expect, test } from '@playwright/test';

const URL = '/posts/sample-post/';
const NOTE = 'rgb(169, 172, 242)';
const ACCENT = 'rgb(151, 218, 126)';
const WARN = 'rgb(229, 176, 74)';

test('title, meta line and tag pills', async ({ page }) => {
	await page.goto(URL);
	await expect(page.locator('h1')).toHaveText('Sample post: everything this site can render');
	const meta = page.locator('[data-entry-meta]');
	await expect(meta).toContainText('2026-11-02');
	await expect(meta).toContainText('min read');
	// Frontmatter says [Guitar, practice, 3D]: tags are normalised to lowercase.
	await expect(meta.getByRole('link')).toHaveText(['#guitar', '#practice', '#3d']);
	await expect(meta.getByRole('link', { name: '#guitar' })).toHaveAttribute('href', '/posts/?tag=guitar');
});

test('the header image fades out at the bottom', async ({ page }) => {
	await page.goto(URL);
	const mask = await page.locator('[data-hero]').evaluate((el) => {
		const style = getComputedStyle(el);
		return style.maskImage || style.getPropertyValue('-webkit-mask-image');
	});
	expect(mask).toContain('linear-gradient');
});

test('headings show no # marks', async ({ page }) => {
	await page.goto(URL);
	for (const text of await page.locator('main h2, main h3').allInnerTexts()) expect(text.trim().startsWith('#'), text).toBe(false);
});

test('Obsidian extras render', async ({ page }) => {
	await page.goto(URL);
	await expect(page.locator('main mark')).toHaveText('highlighted');
	await expect(page.locator('a.wikilink[href="/projects/sample-project/"]').first()).toBeVisible();
	await expect(page.locator('.wikilink-missing')).toHaveText('does-not-exist');
	await expect(page.locator('main')).not.toContainText('hidden comment');
	await expect(page.locator('iframe[src^="https://www.youtube-nocookie.com/embed/"]')).toHaveAttribute('title', /.+/);
	await expect(page.locator('main figcaption').first()).toHaveText('A placeholder photo');
});

test('callouts use the three styles, unknown types fall back to note', async ({ page }) => {
	await page.goto(URL);
	const border = (type: string, title?: string) =>
		page
			.locator(`[data-callout="${type}"]`)
			.filter(title ? { hasText: title } : {})
			.first()
			.evaluate((el) => getComputedStyle(el).borderLeftColor);
	expect(await border('tip')).toBe(ACCENT);
	expect(await border('warning')).toBe(WARN);
	expect(await border('info')).toBe(NOTE);
	// [!banana] isn't an Obsidian type: it shows as a note titled "Banana".
	expect(await border('note', 'Banana')).toBe(NOTE);
	const foldable = page.locator('details[data-callout="note"]');
	await expect(foldable).toHaveCount(1);
	await expect(foldable).not.toHaveAttribute('open');
});

test('table of contents: sticky sidebar on wide screens', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto(URL);
	const toc = page.locator('nav[aria-label="Table of contents"]');
	await expect(toc).toBeVisible();
	await expect(page.getByText('on this page')).toBeVisible();
	const headings = await page.locator('.prose h2:not(#footnote-label), .prose h3').count();
	await expect(toc.getByRole('link')).toHaveCount(headings);
	expect(headings).toBeGreaterThanOrEqual(2);
});

test('table of contents: folded box on phones', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 740 });
	await page.goto(URL);
	const details = page.locator('details.toc');
	await expect(details).not.toHaveAttribute('open');
	await expect(details.locator('summary')).toHaveText('contents');
});

test('the meta description is the post preview', async ({ page }) => {
	await page.goto(URL);
	await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^This is a sample post\./);
});
