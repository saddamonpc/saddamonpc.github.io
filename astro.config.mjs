// @ts-check
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import rehypeFigure from '@microflash/rehype-figure';
import { defineConfig, fontProviders } from 'astro/config';
import rehypeCallouts from 'rehype-callouts';
import remarkFlexibleMarkers from 'remark-flexible-markers';
import remarkReadingTime from 'remark-reading-time';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { buildLinkIndex } from './src/lib/markdown/link-index.ts';
import { remarkObsidian } from './src/lib/markdown/remark-obsidian.ts';
import { remarkPostMeta } from './src/lib/markdown/remark-post-meta.ts';

// https://astro.build/config
export default defineConfig({
	site: 'https://saddamonpc.github.io',

	// Every page URL ends in "/". This keeps relative links to audio files beside a post working.
	trailingSlash: 'always',

	integrations: [sitemap()],

	// How Markdown is turned into pages. Plugins run in order, top to bottom.
	markdown: {
		// Code colours. Everforest is a green-tinted dark theme that sits well with the site's palette.
		shikiConfig: { theme: 'everforest-dark' },
		remarkPlugins: [
			[remarkObsidian, { resolveLink: buildLinkIndex('./src/content') }], // [[links]], ![[embeds]], %%comments%%, YouTube
			remarkFlexibleMarkers, // ==highlight==
			remarkReadingTime, // "N min read"
			remarkPostMeta, // preview text and picture list for the posts page
		],
		rehypePlugins: [
			[rehypeCallouts, { theme: 'obsidian', showIndicator: false }], // > [!tip] callouts
			rehypeFigure, // a picture on its own line gets a caption
		],
	},

	// Fonts are downloaded at build time and served from this site (no requests to Google at runtime).
	fonts: [
		{
			provider: fontProviders.fontsource(),
			name: 'Lora',
			cssVariable: '--font-lora',
			weights: [400, 600],
			styles: ['normal', 'italic'],
			subsets: ['latin', 'latin-ext', 'cyrillic', 'vietnamese'],
			fallbacks: ['Georgia', 'serif'],
		},
		{
			provider: fontProviders.fontsource(),
			name: 'Noto Sans Mono',
			cssVariable: '--font-noto-sans-mono',
			weights: [400, 600],
			styles: ['normal'],
			subsets: ['latin', 'latin-ext', 'cyrillic', 'greek', 'vietnamese'],
			fallbacks: ['monospace'],
		},
	],

	vite: {
		plugins: [
			tailwindcss(),
			// Audio files sit next to their post (src/content/posts/<folder>/take.mp3).
			// Copy them to the same address as the post (/posts/<folder>/take.mp3), and serve them in dev too.
			viteStaticCopy({
				silent: true, // fine if a folder has no audio yet
				targets: ['posts', 'projects'].map((collection) => ({
					src: `src/content/${collection}/*/*.{mp3,m4a,wav,ogg}`,
					dest: collection,
					rename: { stripBase: 3 },
				})),
			}),
		],
	},
});
