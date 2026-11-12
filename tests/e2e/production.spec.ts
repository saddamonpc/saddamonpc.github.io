import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { listEntries } from '../../src/lib/content-files';

// The other tests build with drafts shown. This one builds the real site (drafts hidden) and checks
// what visitors see. It adapts: with no published posts or projects it expects the "nothing yet"
// messages, and once there are some it expects them listed.
test.describe.configure({ mode: 'serial', timeout: 240_000 });

let dist: string;
const page = (path: string) => readFileSync(join(dist, path, 'index.html'), 'utf8');
const published = (collection: 'posts' | 'projects') => listEntries('./src/content', collection).filter((e) => !e.draft).length;

test.beforeAll(() => {
	dist = mkdtempSync(join(tmpdir(), 'site-'));
	execSync(`npx astro build --outDir "${dist}"`, { stdio: 'ignore', env: { ...process.env, SHOW_DRAFTS: '' } });
});
test.afterAll(() => rmSync(dist, { recursive: true, force: true }));

for (const [collection, empty] of [
	['posts', 'No posts yet.'],
	['projects', 'No projects yet.'],
] as const) {
	test(`${collection} page with what's published`, () => {
		const html = page(collection);
		const has = (text: string) => html.includes(text);
		if (published(collection) === 0) {
			expect(has(empty), `says "${empty}"`).toBe(true);
			expect(has('data-tag-filter'), 'no filter bar with nothing to filter').toBe(false);
		} else {
			expect(has(empty), `doesn't say "${empty}"`).toBe(false);
			expect(has('data-tag-filter'), 'has the filter bar').toBe(true);
		}
	});
}

test('home only shows "recent posts" when there are posts', () => {
	const html = page('');
	expect(html.includes('Recent posts'), 'recent posts section').toBe(published('posts') > 0);
});
