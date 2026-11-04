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
  manifest: ({ browser }) => ({
    name: 'Plain A11y',
    description:
      'Check a page for accessibility problems in plain language: what is wrong, who it affects, how to fix it and who should do it.',
    permissions: ['activeTab', 'scripting', 'storage'],
    // Only the Firefox package carries these. The id is permanent for the AMO listing.
    // data_collection_permissions "none": the extension collects nothing and sends nothing.
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: 'plain-a11y@bereg.dev',
          strict_min_version: '140.0',
          data_collection_permissions: { required: ['none'] },
        },
      },
    }),
  }),
});
