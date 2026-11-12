import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkReadingTime from 'remark-reading-time';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { describe, expect, test } from 'vitest';
import { remarkObsidian } from '../../src/lib/markdown/remark-obsidian';
import { makeExcerpt, remarkPostMeta } from '../../src/lib/markdown/remark-post-meta';

function meta(markdown: string) {
	const file = new VFile({ value: markdown, data: { astro: { frontmatter: {} } } });
	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkObsidian, { resolveLink: () => null })
		.use(remarkReadingTime)
		.use(remarkPostMeta);
	processor.runSync(processor.parse(file), file);
	return (file.data as { astro: { frontmatter: Record<string, unknown> } }).astro.frontmatter;
}

describe('makeExcerpt', () => {
	test('short text is kept as is, with no ellipsis', () => {
		expect(makeExcerpt('short text')).toBe('short text');
	});

	test('long text is cut on a space and ends with an ellipsis', () => {
		expect(makeExcerpt('word '.repeat(100))).toMatch(/^(word ){59}word…$/);
	});

	test('text without spaces is cut hard', () => {
		expect(makeExcerpt('漢'.repeat(400)).length).toBe(301);
	});
});

describe('remarkPostMeta', () => {
	test('the preview skips pictures, callouts and headings and uses the first real paragraph', () => {
		expect(meta('![[a.jpg]]\n\n> [!tip]\n> callout text\n\n# Heading\n\nFirst real paragraph.').excerpt).toBe('First real paragraph.');
	});

	test('a post with no paragraphs has an empty preview', () => {
		expect(meta('# Only a heading').excerpt).toBe('');
	});

	test('the preview leaves out image descriptions and audio boxes', () => {
		expect(meta('Hello ![[b.png|alt words]] world\n\n![[take.mp3|Take]]').excerpt).toBe('Hello world');
	});

	test('lists local pictures in order, skipping web addresses', () => {
		expect(meta('![x](./a.jpg)\n\n![[b c.png|cap]]\n\n![r](https://x.y/r.png)').media).toEqual([
			{ kind: 'image', src: './a.jpg', alt: 'x' },
			{ kind: 'image', src: './b c.png', alt: 'cap' },
		]);
	});

	test('lists videos and YouTube links among the pictures, in order', () => {
		expect(meta('![[a.jpg]]\n\n![[clip.mp4|Take]]\n\n![Song](https://youtu.be/abc123)').media).toEqual([
			{ kind: 'image', src: './a.jpg', alt: '' },
			{ kind: 'video', src: './clip.mp4', alt: 'Take' },
			{ kind: 'youtube', src: 'abc123', alt: 'Song' },
		]);
	});

	test('reading time is words / 200, at least 1 minute', () => {
		expect(meta('word '.repeat(450)).readingMinutes).toBe(2);
		expect(meta('hi').readingMinutes).toBe(1);
	});
});

test('reading time comes from remark-reading-time when it ran first', () => {
	const file = new VFile({ value: 'hi', data: { astro: { frontmatter: {} }, readingTime: { minutes: 7.4 } } });
	const processor = unified().use(remarkParse).use(remarkPostMeta);
	processor.runSync(processor.parse(file), file);
	expect((file.data as { astro: { frontmatter: Record<string, unknown> } }).astro.frontmatter.readingMinutes).toBe(7);
});
