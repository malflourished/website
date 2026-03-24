---
id: welcome
title: Hello, world
date: '2026-03-23'
excerpt: A tiny placeholder post while the blog takes shape.
---

This is a static blog powered by Markdown in `content/blog/` and a small build script. Each file has YAML frontmatter (`title`, `date`, optional `id`, `excerpt`) and a Markdown body.

Point Obsidian at this folder via a symlink into the repo (see project notes), then run `npm run build` (or `npm run dev`) to regenerate `src/data/blog-posts.json`.
