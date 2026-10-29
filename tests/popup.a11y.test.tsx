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

const REVIEW: ViolationItem[] = [
  { id: 'color-contrast', help: 'h', impact: 'unknown', nodeCount: 2, targets: ['p'] },
  { id: 'image-alt', help: 'h', impact: 'unknown', nodeCount: 1, targets: ['img'] },
  { id: 'video-caption', help: 'h', impact: 'unknown', nodeCount: 1, targets: ['video'] },
];

const AAA_ITEMS: ViolationItem[] = [
  { id: 'color-contrast-enhanced', help: 'h', impact: 'minor', nodeCount: 2, targets: ['p'] },
  { id: 'meta-refresh-no-exceptions', help: 'h', impact: 'minor', nodeCount: 1, targets: [] },
];

/** Stands in for chrome.storage.local, reset before every test. */
let store: Record<string, unknown> = {};

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
        get: async (key: string) => (key in store ? { [key]: store[key] } : {}),
        set: async (items: Record<string, unknown>) => {
          Object.assign(store, items);
        },
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
  store = {};
  stubBrowser();
  document.documentElement.lang = 'ru';
  document.title = 'Plain A11y';
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  respond = async () => ({
    ok: true,
    url: 'https://example.com/',
    items: ITEMS,
    review: [],
    aaa: [],
  });
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

  it('shows the AA logo as a decorative image next to the title', async () => {
    await mount();
    const heading = container.querySelector('h1');
    expect(heading?.textContent).toBe('Plain A11y');
    const logo = heading?.querySelector('img');
    expect(logo?.getAttribute('src')).toBe('/icon/48.png');
    expect(logo?.getAttribute('alt')).toBe('');
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
    respond = async () => ({
      ok: true,
      url: 'https://example.com/',
      items: [],
      review: [],
      aaa: [],
    });
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

  it('result with issues and a manual review section', async () => {
    respond = async () => ({
      ok: true,
      url: 'https://example.com/',
      items: ITEMS,
      review: REVIEW,
      aaa: [],
    });
    await mount();
    await clickByName('Check page');
    expect(container.textContent).toContain('Issues found: 5');
    expect(container.textContent).toContain('Needs manual review: 3');
    expect(container.querySelector('#review-heading')?.textContent).toBe(
      'Needs manual review: 3',
    );
    expect(await violationsOf()).toEqual([]);
  });

  it('no issues but items to review', async () => {
    respond = async () => ({
      ok: true,
      url: 'https://example.com/',
      items: [],
      review: REVIEW,
      aaa: [],
    });
    await mount();
    await clickByName('Check page');
    expect(container.textContent).toContain('No issues found.');
    expect(container.textContent).toContain('Needs manual review: 3');
    expect(container.querySelector('fieldset')).not.toBeNull();
    expect(await violationsOf()).toEqual([]);
  });

  it('highlights the review copy of a rule without pressing the issue copy', async () => {
    respond = async () => ({
      ok: true,
      url: 'https://example.com/',
      items: ITEMS,
      review: REVIEW,
      aaa: [],
    });
    await mount();
    await clickByName('Check page');
    const buttons = [
      ...container.querySelectorAll<HTMLButtonElement>(
        'button[aria-label="Show on page: Image has no text description"]',
      ),
    ];
    expect(buttons).toHaveLength(2); // one among the issues, one among the review items
    const reviewButton = buttons[1];
    expect(reviewButton?.closest('section')?.getAttribute('aria-labelledby')).toBe(
      'review-heading',
    );
    expect(buttons[0]?.closest('section')?.getAttribute('aria-labelledby')).not.toBe(
      'review-heading',
    );
    await act(async () => {
      reviewButton?.click();
    });
    expect(buttons[0]?.getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1]?.getAttribute('aria-pressed')).toBe('true');
    expect(await violationsOf()).toEqual([]);
  });

  it('keeps the role filter working for the review section', async () => {
    respond = async () => ({
      ok: true,
      url: 'https://example.com/',
      items: ITEMS,
      review: REVIEW,
      aaa: [],
    });
    await mount();
    await clickByName('Check page');
    const design = container.querySelector<HTMLInputElement>('input[value="design"]');
    await act(async () => {
      design?.click();
    });
    expect(container.querySelector('#review-heading')?.textContent).toBe(
      'Needs manual review: 1',
    );
  });

  it('result with an AAA recommendations block at the bottom', async () => {
    respond = async () => ({
      ok: true,
      url: 'https://example.com/',
      items: ITEMS,
      review: REVIEW,
      aaa: AAA_ITEMS,
    });
    await mount();
    await clickByName('Check page');
    expect(container.textContent).toContain('Issues found: 5');
    expect(container.querySelector('#aaa-heading')?.textContent).toBe(
      'AAA recommendations: 2',
    );
    const sections = [...container.querySelectorAll('section')];
    expect(sections.at(-1)?.getAttribute('aria-labelledby')).toBe('aaa-heading');
    expect(container.textContent).toContain('not counted as issues');
    expect(await violationsOf()).toEqual([]);
  });

  it('hides the AAA block with a button that keeps focus and offers to show it again', async () => {
    respond = async () => ({
      ok: true,
      url: 'https://example.com/',
      items: ITEMS,
      review: [],
      aaa: AAA_ITEMS,
    });
    await mount();
    await clickByName('Check page');
    const button = [...container.querySelectorAll('button')].find(
      (candidate) => candidate.textContent === 'Hide AAA recommendations',
    );
    expect(button).toBeDefined();
    button?.focus();
    await act(async () => {
      button?.click();
    });
    expect(button?.textContent).toBe('Show AAA recommendations (2)');
    expect(document.activeElement).toBe(button);
    expect(container.querySelector('#aaa-heading')?.closest('section')?.querySelector('ul')).toBeNull();
    expect(container.textContent).toContain('Hidden.');
    expect(container.textContent).toContain('AAA recommendations hidden.');
    expect(await violationsOf()).toEqual([]);

    await act(async () => {
      button?.click();
    });
    expect(button?.textContent).toBe('Hide AAA recommendations');
    expect(container.querySelector('#aaa-heading')?.closest('section')?.querySelector('ul')).not.toBeNull();
    expect(await violationsOf()).toEqual([]);
  });

  it('remembers that the AAA block was hidden when the popup is opened again', async () => {
    respond = async () => ({
      ok: true,
      url: 'https://example.com/',
      items: ITEMS,
      review: [],
      aaa: AAA_ITEMS,
    });
    await mount();
    await clickByName('Check page');
    await clickByName('Hide AAA recommendations');
    expect(store.showAaa).toBe(false);

    await act(async () => root.unmount());
    root = createRoot(container);
    await mount();
    await clickByName('Check page');
    expect(
      [...container.querySelectorAll('button')].some(
        (candidate) => candidate.textContent === 'Show AAA recommendations (2)',
      ),
    ).toBe(true);
  });

  it('shows only AAA recommendations when there are no issues, and the filter still applies', async () => {
    respond = async () => ({
      ok: true,
      url: 'https://example.com/',
      items: [],
      review: [],
      aaa: AAA_ITEMS,
    });
    await mount();
    await clickByName('Check page');
    expect(container.textContent).toContain('No issues found.');
    expect(container.querySelector('#aaa-heading')?.textContent).toBe(
      'AAA recommendations: 2',
    );
    const design = container.querySelector<HTMLInputElement>('input[value="design"]');
    await act(async () => {
      design?.click();
    });
    expect(container.querySelector('#aaa-heading')?.textContent).toBe(
      'AAA recommendations: 1',
    );
    expect(await violationsOf()).toEqual([]);
  });

  it('shows no AAA block when axe found no AAA problems', async () => {
    await mount();
    await clickByName('Check page');
    expect(container.querySelector('#aaa-heading')).toBeNull();
  });

  it('explains in text why an issue inside a frame cannot be shown on the page', async () => {
    await mount();
    await clickByName('Check page');
    const button = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Show on page: Headings skip levels"]',
    );
    expect(button?.disabled).toBe(true);
    const describedBy = button?.getAttribute('aria-describedby') ?? '';
    expect(describedBy).not.toBe('');
    expect(document.getElementById(describedBy)?.textContent).toContain(
      'the elements are inside an embedded frame',
    );
    // Issues that can be highlighted have no such note.
    const enabled = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Show on page: Image has no text description"]',
    );
    expect(enabled?.disabled).toBe(false);
    expect(enabled?.hasAttribute('aria-describedby')).toBe(false);
    expect(await violationsOf()).toEqual([]);
  });

  it('sends shadow DOM paths to the page when the button is pressed', async () => {
    const sent: unknown[] = [];
    vi.stubGlobal('browser', {
      runtime: {
        connect: () => ({ disconnect: () => undefined }),
        sendMessage: async (message: { type: string; targets?: unknown }) => {
          if (message.type === 'run-check') {
            return {
              ok: true,
              url: 'https://example.com/',
              items: [
                {
                  id: 'image-alt',
                  help: 'h',
                  impact: 'critical',
                  nodeCount: 1,
                  targets: [['#host', 'img']],
                },
              ],
              review: [],
              aaa: [],
            };
          }
          if (message.type === 'highlight') {
            sent.push(message.targets);
            return { ok: true, found: 1 };
          }
          return { ok: true, found: 0 };
        },
      },
      storage: { local: { get: async () => ({}), set: async () => undefined } },
    });
    await mount();
    await clickByName('Check page');
    const button = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Show on page: Image has no text description"]',
    );
    expect(button?.disabled).toBe(false);
    await act(async () => {
      button?.click();
    });
    expect(sent).toEqual([[['#host', 'img']]]);
    expect(button?.getAttribute('aria-pressed')).toBe('true');
  });
});
