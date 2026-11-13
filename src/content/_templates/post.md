---
title: '{{title}}'
date: {{date:YYYY-MM-DD}}
updated: {{date:YYYY-MM-DD}}
tags:
  - example
cover:
draft: true
---
%%
REQUIRED: title, date. Everything else is optional: delete it or leave it empty.
- title: anything, symbols and Japanese included. The folder name is the page address, not the title.
- date: when you wrote it. Shown as "Created on …".
- updated: change it when you edit the post later. While it's the same day as date, nothing extra is shown.
- tags: one per line, e.g. guitar. They become the tag buttons on the posts page.
- cover: a header picture in this folder, e.g. ./cover.jpg. Empty here because a picture that doesn't exist stops the site from building.
- draft: ticked (true) while writing; it then only shows in `npm run dev`. Untick or delete it to publish.
This note never shows on the site (but the repo is public); delete it whenever you like.
%%

The first paragraph becomes the preview on the posts page, so make it a good one.
