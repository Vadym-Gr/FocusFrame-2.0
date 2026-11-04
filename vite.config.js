import { defineConfig } from 'vite';
import injectHTML from 'vite-plugin-html-inject';
import FullReload from 'vite-plugin-full-reload';
import sortMediaQueries from 'postcss-sort-media-queries';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  css: {
    postcss: {
      plugins: [sortMediaQueries({ sort: 'mobile-first' })],
    },
  },
  plugins: [injectHTML(), FullReload(['src/**/*.html'])],
});
