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
  // jsdom has no layout, so contrast is checked in a real browser
  // (docs/a11y-checklist.md). Here we check structure and labels.
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

describe('axe on the popup UI', () => {
  it('empty state', async () => {
    await mount();
    expect(container.textContent).toContain('Check page');
    expect(await violationsOf()).toEqual([]);
  });

  it('loading state', async () => {
    respond = () => new Promise(() => undefined);
    await mount();
    await clickByName('Check page');
    expect(container.textContent).toContain('Checking');
    expect(await violationsOf()).toEqual([]);
  });

  it('result with all groups and a highlight', async () => {
    await mount();
    await clickByName('Check page');
    expect(container.querySelectorAll('li').length).toBe(ITEMS.length);
    expect(await violationsOf()).toEqual([]);

    await clickByName('Show on page');
    expect(container.querySelector('[aria-pressed="true"]')).not.toBeNull();
    expect(await violationsOf()).toEqual([]);
  });

  it('result without issues', async () => {
    respond = async () => ({ ok: true, url: 'https://example.com/', items: [] });
    await mount();
    await clickByName('Check page');
    expect(container.textContent).toContain('No issues found.');
    expect(await violationsOf()).toEqual([]);
  });

  it('error state', async () => {
    respond = async () => ({ ok: false, error: 'Could not find the open tab.' });
    await mount();
    await clickByName('Check page');
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'Could not check the page',
    );
    expect(await violationsOf()).toEqual([]);
  });

  it('keeps focus on the check button while the check is running', async () => {
    let calls = 0;
    respond = () => {
      calls += 1;
      return new Promise(() => undefined);
    };
    await mount();
    const button = container.querySelector('button');
    button?.focus();
    await clickByName('Check page');
    expect(document.activeElement).toBe(button);
    expect(button?.getAttribute('aria-disabled')).toBe('true');
    expect(button?.disabled).toBe(false);

    // Pressing again during the check does not start a second check.
    await clickByName('Check page');
    expect(calls).toBe(1);
  });
});
