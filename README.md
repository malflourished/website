# Memory Timeline

A Blade Runner–inspired interactive memory timeline — dark atmosphere, rain, and neon.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
```

## Production build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the build locally
```

## Deploy

The `dist/` folder is a fully static site. Drop it on any static host:

### GitHub Pages (this repo)

On every push to `main`, [.github/workflows/pages.yml](.github/workflows/pages.yml) runs `npm ci` + `npm run build` and deploys `dist/` via GitHub Actions.

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment**: set **Source** to **GitHub Actions** (not “Deploy from a branch”).
3. Open the **Actions** tab and confirm the workflow succeeds. Your site URL appears in the workflow run and under Pages settings.

`vite.config.js` sets `base` automatically in CI: `/` for a `username.github.io` repo, otherwise `/<repo-name>/` for project sites so assets load on `https://username.github.io/repo-name/`. A **custom domain** at the site root still works with that build.

### Other hosts

- **Netlify**: build `npm run build`, publish `dist`.
- **Cloudflare Pages**: same.

## Project structure

```
index.html              Entry point
src/
  main.js               App bootstrap (imports styles + modules)
  timeline.js           Data-driven timeline + inspector logic
  data/memories.json    Content — add/edit memories here
  scene/memorySkyline.js  Three.js atmospheric backdrop
  styles/
    theme.css           Design tokens, reset, base
    layout.css          Hero + grid layout
    timeline.css        Timeline spine + nodes
    inspector.css       Detail panel
    atmosphere.css      Grain overlay, vignette, ambient glow
```

## Editing content

All memory entries live in `src/data/memories.json`. Each entry:

```json
{
  "id":    "2019-sector",
  "year":  "2019",
  "title": "Sector Seven",
  "body":  "Description text...",
  "tags":  ["place", "night"]
}
```

## Tuning the mood

- **Colors / type**: CSS variables in `src/styles/theme.css`.
- **3D scene**: constants at the top of `src/scene/memorySkyline.js` (rain count, fog distance, drift speed, palettes).
