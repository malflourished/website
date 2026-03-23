# malflourished — Experience

A Blade Runner–inspired work-experience timeline — dark atmosphere and CRT-style phosphor type.

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

`vite.config.js` uses **`base: './'`** for production builds so asset URLs are **relative**. The same `dist/` works on a **custom domain** (site at `/`) and on **`username.github.io/repo-name/`** without a separate build per host.

### Other hosts

- **Netlify**: build `npm run build`, publish `dist`.
- **Cloudflare Pages**: same.

## Project structure

```
index.html              Entry point
src/
  main.js               App bootstrap (imports styles + modules)
  timeline.js           Data-driven timeline + inspector logic
  data/experience.json  Work experience — one entry per role
  scene/memorySkyline.js  Optional Three.js backdrop (unused on Work page)
  styles/
    theme.css           Design tokens, reset, base
    layout.css          Hero + grid layout
    timeline.css        Timeline spine + nodes
    inspector.css       Detail panel
    atmosphere.css      Grain overlay, vignette, ambient glow
```

## Editing content

Work experience lives in `src/data/experience.json`. Content is **manually synced** from [LinkedIn](https://www.linkedin.com/in/tysonjamesdale/) — update the file when your profile changes. Each entry:

```json
{
  "id":      "acme-senior-engineer",
  "period":  "2021 – 2023",
  "studio":  "Acme Corp · Industry · City, ST",
  "company": "Acme Corp",
  "role":    "Senior Engineer",
  "body":    "Description of the role...",
  "tags":    ["Python", "AWS", "Leadership"]
}
```

`studio` appears on the timeline spine (above the role) and in the detail panel. If omitted, `company` is used instead.

Optional **`image`**: URL string (site-relative like `./photos/role.jpg` or absolute HTTPS). When set, the detail panel shows the image; otherwise a dashed placeholder box appears until you add one.

## Tuning the mood

- **Site accent (orange / amber)**: edit **`--accent`** in `src/styles/theme.css` only. CSS uses `color-mix()` for dim/glow/hover; canvas/WebGL read the same variable via `src/theme/accent.js`.
- **Other colors / type**: remaining variables in `src/styles/theme.css`.
- **Optional 3D backdrop**: `src/scene/memorySkyline.js` (not wired on Work; re-hook from `main.js` if needed).

## Fonts

The site uses **[Departure Mono](https://github.com/rektdeckard/departure-mono)** (v1.500) as the main typeface. Font files live in `src/assets/fonts/`; license: `src/assets/fonts/LICENSE.txt` (SIL Open Font License).
