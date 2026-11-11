// @ts-check
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
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
import { rehypeTaskLabels } from './src/lib/markdown/rehype-task-labels.ts';

import icon from 'astro-icon';

// Drafts are visible in `npm run dev` and in the tests (SHOW_DRAFTS=1), never on the real site.
const SHOW_DRAFTS = process.env.SHOW_DRAFTS === '1' || process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
    // The site's address: used for link previews, the RSS feed and the sitemap.
    site: 'https://msmashuri.com',

    // Every page URL ends in "/". This keeps relative links to audio files beside a post working.
    trailingSlash: 'always',

    integrations: [sitemap(), icon()],

    // How Markdown is turned into pages. Plugins run in order, top to bottom.
    markdown: {
        // Code colours. Everforest is a green-tinted dark theme that sits well with the site's palette.
        shikiConfig: { theme: 'everforest-dark' },
        processor: unified({
            remarkPlugins: [
                [remarkObsidian, { resolveLink: buildLinkIndex('./src/content', { includeDrafts: SHOW_DRAFTS }) }], // [[links]], ![[embeds]], %%comments%%, YouTube
                remarkFlexibleMarkers, // ==highlight==
                remarkReadingTime, // "N min read"
                remarkPostMeta, // preview text and picture list for the posts page
            ],
            rehypePlugins: [
                [rehypeCallouts, { theme: 'obsidian', showIndicator: false }], // > [!tip] callouts
                rehypeFigure, // a picture on its own line gets a caption
                rehypeTaskLabels, // checklist boxes say "done" / "not done" to screen readers
            ],
        }),
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
                    src: `src/content/${collection}/*/*.{mp3,m4a,wav,ogg,MP3,M4A,WAV,OGG}`, // phones often write .MP3
                    dest: collection,
                    rename: { stripBase: 3 },
                })),
            }),
        ],
    },
});