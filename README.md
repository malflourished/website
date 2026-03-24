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
  data/blog-posts.json Blog posts (see README → Blog)
  blog.js               Blog list + hash-routed post view
  scene/memorySkyline.js  Optional Three.js backdrop (unused on Work page)
  styles/
    theme.css           Design tokens, reset, base
    layout.css          Hero + grid layout
    timeline.css        Timeline spine + nodes
    inspector.css       Detail panel
    atmosphere.css      Grain overlay, vignette, ambient glow
```

## About page photo

Portrait lives at **`public/photos/about.png`** (see `about.html` to change). `public/photos/README.txt` has a short note.

## Editing content

Work experience lives in `src/data/experience.json`. Content is **manually synced** from [LinkedIn](https://www.linkedin.com/in/tysonjamesdale/) — update the file when your profile changes. Each entry:

```json
{
  "id":         "acme-senior-engineer",
  "period":     "2021 – 2023",
  "company":    "Acme Corp",
  "production": "Show or campaign name (omit or leave off if not applicable)",
  "location":   "City, ST",
  "role":       "Senior Engineer",
  "body":       "Description of the role...",
  "tags":       ["Python", "AWS", "Leadership"]
}
```

**Timeline** lists period, company, optional production, then role. **Detail panel** order: hero media, period, company, production (if set), location, role, description, five image placeholders, tags.

- **`production`** (optional): show, film, campaign, or season title. Omitted when there is no single production name (e.g. some staff roles).
- **`vimeo` / `vimeoTitle`** (optional): numeric Vimeo video id and iframe title for the hero.
- **`video`** (optional): direct file URL (e.g. `.mp4`, `.webm`). Renders a **16:9** player above the copy.
- **`videoPoster`** (optional): poster image URL for the `<video>` element.
- **`image`** (optional): if there is no Vimeo or file `video`, a still is shown in the same hero frame (**object-fit: cover**).
- If none of the above are set, a **placeholder** block appears until you add media.

## Blog

Posts live in **`src/data/blog-posts.json`**. Each entry:

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | URL fragment, e.g. `welcome` → `blog.html#welcome` (keep unique) |
| `title` | yes | Headline |
| `date` | yes | `YYYY-MM-DD` (used for display and sort) |
| `excerpt` | no | Shown on the index list |
| `body` | yes | Plain text; separate paragraphs with a blank line (`\n\n`) |

The Blog page (`blog.html`) loads **`src/blog.js`**, which lists posts newest-first and shows the full body when the hash matches a post id. No separate HTML per post.

## Tuning the mood

- **Phosphor bloom**: base blur/add amounts and **media vs UI** strength live in `src/globalPhosphor.js` (`BLOOM_*`, `MEDIA_BLOOM_FACTOR`). UI uses class `phosphor-bloom--full`; images/video/hero use `phosphor-bloom--media` (~10% of text bloom by default).
- **Site accent (orange / amber)**: edit **`--accent`** in `src/styles/theme.css` only. CSS uses `color-mix()` for dim/glow/hover; canvas/WebGL read the same variable via `src/theme/accent.js`.
- **Other colors / type**: remaining variables in `src/styles/theme.css`.
- **Optional 3D backdrop**: `src/scene/memorySkyline.js` (not wired on Work; re-hook from `main.js` if needed).

## Fonts

The site uses **[Departure Mono](https://github.com/rektdeckard/departure-mono)** (v1.500) as the main typeface. Font files live in `src/assets/fonts/`; license: `src/assets/fonts/LICENSE.txt` (SIL Open Font License).
