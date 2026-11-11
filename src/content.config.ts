// What a post or project file must contain at the top (its "frontmatter").
// Each entry lives in its own folder: src/content/posts/<folder>/<folder>.md
// The folder name becomes the page address: /posts/<folder>/
// Only that note is read: other notes in the folder (e.g. Obsidian's "Untitled.md") are ignored.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { normalizeTags, utcDate } from './lib/content';
import { listEntries } from './lib/content-files';

const folderName = ({ entry }: { entry: string }) => entry.split('/')[0];
// Exactly the <folder>/<folder>.md files. (A pattern that matches nothing when there are no entries yet.)
const entryFiles = (collection: 'posts' | 'projects') => {
	const files = listEntries('./src/content', collection).map(({ folder, name }) => `${folder}/${name}.md`);
	return files.length > 0 ? files : ['__none__/__none__.md'];
};
const date = z.preprocess(utcDate, z.coerce.date());
const tags = z.array(z.string()).default([]).transform(normalizeTags);

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: entryFiles('posts'), generateId: folderName }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			date,
			tags,
			cover: image().optional(),
			draft: z.boolean().optional(),
		}),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: entryFiles('projects'), generateId: folderName }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			date,
			tags,
			cover: image().optional(),
			draft: z.boolean().optional(),
			category: z.string().optional(),
			tools: z.array(z.string()).optional(),
			timeframe: z.string().optional(),
		}),
});

export const collections = { posts, projects };
