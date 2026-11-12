import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';
import { listEntries } from '../../src/lib/content-files';

afterEach(() => vi.restoreAllMocks());

function vault() {
	const dir = mkdtempSync(join(tmpdir(), 'vault-'));
	const note = (path: string, body: string) => {
		mkdirSync(join(dir, path, '..'), { recursive: true });
		writeFileSync(join(dir, path), body);
	};
	note('posts/a/a.md', '---\ntitle: A\n---\n');
	note('posts/a/Untitled.md', 'scratch');
	note('posts/b/b.md', '---\ntitle: B\ndraft: true\n---\n');
	note('posts/c/wrong-name.md', '---\ntitle: C\n---\n');
	return dir;
}

test('only the note named like its folder is an entry; extra notes are ignored', () => {
	vi.spyOn(console, 'warn').mockImplementation(() => {});
	expect(listEntries(vault(), 'posts')).toEqual([
		{ folder: 'a', name: 'a', draft: false },
		{ folder: 'b', name: 'b', draft: true },
	]);
});

test('a folder without a matching note gets a warning naming it', () => {
	const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
	listEntries(vault(), 'posts');
	expect(warn).toHaveBeenCalledWith(expect.stringContaining('posts/c'));
});

test('a missing collection folder is just empty', () => {
	expect(listEntries(vault(), 'projects')).toEqual([]);
});

test('draft: true is recognised even with a comment after it', () => {
	const dir = mkdtempSync(join(tmpdir(), 'vault-'));
	mkdirSync(join(dir, 'posts', 'd'), { recursive: true });
	writeFileSync(join(dir, 'posts', 'd', 'd.md'), '---\ntitle: D\ndraft: true # not ready yet\n---\n');
	expect(listEntries(dir, 'posts')).toEqual([{ folder: 'd', name: 'd', draft: true }]);
});
