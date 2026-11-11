// What a post or project file must contain at the top (its "frontmatter").
// Each entry lives in its own folder: src/content/posts/<folder>/<folder>.md
// The folder name becomes the page address: /posts/<folder>/
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { normalizeTags } from './lib/content';

const folderName = ({ entry }: { entry: string }) => entry.split('/')[0];
const tags = z.array(z.string()).default([]).transform(normalizeTags);

const posts = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '*/*.md', generateId: folderName }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			date: z.coerce.date(),
			tags,
			cover: image().optional(),
			draft: z.boolean().optional(),
		}),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '*/*.md', generateId: folderName }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			date: z.coerce.date(),
			tags,
			cover: image().optional(),
			draft: z.boolean().optional(),
			category: z.string().optional(),
			tools: z.array(z.string()).optional(),
			timeframe: z.string().optional(),
		}),
});

export const collections = { posts, projects };
