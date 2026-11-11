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

/**
 * Obsidian's "Date & time" property writes `2026-11-02T03:00` with no timezone, which JavaScript would read
 * as local time (so the day could differ between computers). Treat it as UTC, like plain dates.
 */
export function utcDate(value: unknown): unknown {
	return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value) ? `${value}Z` : value;
}
