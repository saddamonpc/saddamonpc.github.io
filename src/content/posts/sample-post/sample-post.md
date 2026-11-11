---
title: 'Sample post: everything this site can render'
date: 2026-11-02
draft: true # never published: shows only in `npm run dev` and in the tests
tags: [Guitar, practice, 3D]
cover: ./cover.jpg
---

<!-- SAMPLE: shows (and tests) every feature. It is a draft, so it never appears on the real site. Keep it: the tests use it. -->

This is a sample post. It shows everything a post on this site can contain, so you can copy whichever part you need when you write a real one. The first paragraph also becomes the short preview on the posts page, which is why it is long enough to be cut off with an ellipsis after two lines of text. Everything below is written in the same Markdown that Obsidian understands.

## Writing basics

Text can be **bold**, _italic_, or ==highlighted==. Inline code looks like `npm run dev`. Links go to other pages, like [the posts page](/posts/), or to other notes with Obsidian links: [[sample-project]] or [[sample-project|the sample project, with my own text]]. A link to a note that doesn't exist yet, like [[does-not-exist]], shows as plain text instead of a broken link. %%This hidden comment never shows on the site (but the repo is public, so it is readable on GitHub).%%

> A blockquote looks like this. Use it for quotes.

### Lists and tables

- [x] Lower the action at the nut
- [x] Roll the index finger toward the headstock
- [ ] Hold the shape for 30 seconds, three times a day

| Week | Clean strings | Note              |
| ---- | ------------- | ----------------- |
| 1    | 3 / 6         | G and B dead      |
| 2    | 5 / 6         | Only the B buzzes |

## Callouts

> [!tip]
> Put the thumb behind the neck, roughly behind the middle finger.

> [!warning]
> If your wrist hurts, stop.

> [!info]
> Obsidian's other callout types work too, and use the closest of the three styles.

> [!banana]
> Unknown types fall back to the note style.

> [!note]- Click to open
> Foldable callouts start closed.

## Code

```python
def log(chord, clean, total=6):
    print(f"{chord}: {clean}/{total} strings clean")
```

## Pictures

![A placeholder photo](./photo-1.jpg 'Standard Markdown caption')

![[photo-2.jpg]]

![[photo-3.jpg|An Obsidian caption]]

![[Pasted image 20261110161851.jpg]]

![[photo-4.jpg]]

![[photo-5.jpg]]

![[photo-6.jpg]]

![[IMG_0001.JPG]]

## Audio and video

![[sample-take.WAV|Sample take · recorded 2026-11-02]]

![](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

That's everything.[^1]

[^1]: Footnotes look like this.
