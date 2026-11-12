import { expect, test } from '@playwright/test';

const URL = '/posts/sample-post/';
const NOTE = 'rgb(169, 172, 242)';
const ACCENT = 'rgb(151, 218, 126)';
const WARN = 'rgb(229, 176, 74)';

test('title, meta line and tag pills', async ({ page }) => {
	await page.goto(URL);
	await expect(page.locator('h1')).toHaveText('Sample post: everything this site can render');
	const meta = page.locator('[data-entry-meta]');
	await expect(meta).toContainText('Created on 2 November 2026, last updated on 12 November 2026.');
	await expect(meta).toContainText(/minute read/);
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
	await expect(page.locator('.prose figure:has(img) figcaption').first()).toHaveText('A placeholder photo');
});

test('a video file beside the post plays in a player, with its caption', async ({ page }) => {
	await page.goto(URL);
	const clip = page.locator('.prose figure.clip');
	await expect(clip.locator('video')).toHaveAttribute('controls', '');
	await expect(clip.locator('figcaption')).toHaveText('A sample clip');
	expect((await page.request.get(`${URL}sample-clip.webm`)).status()).toBe(200);
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
	await expect(page.locator('.toc-label')).toHaveText('Contents');
	const headings = await page.locator('.prose h2:not(#footnote-label), .prose h3').count();
	await expect(toc.getByRole('link')).toHaveCount(headings);
	expect(headings).toBeGreaterThanOrEqual(2);
});

test('table of contents: folded box on phones', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 740 });
	await page.goto(URL);
	const details = page.locator('details.toc');
	await expect(details).not.toHaveAttribute('open');
	await expect(details.locator('summary')).toHaveText('Contents');
});

test('the meta description is the post preview', async ({ page }) => {
	await page.goto(URL);
	await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /^This is a sample post\./);
});

test('blockquotes get the gradient, inline code does not', async ({ page }) => {
	await page.goto(URL);
	const style = (selector: string) => page.locator(selector).first().evaluate((el) => getComputedStyle(el));
	expect((await style('.prose blockquote:not(.callout)')).backgroundImage).toContain('linear-gradient');
	expect((await style('.prose blockquote:not(.callout)')).borderImageSource).toContain('linear-gradient');
	expect((await style('.prose :not(pre) > code')).backgroundImage).toBe('none'); // inline code stays plain
});

test.describe('code blocks on a phone', () => {
	test.use({ viewport: { width: 360, height: 760 } });

	test('long lines wrap instead of scrolling sideways', async ({ page }) => {
		await page.goto(URL);
		const pre = page.locator('.prose .expressive-code pre').first();
		expect(await pre.evaluate((el) => el.scrollWidth - el.clientWidth)).toBeLessThanOrEqual(0);
	});

	test('every line is numbered once; wrapped rows line up under the code, not the numbers', async ({ page }) => {
		await page.goto(URL);
		const lines = page.locator('.prose .expressive-code').first().locator('.ec-line');
		await expect(lines).toHaveCount(2);
		await expect(lines.locator('.ln')).toHaveText(['1', '2']);
		const second = lines.nth(1);
		const number = (await second.locator('.gutter').boundingBox())!;
		const code = (await second.locator('.code').boundingBox())!;
		expect(code.height).toBeGreaterThan(30); // the print(...) line wraps onto several rows
		expect(code.x).toBeGreaterThanOrEqual(number.x + number.width); // ...all of them right of the numbers
	});

	test('the language name and copy button sit above the code, not over it', async ({ page }) => {
		await page.goto(URL);
		const pre = page.locator('.prose .expressive-code pre[data-language]').first();
		const room = await pre.evaluate((el) => {
			const badge = getComputedStyle(el, '::before');
			return Number.parseFloat(getComputedStyle(el).paddingTop) - (Number.parseFloat(badge.top) + Number.parseFloat(badge.height));
		});
		expect(room).toBeGreaterThanOrEqual(0);
		expect(await pre.evaluate((el) => getComputedStyle(el, '::before').content)).toBe('"python"'); // the language name is shown
	});
});

test('copy button copies the code without line numbers', async ({ page, context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto(URL);
	const block = page.locator('.prose .expressive-code').first();
	await block.hover();
	await block.getByRole('button', { name: 'Copy to clipboard' }).click();
	const copied = await page.evaluate(() => navigator.clipboard.readText());
	expect(copied.startsWith('def log(chord, clean, total=6):')).toBe(true);
	expect(copied).toContain('print(f"{chord}: {clean}/{total} strings clean")');
});

test('code block top strip: language on the left, copy button on the right, both always visible', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto(URL);
	const block = page.locator('.prose .expressive-code').first();
	const pre = block.locator('pre[data-language]');
	const badge = await pre.evaluate((el) => {
		const s = getComputedStyle(el, '::before');
		return { left: Number.parseFloat(s.left), opacity: s.opacity };
	});
	const button = block.getByRole('button', { name: 'Copy to clipboard' });
	await expect(button).toBeVisible();
	expect(Number(await button.evaluate((el) => getComputedStyle(el).opacity))).toBeGreaterThanOrEqual(0.75); // without hovering
	const preBox = (await pre.boundingBox())!;
	const buttonBox = (await button.boundingBox())!;
	expect(badge.left).toBeLessThan(preBox.width / 2); // language on the left
	expect(buttonBox.x).toBeGreaterThan(preBox.x + preBox.width / 2); // copy on the right
	await block.hover();
	expect(await pre.evaluate((el) => getComputedStyle(el, '::before').opacity)).toBe('1'); // language stays while hovering
	// A separator line between the strip and the code.
	expect(await pre.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain('linear-gradient');
});

test.describe('code block on a phone', () => {
	test.use({ viewport: { width: 360, height: 760 } });

	test('has no copy button', async ({ page }) => {
		await page.goto(URL);
		await expect(page.locator('.prose .expressive-code').first().getByRole('button', { name: 'Copy to clipboard' })).toBeHidden();
	});
});

test('tags are italic serif with a lavender-to-mint background', async ({ page }) => {
	await page.goto(URL);
	const pill = page.locator('[data-entry-meta]').getByRole('link', { name: '#guitar' });
	const style = await pill.evaluate((el) => getComputedStyle(el));
	expect(style.fontStyle).toBe('italic');
	expect(style.fontFamily).toContain('Lora');
	expect(style.backgroundImage).toContain('linear-gradient');
});
