// Small helpers for posts and projects. Pure functions, so they're easy to test.

export type CollectionName = 'posts' | 'projects';

/** Tags are case-insensitive: "3D", " 3d " and "3d" are the same tag. */
export function normalizeTags(tags: string[]): string[] {
	const cleaned = tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag !== '');
	return [...new Set(cleaned)];
}

/** The page address of a post or project, e.g. /posts/barre-chords/ */
export function entryUrl(collection: CollectionName, id: string): string {
	return `/${collection}/${id}/`;
}

/** The posts or projects page, filtered to one tag, e.g. /posts/?tag=guitar */
export function tagUrl(collection: CollectionName, tag: string): string {
	return `/${collection}/?tag=${encodeURIComponent(tag)}`;
}
