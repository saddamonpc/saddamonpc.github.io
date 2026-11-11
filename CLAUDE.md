# CLAUDE.md

Personal website of M. Saddam Mashuri, built with Astro and Tailwind CSS and deployed to GitHub Pages at https://saddamonpc.github.io/.

Read `README.md` first: it explains the folders, the commands, and how posts are written (Obsidian-friendly Markdown in `src/content/`).

## Commands

- `npm run dev`: dev server at http://localhost:4321/ (or `npx astro dev --background`)
- `npm run build`: build to `dist/`
- `npm test`: unit tests (Vitest, `tests/unit/`)
- `npm run test:e2e`: browser and accessibility tests (Playwright, `tests/e2e/`); builds the site first

## Rules

- Keep the code small and readable. The owner is learning web development from this codebase.
- Every page must work with the keyboard alone and without JavaScript. Scripts only enhance.
- Local design notes may exist in `docs/superpowers/`. They are git-ignored on purpose: never commit them.

## Astro docs

- Routing: https://docs.astro.build/en/guides/routing/
- Components: https://docs.astro.build/en/basics/astro-components/
- Content collections: https://docs.astro.build/en/guides/content-collections/
- Styling and Tailwind: https://docs.astro.build/en/guides/styling/
