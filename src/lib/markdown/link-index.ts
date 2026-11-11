// Finds every post and project note, so Obsidian links like [[barre-chords]] know where to point.
// Drafts are left out unless includeDrafts is set (dev server and tests), so the real site never
// links to a page that isn't published. Restart `npm run dev` after adding a new note to link to it.
import { listEntries } from '../content-files';

export function buildLinkIndex(contentDir: string, { includeDrafts = false } = {}): (name: string) => string | null {
	const index = new Map<string, string>();

	// Projects first, posts second: if a post and a project share a name, the post wins.
	for (const collection of ['projects', 'posts'] as const) {
		for (const entry of listEntries(contentDir, collection)) {
			if (entry.draft && !includeDrafts) continue;
			const name = entry.name.toLowerCase();
			if (index.has(name)) console.warn(`[links] a post and a project are both named "${name}"; [[${name}]] links to the post`);
			index.set(name, `/${collection}/${entry.folder}/`);
		}
	}

	return (name) => index.get(name.trim().toLowerCase()) ?? null;
}
