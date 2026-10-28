// @vitest-environment jsdom
import axe from 'axe-core';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/popup/App';
import type { CheckResponse } from '../src/report/messages';
import type { ViolationItem } from '../src/report/violations';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const ITEMS: ViolationItem[] = [
  { id: 'image-alt', help: 'h', impact: 'critical', nodeCount: 2, targets: ['img'] },
  { id: 'color-contrast', help: 'h', impact: 'serious', nodeCount: 1, targets: ['p'] },
  { id: 'label', help: 'h', impact: 'critical', nodeCount: 1, targets: ['input'] },
  { id: 'heading-order', help: 'h', impact: 'moderate', nodeCount: 1, targets: [] },
  { id: 'brand-new-rule', help: 'Some new rule', impact: 'minor', nodeCount: 1, targets: ['a'] },
];

let container: HTMLDivElement;
let root: Root;
let respond: () => Promise<CheckResponse>;

function stubBrowser() {
  vi.stubGlobal('browser', {
    runtime: {
      connect: () => ({ disconnect: () => undefined }),
      sendMessage: async (message: { type: string }) => {
        if (message.type === 'run-check') return respond();
        if (message.type === 'highlight') return { ok: true, found: 1 };
        return { ok: true, found: 0 };
      },
    },
    storage: {
      local: {
        get: async () => ({}),
        set: async () => undefined,
      },
    },
  });
}

async function mount() {
  await act(async () => {
    root.render(<App />);
  });
}

async function clickByName(name: string) {
  const button = [...container.querySelectorAll('button')].find(
    (candidate) => candidate.textContent === name,
  );
  expect(button, name).toBeDefined();
  await act(async () => {
    button?.click();
  });
}

async function violationsOf(): Promise<string[]> {
  // В jsdom нет раскладки, поэтому контраст проверяется в настоящем браузере
  // (docs/a11y-checklist.md). Здесь проверяем структуру и подписи.
  const results = await axe.run(document, {
    runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.nodes.map((node) => node.html).join(' | ')}`,
  );
}

beforeEach(() => {
  stubBrowser();
  document.documentElement.lang = 'ru';
  document.title = 'Plain A11y';
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  respond = async () => ({ ok: true, url: 'https://example.com/', items: ITEMS });
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe('axe на интерфейсе popup', () => {
  it('пустое состояние', async () => {
    await mount();
    expect(container.textContent).toContain('Проверить страницу');
    expect(await violationsOf()).toEqual([]);
  });

  it('состояние загрузки', async () => {
    respond = () => new Promise(() => undefined);
    await mount();
    await clickByName('Проверить страницу');
    expect(container.textContent).toContain('Проверяем');
    expect(await violationsOf()).toEqual([]);
  });

  it('результат со всеми группами и подсветкой', async () => {
    await mount();
    await clickByName('Проверить страницу');
    expect(container.querySelectorAll('li').length).toBe(ITEMS.length);
    expect(await violationsOf()).toEqual([]);

    await clickByName('Показать на странице');
    expect(container.querySelector('[aria-pressed="true"]')).not.toBeNull();
    expect(await violationsOf()).toEqual([]);
  });

  it('результат без нарушений', async () => {
    respond = async () => ({ ok: true, url: 'https://example.com/', items: [] });
    await mount();
    await clickByName('Проверить страницу');
    expect(container.textContent).toContain('Нарушений не найдено.');
    expect(await violationsOf()).toEqual([]);
  });

  it('состояние ошибки', async () => {
    respond = async () => ({ ok: false, error: 'Не удалось найти открытую вкладку.' });
    await mount();
    await clickByName('Проверить страницу');
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'Не удалось проверить страницу',
    );
    expect(await violationsOf()).toEqual([]);
  });

  it('фокус остаётся на кнопке проверки, пока идёт проверка', async () => {
    let calls = 0;
    respond = () => {
      calls += 1;
      return new Promise(() => undefined);
    };
    await mount();
    const button = container.querySelector('button');
    button?.focus();
    await clickByName('Проверить страницу');
    expect(document.activeElement).toBe(button);
    expect(button?.getAttribute('aria-disabled')).toBe('true');
    expect(button?.disabled).toBe(false);

    // Повторное нажатие во время проверки не запускает вторую проверку.
    await clickByName('Проверить страницу');
    expect(calls).toBe(1);
  });
});
