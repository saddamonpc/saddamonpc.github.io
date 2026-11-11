// Finds the posts and projects on disk. Each lives in its own folder, as a note named like the folder:
//   src/content/posts/barre-chords/barre-chords.md
// Other notes in the folder (an Obsidian "Untitled.md", a to-do list) are ignored.
// Read once when the site starts: restart `npm run dev` after adding a new folder.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface EntryFile {
	folder: string;
	name: string;
	draft: boolean;
}

export function listEntries(contentDir: string, collection: 'posts' | 'projects'): EntryFile[] {
	const dir = join(contentDir, collection);
	if (!existsSync(dir)) return [];
	const entries: EntryFile[] = [];
	for (const folder of readdirSync(dir, { withFileTypes: true })) {
		if (!folder.isDirectory()) continue;
		const files = readdirSync(join(dir, folder.name));
		// Matched case-insensitively, like Obsidian, but the folder name stays the page address.
		const note = files.find((file) => file.toLowerCase() === `${folder.name.toLowerCase()}.md`);
		if (!note) {
			console.warn(`[content] ${collection}/${folder.name}: no note named "${folder.name}.md", so it isn't published`);
			continue;
		}
		const head = readFileSync(join(dir, folder.name, note), 'utf8').split(/^---\s*$/m)[1] ?? '';
		entries.push({ folder: folder.name, name: note.slice(0, -3), draft: /^draft:\s*true\s*$/m.test(head) });
	}
	return entries;
}
