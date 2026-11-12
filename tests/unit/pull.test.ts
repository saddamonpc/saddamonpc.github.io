// `npm run pull` (scripts/pull.mjs), tried on two throwaway clones of a throwaway "GitHub".
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';

const SCRIPT = resolve('scripts/pull.mjs');
const env = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
let root = '';

const git = (cwd: string, ...args: string[]) => execFileSync('git', args, { cwd, env, encoding: 'utf8', stdio: 'pipe' });
const read = (cwd: string, path: string) => readFileSync(join(cwd, path), 'utf8').replaceAll('\r\n', '\n'); // git on Windows may write \r\n
const write = (cwd: string, path: string, text: string) => {
	mkdirSync(join(cwd, path, '..'), { recursive: true });
	writeFileSync(join(cwd, path), text);
};
const pull = (cwd: string) => {
	try {
		return { ok: true, output: execFileSync('node', [SCRIPT], { cwd, env, encoding: 'utf8', stdio: 'pipe' }) };
	} catch (error) {
		return { ok: false, output: String((error as { stderr: string }).stderr) };
	}
};

/** "GitHub" with one post, cloned to computer A and computer B. A then publishes a new post, an edit and a deletion. */
function setUp() {
	root = mkdtempSync(join(tmpdir(), 'pull-test-'));
	git(root, 'init', '--quiet', '--bare', '-b', 'main', 'github.git');
	git(root, 'clone', '--quiet', 'github.git', 'a');
	const a = join(root, 'a');
	write(a, 'posts/old/old.md', 'v1\n');
	write(a, 'posts/gone/gone.md', 'bye\n');
	git(a, 'add', '.');
	git(a, 'commit', '--quiet', '-m', 'first');
	git(a, 'push', '--quiet', 'origin', 'HEAD:main');
	git(root, 'clone', '--quiet', 'github.git', 'b');
	const b = join(root, 'b');

	write(a, 'posts/new post/new post.md', 'new\n');
	write(a, 'posts/old/old.md', 'v2\n');
	git(a, 'rm', '--quiet', '-r', 'posts/gone');
	git(a, 'add', '.');
	git(a, 'commit', '--quiet', '-m', 'publish');
	git(a, 'push', '--quiet', 'origin', 'HEAD:main');
	return b;
}

afterEach(() => rmSync(root, { recursive: true, force: true }));
vi.setConfig({ testTimeout: 30_000 }); // real git commands: slower than the other tests

test('pulls over files Obsidian Sync already delivered, leaving drafts and work in progress alone', () => {
	const b = setUp();
	// What Sync did on computer B before the pull:
	write(b, 'posts/new post/new post.md', 'new\n');
	write(b, 'posts/old/old.md', 'v2\n');
	rmSync(join(b, 'posts/gone'), { recursive: true });
	write(b, 'posts/draft/draft.md', 'not published yet\n');

	const result = pull(b);
	expect(result.ok, result.output).toBe(true);
	expect(git(b, 'log', '-1', '--format=%s').trim()).toBe('publish');
	expect(git(b, 'status', '--porcelain').trim()).toBe('?? posts/draft/'); // the draft stays, untouched and unpublished
});

test('also pulls normally when Sync has not delivered anything', () => {
	const b = setUp();
	expect(pull(b).ok).toBe(true);
	expect(read(b, 'posts/old/old.md')).toBe('v2\n');
});

test('stops, and keeps your version, when a file here differs from GitHub', () => {
	const b = setUp();
	write(b, 'posts/old/old.md', 'my own edit\n');

	const result = pull(b);
	expect(result.ok).toBe(false);
	expect(result.output).toContain('different here than on GitHub');
	expect(read(b, 'posts/old/old.md')).toBe('my own edit\n');
	expect(git(b, 'log', '-1', '--format=%s').trim()).toBe('first');
});
