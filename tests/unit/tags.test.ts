import { expect, test } from 'vitest';
import { countTags } from '../../src/lib/tags';

test('counts tags, most used first, ties alphabetical', () => {
	expect(countTags([{ tags: ['b', 'a'] }, { tags: ['a'] }, { tags: ['c'] }])).toEqual([
		{ tag: 'a', count: 2 },
		{ tag: 'b', count: 1 },
		{ tag: 'c', count: 1 },
	]);
});
