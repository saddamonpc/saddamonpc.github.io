// Finds every post and project note, so Obsidian links like [[barre-chords]] know where to point.
// Built once when the site starts: restart `npm run dev` after adding a new note to link to it.
import { existsSync, readdirSync } from 'node:fs';
import { join, parse } from 'node:path';

export function buildLinkIndex(contentDir: string): (name: string) => string | null {
	const index = new Map<string, string>();

	// Projects first, posts second: if a post and a project share a name, the post wins.
	for (const collection of ['projects', 'posts']) {
		const dir = join(contentDir, collection);
		if (!existsSync(dir)) continue;
		for (const folder of readdirSync(dir, { withFileTypes: true })) {
			if (!folder.isDirectory()) continue;
			for (const file of readdirSync(join(dir, folder.name))) {
				if (!file.endsWith('.md')) continue;
				const name = parse(file).name.toLowerCase();
				if (index.has(name)) console.warn(`[links] a post and a project are both named "${name}"; [[${name}]] links to the post`);
				index.set(name, `/${collection}/${folder.name}/`);
			}
		}
	}

	return (name) => index.get(name.trim().toLowerCase()) ?? null;
}
