import { expect, test } from '@playwright/test';

test('project page shows the facts strip', async ({ page }) => {
	await page.goto('/projects/sample-project/');
	await expect(page.locator('h1')).toHaveText('Sample project: a stylised bust');
	const facts = page.locator('[data-facts]');
	await expect(facts).toContainText('category');
	await expect(facts).toContainText('3D');
	await expect(facts).toContainText('tools');
	await expect(facts).toContainText('ZBrush, Blender');
	await expect(facts).toContainText('timeframe');
	await expect(facts).toContainText('Sep – Oct 2026');
	await expect(page.locator('[data-entry-meta]').getByRole('link', { name: '#3d' })).toHaveAttribute('href', '/projects/?tag=3d');
	await expect(page.locator('nav[aria-label="Main"] a[aria-current="page"]')).toHaveText('projects');
});

test('project page has a table of contents on wide screens', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto('/projects/sample-project/');
	await expect(page.locator('nav[aria-label="Table of contents"]')).toBeVisible();
});

test('no "last updated" when a project has no updated date', async ({ page }) => {
	await page.goto('/projects/sample-project/');
	await expect(page.locator('[data-entry-meta]')).toContainText('Created on 1 October 2026.');
	await expect(page.locator('[data-entry-meta]')).not.toContainText('last updated');
});

test('posts have no facts strip', async ({ page }) => {
	await page.goto('/posts/sample-post/');
	await expect(page.locator('[data-facts]')).toHaveCount(0);
});
