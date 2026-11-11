import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { buildLinkIndex } from '../../src/lib/markdown/link-index';

test('maps note names to page addresses', () => {
	const dir = mkdtempSync(join(tmpdir(), 'links-'));
	mkdirSync(join(dir, 'posts', 'a'), { recursive: true });
	mkdirSync(join(dir, 'projects', 'b'), { recursive: true });
	writeFileSync(join(dir, 'posts', 'a', 'a.md'), '# a');
	writeFileSync(join(dir, 'projects', 'b', 'b.md'), '# b');

	const resolve = buildLinkIndex(dir);
	expect(resolve('A')).toBe('/posts/a/');
	expect(resolve('b')).toBe('/projects/b/');
	expect(resolve('c')).toBeNull();
});
