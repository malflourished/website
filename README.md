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

- **GitHub Pages**: push `dist/` to the `gh-pages` branch, or use the Pages UI to deploy from a folder.
- **Netlify**: connect the repo → set build command to `npm run build`, publish directory to `dist`.
- **Cloudflare Pages**: same as Netlify; build command `npm run build`, output `dist`.

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
