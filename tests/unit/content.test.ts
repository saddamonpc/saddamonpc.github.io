import { describe, expect, test } from 'vitest';
import { entryUrl, normalizeTags, tagUrl } from '../../src/lib/content';

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
