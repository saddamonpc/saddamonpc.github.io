import { expect, test } from '@playwright/test';

test('header and sections', async ({ page }) => {
	await page.goto('/cv/');
	await expect(page.locator('nav[aria-label="Main"] a[aria-current="page"]')).toHaveText('cv / résumé');
	await expect(page.locator('h1')).toHaveText('Mohammad Saddam Mashuri');
	await expect(page.locator('main h2')).toHaveText(['About', 'Experience', 'Education', 'Skills', 'Languages']);
});

test('entry dates sit on the right of the title line', async ({ page }) => {
	await page.goto('/cv/');
	const entry = page.locator('[data-cv-entry]').first();
	const title = entry.locator('[data-cv-title]');
	await expect(title).toContainText('Backend Developer');
	await expect(title).toContainText('BNI Sekuritas');
	const when = entry.locator('[data-cv-when]');
	await expect(when).toHaveText('2025 – present');
	const [t, w, e] = [(await title.boundingBox())!, (await when.boundingBox())!, (await entry.boundingBox())!];
	// Same line: the date sits inside the vertical span of the title line.
	expect(w.y).toBeGreaterThanOrEqual(t.y - 1);
	expect(w.y + w.height).toBeLessThanOrEqual(t.y + t.height + 1);
	expect(Math.abs(w.x + w.width - (e.x + e.width))).toBeLessThanOrEqual(4);
});

test('timeline dot is filled only for ongoing entries', async ({ page }) => {
	await page.goto('/cv/');
	const dot = (i: number) =>
		page.locator('[data-cv-entry]').nth(i).evaluate((el) => getComputedStyle(el, '::before').backgroundColor);
	expect(await dot(0)).toBe('rgb(151, 218, 126)');
	expect(await dot(2)).not.toBe('rgb(151, 218, 126)'); // Universitas Indonesia, ended 2025
});

test('download buttons are greyed out until the PDFs exist', async ({ page }) => {
	await page.goto('/cv/');
	const cv = page.getByRole('link', { name: /Download CV/ });
	const resume = page.getByRole('link', { name: /Download résumé/ });
	await expect(cv).toHaveAttribute('aria-disabled', 'true');
	await expect(resume).toHaveAttribute('aria-disabled', 'true');
	await expect(cv).toContainText('⤓ Download CV');
	await expect(resume).toContainText('⤓ Download résumé');
	await cv.focus();
	await expect(cv.getByText('under construction')).toBeVisible();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/cv\/$/);
});
