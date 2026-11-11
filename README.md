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

Open `src/content/` as a vault in Obsidian. Its settings (in `src/content/.obsidian/`) already put pasted pictures next to the note you're writing.

1. Make a folder in `src/content/posts/` named like the page address you want, e.g. `barre-chords`. Use lowercase and dashes.
2. Inside it, make a note with the **same name**: `barre-chords/barre-chords.md`. (Same name, so Obsidian's `[[barre-chords]]` links can find it.)
3. Start the note with this frontmatter:

   ```yaml
   ---
   title: Learning barre chords, again
   date: 2026-10-18
   tags: [guitar, practice]
   cover: ./cover.jpg # optional header image, in the same folder
   draft: true # optional: shows in `npm run dev`, hidden on the real site
   ---
   ```

4. Write. The page appears at `/posts/barre-chords/`.

Only the note named like its folder is published. Other notes in the folder (an Obsidian `Untitled.md`, a to-do list) are ignored. After adding a **new folder**, restart `npm run dev` so the site notices it.

`src/content/posts/sample-post/`, `src/content/posts/test-newer-post/` and `src/content/projects/sample-project/` are drafts: they show in `npm run dev` and in the tests, never on the real site. Keep them, because the tests use them.

Projects work the same way in `src/content/projects/`, and can also have `category`, `tools: [ZBrush, Blender]` and `timeframe: Sep – Oct 2026`, which show in a strip under the title.

### What works

- Normal Markdown: headings, **bold**, _italic_, links, lists, tables, `code`, footnotes.
- Obsidian extras: `==highlight==`, `%%hidden comments%%` (hidden on the site, but this repo is public, so anyone can read them on GitHub, like drafts), callouts (`> [!tip]`, `> [!note]`, `> [!warning]` and Obsidian's other types, plus foldable `> [!note]-`).
- Links to other notes: `[[sample-project]]`, `[[sample-project|your own text]]`, `[[sample-project#A heading]]`.
- Pictures: `![[photo.jpg]]`, `![[photo.jpg|caption]]`, or `![caption](./photo.jpg)`. The caption shows under the picture and is read aloud to people who can't see it, so add one where you can.
- Audio: `![[take.mp3|Title · recorded 2026-10-18]]`, with the file in the same folder (mp3, m4a, wav, ogg).
- YouTube: `![](https://www.youtube.com/watch?v=...)`.

### What doesn't (yet)

Embedding a whole other note (`![[other note]]`), block references (`^id`), Dataview, and Canvas.

The first real paragraph of a post becomes its preview on the posts page, so make it a good one.
