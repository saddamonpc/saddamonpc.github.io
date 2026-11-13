import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { remarkObsidian } from '../../src/lib/markdown/remark-obsidian';

const targets: Record<string, string> = { 'sample-project': '/projects/sample-project/' };
const resolveLink = (name: string) => targets[name.toLowerCase()] ?? null;

function render(markdown: string): string {
	return String(
		unified()
			.use(remarkParse)
			.use(remarkObsidian, { resolveLink })
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeStringify, { allowDangerousHtml: true })
			.processSync(markdown),
	);
}

afterEach(() => vi.restoreAllMocks());

describe('links between notes', () => {
	test('[[name]] links to the page, case-insensitively', () => {
		expect(render('see [[Sample-Project]] here')).toContain('<a href="/projects/sample-project/" class="wikilink">Sample-Project</a>');
	});

	test('[[name#Heading|text]] links to the heading, with the given text', () => {
		const html = render('[[sample-project#Final Renders|renders]]');
		expect(html).toContain('href="/projects/sample-project/#final-renders"');
		expect(html).toContain('>renders</a>');
	});

	test('[[#Heading]] links to a heading in the same note', () => {
		expect(render('See [[#Overview / Story / Thoughts]].')).toContain('<a href="#overview--story--thoughts" class="wikilink">Overview / Story / Thoughts</a>');
		expect(render('[[#Notes|the notes]]')).toContain('<a href="#notes" class="wikilink">the notes</a>');
	});

	test('a missing note becomes plain text and warns once', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		expect(render('[[nope]]')).toContain('<span class="wikilink-missing">nope</span>');
		expect(warn).toHaveBeenCalledTimes(1);
	});
});

describe('embeds', () => {
	test('an Obsidian pasted image keeps its spaces in the path', () => {
		// Astro's image pipeline reads the Markdown tree, so the path there must stay as written...
		const processor = unified().use(remarkParse).use(remarkObsidian, { resolveLink });
		const tree = processor.runSync(processor.parse('![[Pasted image 2026.png]]'));
		expect(JSON.stringify(tree)).toContain('"url":"./Pasted image 2026.png"');
		// ...and the HTML gets a properly encoded address.
		expect(render('![[Pasted image 2026.png]]')).toContain('<img src="./Pasted%20image%202026.png" alt="">');
	});

	test('a size after | is ignored, any other text becomes the alt', () => {
		expect(render('![[a.jpg|300]]')).toContain('<img src="./a.jpg" alt="">');
		expect(render('![[a.jpg|A caption]]')).toContain('<img src="./a.jpg" alt="A caption">');
	});

	test('audio becomes a track box at the top level, not inside a paragraph', () => {
		const html = render('![[take.mp3|Take · 2026]]');
		expect(html).toMatch(/^<figure class="track">/);
		expect(html).toContain('<figcaption>Take · 2026</figcaption>');
		expect(html).toContain('<audio controls preload="none" src="./take.mp3"></audio>');
		expect(html).not.toContain('<p>');
	});

	test('audio without a caption is titled with its file name', () => {
		expect(render('![[my take.m4a]]')).toContain('<figcaption>my take</figcaption>');
		expect(render('![[my take.m4a]]')).toContain('src="./my%20take.m4a"');
	});

	test('a YouTube link becomes a privacy-friendly embed, not an image', () => {
		const html = render('![](https://youtu.be/abc123)');
		expect(html).toMatch(/^<div class="video"><iframe src="https:\/\/www.youtube-nocookie.com\/embed\/abc123"/);
		expect(html).not.toContain('<img');
		expect(render('![My video](https://www.youtube.com/watch?v=xyz789&t=4)')).toContain('embed/xyz789" title="My video"');
	});

	test('a video file becomes a player at the top level, with its caption below', () => {
		const html = render('![[my clip.mp4|A clip]]');
		expect(html).toMatch(/^<figure class="clip">/);
		expect(html).toContain('<video controls playsinline preload="metadata" src="./my%20clip.mp4#t=0.1"></video>');
		expect(html).toContain('<figcaption>A clip</figcaption>');
		expect(html).not.toContain('<p>');
	});

	test('a video without a caption has no caption; Markdown links to video files work too', () => {
		expect(render('![[clip.MOV]]')).not.toContain('figcaption');
		expect(render('![Take two](./clip.webm)')).toContain('src="./clip.webm#t=0.1"');
		expect(render('![Take two](./clip.webm)')).not.toContain('<img');
	});
});

describe('callouts', () => {
	test('an unknown callout type becomes a note titled with that type, like in Obsidian', () => {
		expect(render('> [!banana]\n> text')).toContain('[!note] Banana');
		expect(render('> [!banana] My title\n> text')).toContain('[!note] My title');
		expect(render('> [!banana]- Folded\n> text')).toContain('[!note]- Folded');
	});

	test('known types are left alone', () => {
		expect(render('> [!Warning]\n> text')).toContain('[!Warning]');
		expect(render('> [!faq]\n> text')).toContain('[!faq]');
	});
});

describe('inline extras', () => {
	test('%%comments%% are removed, and a comment-only paragraph disappears', () => {
		const html = render('x %%secret%% y\n\n%%only a comment%%\n\nafter');
		expect(html).not.toContain('secret');
		expect(html).not.toContain('only a comment');
		expect(html).not.toContain('<p></p>');
		expect(html).toContain('<p>after</p>');
	});
});

describe('review fixes', () => {
	test('%%comments%% containing formatting are removed completely', () => {
		const html = render('Short. %% my *private* note %% end');
		expect(html).not.toContain('private');
		expect(html).toContain('Short.');
		expect(html).toContain('end');
	});

	test('a %% block %% spanning blank lines is removed completely', () => {
		const html = render('%%\nline one\n\nline two\n%%\n\nafter');
		expect(html).not.toContain('line one');
		expect(html).not.toContain('line two');
		expect(html).toContain('<p>after</p>');
	});

	test('%% inside code is left alone', () => {
		expect(render('`a %% b`')).toContain('<code>a %% b</code>');
	});

	test('vault-rooted paths from Obsidian still point at the file beside the note', () => {
		expect(render('![[posts/foo/render.jpg]]')).toContain('<img src="./render.jpg"');
		expect(render('[[projects/sample-project/sample-project|x]]')).toContain('href="/projects/sample-project/"');
	});
});
