import { describe, expect, test } from 'vitest';
import { entryUrl, normalizeTags, tagUrl, utcDate } from '../../src/lib/content';

describe('normalizeTags', () => {
	test('lowercases, trims, drops empties and duplicates, keeps first-seen order', () => {
		expect(normalizeTags(['3D', ' 3d ', 'Guitar', '', 'guitar'])).toEqual(['3d', 'guitar']);
	});
});

describe('urls', () => {
	test('entryUrl is the folder name under the collection, with a trailing slash', () => {
		expect(entryUrl('posts', 'sample-post')).toBe('/posts/sample-post/');
	});

	test('tagUrl encodes the tag for the query string', () => {
		expect(tagUrl('posts', 'house music')).toBe('/posts/?tag=house%20music');
	});
});

describe('utcDate', () => {
	test("Obsidian's date-and-time values (no timezone) are read as UTC, not local time", () => {
		expect(utcDate('2026-11-02T03:00')).toBe('2026-11-02T03:00Z');
		expect(utcDate('2026-11-02T03:00:15')).toBe('2026-11-02T03:00:15Z');
	});

	test('plain dates and dates with a timezone are left alone', () => {
		expect(utcDate('2026-11-02')).toBe('2026-11-02');
		expect(utcDate('2026-11-02T03:00+07:00')).toBe('2026-11-02T03:00+07:00');
		const d = new Date(0);
		expect(utcDate(d)).toBe(d);
	});
});
