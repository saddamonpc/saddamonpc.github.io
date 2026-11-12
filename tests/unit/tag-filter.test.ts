import { describe, expect, test } from 'vitest';
import { clearTags, countTags, initialState, matches, setMode, setMulti, stateFromQuery, stateToQuery, toggleTag } from '../../src/lib/tag-filter';

describe('single-tag mode (the default)', () => {
	test('clicking a tag selects only that tag; clicking it again clears', () => {
		let s = toggleTag(initialState, 'a');
		expect(s.selected).toEqual(['a']);
		s = toggleTag(s, 'b');
		expect(s.selected).toEqual(['b']);
		s = toggleTag(s, 'b');
		expect(s.selected).toEqual([]);
	});

	test('nothing selected shows everything', () => {
		expect(matches(['x'], initialState)).toBe(true);
	});
});

describe('select multiple', () => {
	test('combines tags, with any/all matching', () => {
		let s = setMulti(toggleTag(initialState, 'a'), true);
		s = toggleTag(s, 'b');
		expect(s.selected).toEqual(['a', 'b']);
		s = setMode(s, 'all');
		expect(matches(['a'], s)).toBe(false);
		expect(matches(['a', 'b', 'c'], s)).toBe(true);
		expect(matches(['a'], setMode(s, 'any'))).toBe(true);
	});

	test('turning it off keeps only the last pick and resets to any', () => {
		const s = setMode(setMulti({ selected: ['a', 'b'], multi: true, mode: 'all' }, true), 'all');
		expect(setMulti(s, false)).toEqual({ selected: ['b'], multi: false, mode: 'any' });
	});

	test('clear empties the selection', () => {
		expect(clearTags({ selected: ['a', 'b'], multi: true, mode: 'all' }).selected).toEqual([]);
	});
});

describe('address bar (query string)', () => {
	test('tags with spaces and symbols round-trip', () => {
		const q = stateToQuery({ selected: ['house music', 'c#'], multi: true, mode: 'all' });
		expect(q).toBe('?tag=house%20music&tag=c%23&mode=all');
		expect(stateFromQuery(q)).toEqual({ selected: ['house music', 'c#'], multi: true, mode: 'all' });
	});

	test('tags from the address are normalised', () => {
		expect(stateFromQuery('?tag=Guitar')).toEqual({ selected: ['guitar'], multi: false, mode: 'any' });
	});

	test('nothing selected means no query', () => {
		expect(stateToQuery(initialState)).toBe('');
	});
});

test('countTags: counts tags, most used first, ties alphabetical', () => {
	expect(countTags([{ tags: ['b', 'a'] }, { tags: ['a'] }, { tags: ['c'] }])).toEqual([
		{ tag: 'a', count: 2 },
		{ tag: 'b', count: 1 },
		{ tag: 'c', count: 1 },
	]);
});
