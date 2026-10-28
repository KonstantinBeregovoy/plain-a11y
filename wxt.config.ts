import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  publicDir: 'src/public',
  entrypointsDir: '.',
  modules: ['@wxt-dev/module-react'],
  filterEntrypoints: ['popup', 'background', 'content'],
  vite: () => ({
    // Полифил предзагрузки модулей делает fetch, а сетевых запросов в пакете быть не должно.
    build: { modulePreload: { polyfill: false } },
  }),
  manifest: {
    name: 'Plain A11y',
    description: 'Проверка доступности страницы простым языком',
    permissions: ['activeTab', 'scripting', 'storage'],
  },
});
