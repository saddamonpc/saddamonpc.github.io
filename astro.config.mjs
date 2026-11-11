// @ts-check
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import { buildLinkIndex } from './src/lib/markdown/link-index.ts';
import { remarkObsidian } from './src/lib/markdown/remark-obsidian.ts';

// https://astro.build/config
export default defineConfig({
	site: 'https://saddamonpc.github.io',

	// Every page URL ends in "/". This keeps relative links to audio files beside a post working.
	trailingSlash: 'always',

	integrations: [sitemap()],

	// How Markdown is turned into pages. Plugins run in order, top to bottom.
	markdown: {
		remarkPlugins: [[remarkObsidian, { resolveLink: buildLinkIndex('./src/content') }]],
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
		plugins: [tailwindcss()],
	},
});
