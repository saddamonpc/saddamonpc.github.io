// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://saddamonpc.github.io',

  // Every page URL ends in "/". This keeps relative links to audio files beside a post working.
  trailingSlash: 'always',

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});