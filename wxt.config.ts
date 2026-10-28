import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  publicDir: 'src/public',
  entrypointsDir: '.',
  modules: ['@wxt-dev/module-react'],
  filterEntrypoints: ['popup', 'background', 'content'],
  vite: () => ({
    // The module preload polyfill uses fetch, and the package must make no network requests.
    build: { modulePreload: { polyfill: false } },
  }),
  manifest: {
    name: 'Plain A11y',
    description: 'Check a page for accessibility problems and get plain-language explanations.',
    permissions: ['activeTab', 'scripting', 'storage'],
  },
});
