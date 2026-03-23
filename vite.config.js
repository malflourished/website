import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

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
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        landing: resolve(__dirname, 'landing.html'),
        reel: resolve(__dirname, 'reel.html'),
        interactive: resolve(__dirname, 'interactive.html'),
        blog: resolve(__dirname, 'blog.html'),
        about: resolve(__dirname, 'about.html'),
        testMalf: resolve(__dirname, 'test-malf.html'),
      },
    },
  },
}));
