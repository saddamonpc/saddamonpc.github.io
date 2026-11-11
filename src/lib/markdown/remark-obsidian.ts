// Turns Obsidian's Markdown extras into normal Markdown while the site builds:
//   %%comments%%          removed
//   ![[photo.jpg|text]]   picture (text becomes its description/caption)
//   ![[take.mp3|title]]   audio player box
//   [[note|text]]         link to another post or project (or plain text if it doesn't exist)
//   ![](youtube link)     YouTube video (privacy-friendly embed)
// (==highlights== come from the remark-flexible-markers package and callouts from rehype-callouts.)
//
// Hand-written because no existing package fits (checked 2026-11-11): @flowershow/remark-wiki-link
// turns pictures into raw HTML, so Astro can't optimise them, and remark-obsidian has no picture or
// audio embeds and can't point links at /posts/<folder>/.
import { slug } from 'github-slugger';
import type { Html, Image, Link, PhrasingContent, Root, Text } from 'mdast';
import { SKIP, visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

export interface ObsidianOptions {
	/** Returns the page address for a note name, or null if there's no such note. */
	resolveLink: (name: string) => string | null;
}

const IMAGE = /\.(png|jpe?g|webp|avif|gif|svg)$/i;
const AUDIO = /\.(mp3|m4a|wav|ogg)$/i;
const OBSIDIAN_SIZE = /^\d+(x\d+)?$/; // ![[photo.jpg|300]] sets a size in Obsidian; ignored here
const WIKI = /(!?)\[\[([^\]\n]+?)\]\]/g;

export function remarkObsidian({ resolveLink }: ObsidianOptions) {
	return (tree: Root, file: VFile) => {
		removeComments(tree);
		unknownCalloutsToNotes(tree);

		visit(tree, 'text', (node, index, parent) => {
			if (!parent || index === undefined) return;
			const parts = splitText(node.value, resolveLink, file);
			if (!parts) return;
			parent.children.splice(index, 1, ...parts);
			return [SKIP, index + parts.length];
		});

		visit(tree, 'image', (node, index, parent) => {
			if (!parent || index === undefined) return;
			const id = youTubeId(node.url);
			if (id) parent.children[index] = blockHtml(youTubeEmbed(id, node.alt ?? ''));
		});

		// Audio players and videos are blocks: lift them out of the paragraph they were written in.
		visit(tree, 'paragraph', (node, index, parent) => {
			if (!parent || index === undefined) return;
			const content = node.children.filter((child) => !(child.type === 'text' && child.value.trim() === ''));
			const only = content[0];
			if (content.length === 1 && only.type === 'html' && only.data && 'block' in only.data) {
				parent.children[index] = only;
			}
		});
	};
}

// Obsidian's callout types (rehype-callouts styles these). Anything else shows as a note in Obsidian,
// but rehype-callouts would leave it as a plain quote, so rewrite it: [!banana] → [!note] Banana
const CALLOUT_TYPES = new Set(
	'note abstract summary tldr info todo tip hint important success check done question help faq warning caution attention failure fail missing danger error bug example quote cite'.split(' '),
);

function unknownCalloutsToNotes(tree: Root) {
	visit(tree, 'blockquote', (node) => {
		const first = node.children[0];
		const lead = first?.type === 'paragraph' ? first.children[0] : undefined;
		if (lead?.type !== 'text') return;
		lead.value = lead.value.replace(/^\[!([\w-]+)\]([+-]?)([^\n]*)/, (whole, type: string, fold: string, title: string) => {
			if (CALLOUT_TYPES.has(type.toLowerCase())) return whole;
			const shown = title.trim() || type.charAt(0).toUpperCase() + type.slice(1);
			return `[!note]${fold} ${shown}`;
		});
	});
}

function removeComments(tree: Root) {
	visit(tree, 'text', (node) => {
		node.value = node.value.replace(/%%[\s\S]*?%%/g, '');
	});
	visit(tree, 'paragraph', (node, index, parent) => {
		if (!parent || index === undefined) return;
		const empty = node.children.every((child) => child.type === 'text' && child.value.trim() === '');
		if (empty) {
			parent.children.splice(index, 1);
			return [SKIP, index];
		}
	});
}

function splitText(value: string, resolveLink: ObsidianOptions['resolveLink'], file: VFile): PhrasingContent[] | null {
	const parts: PhrasingContent[] = [];
	let last = 0;
	for (const match of value.matchAll(WIKI)) {
		const [whole, bang, target] = match;
		if (match.index > last) parts.push(text(value.slice(last, match.index)));
		parts.push(bang ? embed(target, resolveLink, file) : wikilink(target, resolveLink, file));
		last = match.index + whole.length;
	}
	if (last === 0) return null;
	if (last < value.length) parts.push(text(value.slice(last)));
	return parts;
}

function embed(target: string, resolveLink: ObsidianOptions['resolveLink'], file: VFile): PhrasingContent {
	const [name, extra = ''] = splitPipe(target);
	if (IMAGE.test(name)) {
		const alt = OBSIDIAN_SIZE.test(extra) ? '' : extra;
		return { type: 'image', url: `./${name}`, alt, title: null } satisfies Image;
	}
	if (AUDIO.test(name)) {
		const caption = extra || name.replace(AUDIO, '');
		return blockHtml(
			`<figure class="track"><figcaption>${escapeHtml(caption)}</figcaption>` +
				`<audio controls preload="none" src="./${encodeURI(name)}"></audio></figure>`,
		);
	}
	// Embedding a whole note isn't supported: link to it instead.
	return wikilink(target, resolveLink, file);
}

function wikilink(target: string, resolveLink: ObsidianOptions['resolveLink'], file: VFile): PhrasingContent {
	const [ref, label] = splitPipe(target);
	const [name, heading] = ref.split('#').map((part) => part.trim());
	const url = resolveLink(name);
	const shown = label || heading || name;
	if (!url) {
		console.warn(`[obsidian] ${file.path ?? 'a note'}: no post or project named "${name}"`);
		return { type: 'html', value: `<span class="wikilink-missing">${escapeHtml(shown)}</span>` } satisfies Html;
	}
	return {
		type: 'link',
		url: heading ? `${url}#${slug(heading)}` : url,
		children: [text(shown)],
		data: { hProperties: { className: ['wikilink'] } },
	} satisfies Link;
}

function youTubeId(url: string): string | null {
	try {
		const parsed = new URL(url);
		if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1) || null;
		if (/(^|\.)youtube\.com$/.test(parsed.hostname)) {
			if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
			return parsed.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1] ?? null;
		}
	} catch {
		// not a full URL (e.g. ./photo.jpg)
	}
	return null;
}

function youTubeEmbed(id: string, title: string): string {
	return (
		`<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}" ` +
		`title="${escapeHtml(title || 'YouTube video')}" loading="lazy" allowfullscreen></iframe></div>`
	);
}

const text = (value: string): Text => ({ type: 'text', value });
const blockHtml = (value: string): Html => ({ type: 'html', value, data: { block: true } as Html['data'] });
const splitPipe = (target: string): [string, string] => {
	const at = target.indexOf('|');
	return at === -1 ? [target.trim(), ''] : [target.slice(0, at).trim(), target.slice(at + 1).trim()];
};
const escapeHtml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
