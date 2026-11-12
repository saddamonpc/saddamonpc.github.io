// Works out three things about each post while the site builds, and hands them to the page
// (in Astro: `const { remarkPluginFrontmatter } = await render(post)`):
//   excerpt         the preview text on the posts page: the post's own paragraphs, cut to ~300 characters
//   media           every local picture, video and YouTube link in the post, in order, for the picture strip
//   readingMinutes  "N min read", from the remark-reading-time package
// The preview and picture list are hand-written: no package found that picks only real paragraphs.
import type { Nodes, Root } from 'mdast';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

const ABSOLUTE = /^(\/|[a-z][a-z0-9+.-]*:)/i; // /path, https:, data:, ...

/** One thing in the picture strip. `src` is a path beside the post ("./photo.jpg"), a video's address, or a YouTube video id. */
export interface MediaRef {
	kind: 'image' | 'video' | 'youtube';
	src: string;
	alt: string;
}

/** Cuts text to at most `max` characters, at a space when possible, and adds "…" if anything was cut. */
export function makeExcerpt(text: string, max = 300): string {
	const chars = Array.from(text); // counts emoji and other wide characters as one
	if (chars.length <= max) return text;
	const cut = chars.slice(0, max).join('');
	const lastSpace = cut.search(/\s\S*$/);
	return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function remarkPostMeta() {
	return (tree: Root, file: VFile) => {
		const paragraphs = tree.children.filter((node) => node.type === 'paragraph');
		const text = paragraphs.map(plainText).join(' ').replace(/\s+/g, ' ').trim();

		// Pictures are image nodes; videos are HTML that remark-obsidian marked with `media`.
		const media: MediaRef[] = [];
		visit(tree, (node) => {
			if (node.type === 'image' && !ABSOLUTE.test(node.url)) media.push({ kind: 'image', src: node.url, alt: node.alt ?? '' });
			const video = node.type === 'html' && (node.data as { media?: MediaRef } | undefined)?.media;
			if (video) media.push(video);
		});

		// Set by the remark-reading-time package, which must run before this plugin.
		const data = file.data as { readingTime?: { minutes: number }; astro?: { frontmatter?: Record<string, unknown> } };
		data.astro ??= {};
		data.astro.frontmatter ??= {};
		Object.assign(data.astro.frontmatter, {
			excerpt: makeExcerpt(text),
			media,
			readingMinutes: Math.max(1, Math.round(data.readingTime?.minutes ?? 0)),
		});
	};
}

/** The readable text of a node: no picture descriptions, no raw HTML, no footnote markers. */
function plainText(node: Nodes): string {
	if (node.type === 'text' || node.type === 'inlineCode') return node.value;
	if (node.type === 'break') return ' ';
	if (node.type === 'image' || node.type === 'html' || node.type === 'footnoteReference') return '';
	if ('children' in node) return (node.children as Nodes[]).map(plainText).join(node.type === 'root' ? ' ' : '');
	return '';
}
