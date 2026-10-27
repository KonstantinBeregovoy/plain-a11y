import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  entrypointsDir: '.',
  modules: ['@wxt-dev/module-react'],
  filterEntrypoints: ['popup', 'background', 'content'],
  manifest: {
    name: 'Plain A11y',
    description: 'Проверка доступности страницы простым языком',
    permissions: ['activeTab', 'scripting', 'storage'],
  },
});
