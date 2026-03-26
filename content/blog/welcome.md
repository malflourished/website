---
id: welcome
title: Hello, world
date: '2026-03-23'
excerpt: A tiny placeholder post while the blog takes shape.
---

This is a static blog powered by Markdown in `content/blog/` and a small build script. Each file has YAML frontmatter (`title`, `date`, optional `id`, `excerpt`) and a Markdown body.

**Obsidian:** In your vault, make `05_LOG/web blog` a **symlink pointing at** this repo’s `content/blog` folder (files must live in git for the site build). Run `npm run build` or `npm run dev` to regenerate `src/data/blog-posts.json`. Use `draft: true` in frontmatter to keep a note out of the public list.
