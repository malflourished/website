import { defineConfig } from 'vite';

/**
 * Production uses relative URLs (`./assets/...`) so the same build works on:
 * - Custom domain at site root (e.g. malflourished.com)
 * - Project Pages URL (e.g. malflourished.github.io/website/)
 * A fixed `/website/` base breaks the former because assets 404 at /website/... on the apex domain.
 */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? './' : '/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
}));
