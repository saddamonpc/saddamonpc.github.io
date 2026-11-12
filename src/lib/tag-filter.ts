// The rules of the tag filter on the posts and projects pages, kept apart from the page so they can be tested.
// Hand-written: filter libraries (List.js, MixItUp) are much bigger and don't do single/multiple + any/all.
import { normalizeTags } from './content';

export type MatchMode = 'any' | 'all';
export interface FilterState {
	selected: string[];
	multi: boolean;
	mode: MatchMode;
}

export const initialState: FilterState = { selected: [], multi: false, mode: 'any' };

/** Click on a tag button. One tag at a time unless "select multiple" is on; clicking a selected tag unselects it. */
export function toggleTag(s: FilterState, tag: string): FilterState {
	if (s.selected.includes(tag)) return { ...s, selected: s.selected.filter((t) => t !== tag) };
	return { ...s, selected: s.multi ? [...s.selected, tag] : [tag] };
}

/** Turn "select multiple" on or off. Turning it off keeps only the most recent tag. */
export function setMulti(s: FilterState, on: boolean): FilterState {
	return on ? { ...s, multi: true } : { selected: s.selected.slice(-1), multi: false, mode: 'any' };
}

export function setMode(s: FilterState, mode: MatchMode): FilterState {
	return { ...s, mode };
}

export function clearTags(s: FilterState): FilterState {
	return { ...s, selected: [] };
}

/** Should an item with these tags be shown? */
export function matches(itemTags: string[], s: FilterState): boolean {
	if (s.selected.length === 0) return true;
	return s.mode === 'all' ? s.selected.every((t) => itemTags.includes(t)) : s.selected.some((t) => itemTags.includes(t));
}

/** Read the filter from the address bar, e.g. ?tag=guitar&tag=3d&mode=all */
export function stateFromQuery(search: string): FilterState {
	const params = new URLSearchParams(search);
	const selected = normalizeTags(params.getAll('tag'));
	const mode: MatchMode = params.get('mode') === 'all' ? 'all' : 'any';
	return { selected, multi: selected.length > 1 || mode === 'all', mode };
}

/** Write the filter to the address bar, so a filtered page can be shared. Empty string when nothing is selected. */
export function stateToQuery(s: FilterState): string {
	if (s.selected.length === 0) return '';
	const parts = s.selected.map((t) => `tag=${encodeURIComponent(t)}`);
	if (s.mode === 'all') parts.push('mode=all');
	return `?${parts.join('&')}`;
}

/** For the filter buttons: how many items use each tag, most used first, ties in alphabetical order. */
export function countTags(items: { tags: string[] }[]): { tag: string; count: number }[] {
	const counts = new Map<string, number>();
	for (const item of items) {
		for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	}
	return [...counts]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
