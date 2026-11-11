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

	test('burger opens a full-screen menu with the links centred', async ({ page }) => {
		await page.goto('/');
		const button = page.locator('button[aria-controls="main-nav"]');
		const links = page.locator('nav[aria-label="Main"] a');
		await expect(button).toHaveAccessibleName('Menu');
		await expect(button).toHaveAttribute('aria-expanded', 'false');
		await expect(links.first()).toBeHidden();

		await button.click();
		await expect(button).toHaveAttribute('aria-expanded', 'true');
		await expect(links).toHaveCount(4);
		for (const link of await links.all()) {
			await expect(link).toBeVisible();
			const box = (await link.boundingBox())!;
			expect(Math.abs(box.x + box.width / 2 - 375 / 2), 'centred').toBeLessThanOrEqual(2);
		}
		const nav = (await page.locator('#main-nav').boundingBox())!;
		expect(nav.height).toBeGreaterThanOrEqual(740 - 1); // covers the whole screen
		expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe('hidden'); // page behind can't scroll
		await expect(button).toBeVisible(); // still there to close it

		await page.keyboard.press('Escape');
		await expect(links.first()).toBeHidden();
		await expect(button).toBeFocused();
		expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).not.toBe('hidden');
	});

	test('closing fades out instead of cutting away', async ({ page }) => {
		await page.goto('/');
		const button = page.locator('button[aria-controls="main-nav"]');
		const nav = page.locator('#main-nav');
		await button.click();
		await page.waitForTimeout(300);
		await button.click();
		// Right after closing, the menu is still on screen, fading.
		expect(await nav.evaluate((el) => getComputedStyle(el).display)).not.toBe('none');
		await expect(nav).toHaveClass(/closing/);
		await expect(nav.locator('a').first()).toBeHidden();
	});

	test('reopening during the fade-out keeps the menu open', async ({ page }) => {
		await page.goto('/');
		const button = page.locator('button[aria-controls="main-nav"]');
		await button.click();
		await page.waitForTimeout(300);
		await button.click(); // close: starts fading out
		await page.waitForTimeout(80); // a fast human second tap (clicks <50ms apart count as one tap)
		await button.click(); // open again, mid-fade
		await page.waitForTimeout(500);
		await expect(button).toHaveAttribute('aria-expanded', 'true');
		await expect(page.locator('#main-nav a').first()).toBeVisible();
		expect(await page.locator('#main-nav').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
	});

	test('one tap that the browser delivers as two clicks toggles only once', async ({ page }) => {
		// Seen on Chrome: a quick second tap arrives as a synthetic click plus the real one, ~4ms apart.
		await page.goto('/');
		await page.evaluate(async () => {
			const button = document.querySelector<HTMLButtonElement>('button[aria-controls="main-nav"]')!;
			button.click();
			await new Promise((resolve) => setTimeout(resolve, 4));
			button.click();
		});
		await page.waitForTimeout(400);
		await expect(page.locator('button[aria-controls="main-nav"]')).toHaveAttribute('aria-expanded', 'true');
		await expect(page.locator('#main-nav a').first()).toBeVisible();
	});

	test('the open menu dims and blurs the page behind it', async ({ page }) => {
		await page.goto('/');
		await page.locator('button[aria-controls="main-nav"]').click();
		await page.waitForTimeout(300);
		const style = await page.locator('#main-nav').evaluate((el) => {
			const s = getComputedStyle(el);
			return { backdrop: s.backdropFilter || s.getPropertyValue('-webkit-backdrop-filter'), background: s.backgroundColor };
		});
		expect(style.backdrop).toContain('blur(');
		expect(style.background).toMatch(/0\.8\)$/); // the page colour at 80% opacity
	});

	test('the top bar stays on screen while scrolling', async ({ page }) => {
		await page.goto('/posts/sample-post/');
		await page.mouse.wheel(0, 1500);
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
		const header = (await page.locator('body > header').boundingBox())!;
		expect(header.y).toBe(0);
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

test('page content lines up with the navbar on every page', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	for (const path of ['/', '/posts/', '/posts/sample-post/', '/projects/', '/projects/sample-project/', '/cv/', '/this-page-does-not-exist/']) {
		await page.goto(path);
		const content = async (selector: string) =>
			page.locator(selector).first().evaluate((el) => {
				const box = el.getBoundingClientRect();
				const style = getComputedStyle(el);
				return [box.left + Number.parseFloat(style.paddingLeft), box.right - Number.parseFloat(style.paddingRight)];
			});
		const [headerLeft, headerRight] = await content('[data-header-inner]');
		const [pageLeft, pageRight] = await content('main [data-page]');
		expect(Math.abs(pageLeft - headerLeft), `${path} left`).toBeLessThanOrEqual(1);
		expect(Math.abs(pageRight - headerRight), `${path} right`).toBeLessThanOrEqual(1);
	}
});

test('highlights use the pistachio-to-mint gradient; plain links do not', async ({ page }) => {
	await page.goto('/posts/');
	const gradient = (selector: string) => page.locator(selector).first().evaluate((el) => getComputedStyle(el).backgroundImage);
	expect(await gradient('nav[aria-label="Main"] a[aria-current="page"]')).toMatch(/linear-gradient\(90deg, rgb\(151, 218, 126\).*rgb\(111, 220, 176\)/);
	await page.getByRole('button', { name: /^practice\s*\d+$/ }).click();
	expect(await gradient('[data-tag][aria-pressed="true"]')).toContain('linear-gradient');
	await page.goto('/posts/sample-post/');
	expect(await gradient('main mark')).toContain('linear-gradient');
	await page.locator('.prose a.wikilink').first().hover();
	expect(await gradient('.prose a.wikilink')).toBe('none');
});
