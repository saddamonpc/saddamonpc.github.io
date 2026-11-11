# saddamonpc.github.io

My personal website: thoughts, guitar, ZBrush, Houdini, drawing, and my CV. Built with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com).

## Commands

You need Node.js 22.23 or newer.

| Command            | What it does                                                   |
| ------------------ | -------------------------------------------------------------- |
| `npm install`      | Install everything (once, and after pulling new dependencies)  |
| `npm run dev`      | Run the site locally at http://localhost:4321/                 |
| `npm run build`    | Build the final site into `dist/`                              |
| `npm test`         | Run the unit tests                                             |
| `npm run test:e2e` | Build the site and test it in a real browser                   |

Pushing to `main` on GitHub runs the tests and deploys the site automatically.

## Where things live

| Folder                 | What's in it                                                                 |
| ---------------------- | ---------------------------------------------------------------------------- |
| `src/content/`         | Your writing: posts, projects, and the home page bio. Open it in Obsidian.   |
| `src/pages/`           | One file per page or URL                                                     |
| `src/layouts/`         | Page frames shared by several pages                                          |
| `src/components/`      | Reusable pieces (navbar, footer, cards, filter bar)                          |
| `src/styles/`          | Colours, fonts and the Markdown styling                                      |
| `src/lib/`             | Small helper functions, all covered by tests                                 |
| `src/data/cv.ts`       | Your CV entries                                                              |
| `tests/`               | Automatic tests                                                              |

## Writing a post

(Filled in as the content model lands.)
