import { defineConfig } from 'vite';

/** Base path for GitHub Pages project sites (username.github.io/repo/). */
function githubPagesBase() {
  if (process.env.GITHUB_ACTIONS !== 'true') return '/';
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  if (!repo || /\.github\.io$/i.test(repo)) return '/';
  return `/${repo}/`;
}

export default defineConfig({
  base: githubPagesBase(),
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
