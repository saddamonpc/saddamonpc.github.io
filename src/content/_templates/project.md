---
title: '{{title}}'
date: {{date:YYYY-MM-DD}}
updated: {{date:YYYY-MM-DD}}
tags:
  - example
cover:
draft: true
category: 3D
tools:
  - Blender
timeframe: Sep – Oct 2026
---
%%
REQUIRED: title, date. Everything else is optional: delete it or leave it empty.
- title: anything, symbols and Japanese included. The folder name is the page address, not the title.
- date: when you made it. Shown as "Created on …".
- updated: change it when you edit the project later. While it's the same day as date, nothing extra is shown.
- tags: one per line, e.g. blender. They become the tag buttons on the projects page.
- cover: a header picture in this folder, e.g. ./cover.jpg. Also the project's picture on the projects page. Empty here because a picture that doesn't exist stops the site from building.
- draft: ticked (true) while writing; it then only shows in `npm run dev`. Untick or delete it to publish.
- category, tools, timeframe: shown in a strip under the title. tools: one per line.
This note never shows on the site (but the repo is public); delete it whenever you like.
%%

The first paragraph becomes the preview, so make it a good one.
