// `npm run pull`: gets the latest version from GitHub, even when Obsidian Sync got there first.
//
// Obsidian Sync copies posts between your computers straight away; git brings the same files again
// when you pull. Git refuses to pull over files that are already there ("Please move or remove them"),
// even when they're identical. So this first tells git "these files already match GitHub" (by staging
// exactly those), then pulls. Nothing on disk changes, so Sync has nothing to send back.
// A file that differs from GitHub's version is never touched: the pull stops and git lists it.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const UPSTREAM = 'origin/main';

/** Runs git and returns what it printed. Throws if git fails. */
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const succeeds = (...args) => {
	try {
		git(...args);
		return true;
	} catch {
		return false;
	}
};
const stop = (message) => {
	console.error(message);
	process.exit(1);
};

if (git('branch', '--show-current') !== 'main') stop('Switch to the main branch first (git switch main).');

git('fetch', '--quiet', 'origin');
if (succeeds('merge-base', '--is-ancestor', UPSTREAM, 'HEAD')) {
	console.log('Already up to date with GitHub.');
	process.exit(0);
}
if (!succeeds('merge-base', '--is-ancestor', 'HEAD', UPSTREAM)) {
	stop('This computer and GitHub both have commits the other lacks. Run "git pull" and sort it out (or ask for help).');
}

// Every file GitHub changed since this computer's last pull ("-z": names with spaces or Japanese stay intact).
const changed = git('diff', '--name-only', '--no-renames', '-z', 'HEAD', UPSTREAM).split('\0').filter(Boolean);
let alreadyHere = 0;
for (const path of changed) {
	const onGitHub = succeeds('cat-file', '-e', `${UPSTREAM}:${path}`) ? git('rev-parse', `${UPSTREAM}:${path}`) : null; // null: deleted on GitHub
	const onThisComputer = existsSync(path) ? git('hash-object', '--', path) : null; // null: not here (any more)
	if (onGitHub !== onThisComputer) continue; // not delivered by Sync: git updates it normally (or reports it)
	if (onGitHub) git('add', '--', path);
	else git('rm', '--cached', '--quiet', '--ignore-unmatch', '--', path);
	alreadyHere++;
}

try {
	execFileSync('git', ['merge', '--ff-only', '--quiet', UPSTREAM], { stdio: 'inherit' });
} catch {
	stop('\nThe files above are different here than on GitHub. Wait for Obsidian Sync to finish and run "npm run pull" again.');
}
console.log(`Up to date with GitHub. (${alreadyHere} of ${changed.length} changed files were already here, thanks to Obsidian Sync.)`);
