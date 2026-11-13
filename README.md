# msmashuri.com

Source of https://msmashuri.com/ (GitHub repo `saddamonpc/saddamonpc.github.io`).

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
| `npm run pull`     | Get the latest from GitHub; use it instead of `git pull` (below) |

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

1. Make a folder in `src/content/posts/` named like the page address you want, e.g. `barre-chords`. Use lowercase letters, numbers and dashes, and keep it short: the title can be long, the folder name can't change once the post is out (it's the address people link to).

   | Title                                                      | Folder                         |
   | ---------------------------------------------------------- | ------------------------------ |
   | Learning barre chords, again (part 2): what finally worked | `barre-chords-part-2`          |
   | ZBrush → Blender: retopology for 3D prints                 | `zbrush-to-blender-retopology` |
   | Kenapa saya belajar gitar lagi?                            | `kenapa-belajar-gitar-lagi`    |

2. Inside it, make a note with the **same name**: `barre-chords/barre-chords.md`. (Same name, so Obsidian's `[[barre-chords]]` links can find it.) If you rename one in Obsidian, rename the other too.
3. Fill the note in with the template: run "Templates: Insert template" (Ctrl+P) and pick `post` (or `project`). Turn on Obsidian's **Templates** core plugin once first (Settings, Core plugins); the template folder `_templates` is already set. It lays out every property with today's date and sample values, plus a hidden `%% … %%` note saying what each one is for (it never shows on the site; delete it when you like):

   ```yaml
   ---
   title: Learning barre chords, again # required
   date: 2026-10-18 # required
   updated: 2026-11-02 # when you last changed it; the same day as date shows nothing
   tags:
     - guitar
     - practice
   cover: ./cover.jpg # header picture in the same folder
   draft: true # shows in `npm run dev`, hidden on the real site
   ---
   ```

   Only `title` and `date` are required: if one is missing, `npm run dev` shows an error naming it. Any other property can be deleted or left empty (`cover:` with nothing after it).

4. Write. The page appears at `/posts/barre-chords/`.

Only the note named like its folder is published. Other notes in the folder (an Obsidian `Untitled.md`, a to-do list) are ignored. After adding a **new folder**, restart `npm run dev` so the site notices it.

`src/content/posts/sample-post/`, `src/content/posts/test-newer-post/` and `src/content/projects/sample-project/` are drafts: they show in `npm run dev` and in the tests, never on the real site. Keep them, because the tests use them.

Projects work the same way in `src/content/projects/`, and can also have `category`, `tools: [ZBrush, Blender]` and `timeframe: Sep – Oct 2026`, which show in a strip under the title.

### Writing on several computers (Obsidian Sync)

Obsidian Sync moves your writing between computers (and your phone) as you type. Git publishes it. Unpublished drafts never need to go to GitHub, so they stay private.

- **Each computer, once:** clone this repo, open `src/content/` as a vault, and connect it to the same remote vault in Settings → Sync. Turn on syncing images, audio, videos and other file types there too.
- **Before working:** run `npm run pull` instead of `git pull`. Plain `git pull` (and VS Code's sync button) refuses whenever Sync has already brought the files a pull would bring. `npm run pull` checks they're identical to GitHub's, then pulls. If something differs, it stops and changes nothing: usually Sync hasn't finished yet, so wait a moment and run it again.
- **Publishing:** commit only the finished post's folder, not everything: `git add src/content/posts/barre-chords`, then commit and push. Drafts stay out of git.

### What works

- Normal Markdown: headings, **bold**, _italic_, links, lists, tables, `code`, footnotes.
- Obsidian extras: `==highlight==`, `%%hidden comments%%` (hidden on the site, but this repo is public, so anyone can read them on GitHub, like drafts), callouts (`> [!tip]`, `> [!note]`, `> [!warning]` and Obsidian's other types, plus foldable `> [!note]-`).
- Links to other notes: `[[sample-project]]`, `[[sample-project|your own text]]`, `[[sample-project#A heading]]`, and to a heading in the same note: `[[#A heading]]`.
- Pictures: `![[photo.jpg]]`, `![[photo.jpg|caption]]`, or `![caption](./photo.jpg)`. The caption shows under the picture and is read aloud to people who can't see it, so add one where you can.
- Audio: `![[take.mp3|Title · recorded 2026-10-18]]`, with the file in the same folder (mp3, m4a, wav, ogg).
- Video: `![[clip.mp4|Caption]]`, with the file in the same folder (mp4, webm, mov, m4v). Keep each file well under 100 MB (GitHub's limit); mp4 plays everywhere.
- YouTube: `![](https://www.youtube.com/watch?v=...)`.
- Videos and YouTube links also appear in the picture strip on the posts page, with a play badge.

### What doesn't (yet)

Embedding a whole other note (`![[other note]]`), block references (`^id`), Dataview, and Canvas.

The first real paragraph of a post becomes its preview on the posts page, so make it a good one.
