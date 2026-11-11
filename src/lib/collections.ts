// Reading posts and projects. Kept apart from content.ts because it needs Astro itself to run.
import { type CollectionEntry, getCollection } from 'astro:content';
import type { CollectionName } from './content';

/**
 * Published entries, newest first. Drafts (draft: true) show in `npm run dev` and in the tests
 * (which build with SHOW_DRAFTS=1), but never on the real site.
 */
export async function getPublished<C extends CollectionName>(collection: C): Promise<CollectionEntry<C>[]> {
	const entries = (await getCollection(collection)) as CollectionEntry<C>[];
	return entries
		.filter((entry) => !(import.meta.env.PROD && entry.data.draft && process.env.SHOW_DRAFTS !== '1'))
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
