/// <reference types="chrome" />

import {
  chromium,
  test as base,
  type BrowserContext,
  type Page,
  type Worker,
} from '@playwright/test';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CheckResponse, HighlightResponse } from '../../src/report/messages';
import type { HighlightTarget } from '../../src/report/violations';

const BUILT = join(process.cwd(), '.output', 'chrome-mv3');
const FIXTURES = join(process.cwd(), 'tests', 'fixtures');

interface Manifest {
  host_permissions?: string[];
  [key: string]: unknown;
}

export function readBuiltManifest(): Manifest {
  return JSON.parse(readFileSync(join(BUILT, 'manifest.json'), 'utf8')) as Manifest;
}

/** The permission a driven browser needs to inject the script without a click on the icon. */
export const TEST_HOST_PERMISSIONS = ['<all_urls>'];

interface Worker1 {
  context: BrowserContext;
  worker: Worker;
  extensionId: string;
  /** The manifest of the copy that was loaded. */
  loadedManifest: Manifest;
  baseUrl: string;
  /** Every request address the browser made, in order. */
  requests: string[];
}

function startServer(): Promise<{ server: Server; baseUrl: string }> {
  const server = createServer((request, response) => {
    const name = (request.url ?? '/').split('?')[0]?.replace(/^\/+/, '') ?? '';
    const file = join(FIXTURES, name);
    if (!name.endsWith('.html') || name.includes('..') || !existsSync(file)) {
      response.writeHead(404).end('Not found');
      return;
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(readFileSync(file));
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

/** Pages opened in a test, closed after it. */
export interface Tools {
  baseUrl: string;
  loadedManifest: Manifest;
  requests: string[];
  /** A page of the local fixture server. */
  open(path: string): Promise<Page>;
  /** The popup page of the extension in a tab. */
  popup(): Promise<Page>;
  /** Presses the equivalent of “Check page” for the tab that is in front. */
  check(target: Page, popup: Page): Promise<Extract<CheckResponse, { ok: true }>>;
  highlight(popup: Page, targets: HighlightTarget[]): Promise<Extract<HighlightResponse, { ok: true }>>;
  clearHighlight(popup: Page): Promise<void>;
  /** The badge text and the tooltip of the tab that has this address. */
  badge(url: string): Promise<{ text: string; title: string }>;
  /** The markup of the page, including open shadow roots. Reads nothing in between. */
  markup(page: Page): Promise<string>;
  /** How many elements (also inside open shadow roots) carry an outline. */
  outlined(page: Page): Promise<number>;
}

export const test = base.extend<{ tools: Tools }, { session: Worker1 }>({
  session: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      if (!existsSync(join(BUILT, 'manifest.json'))) {
        throw new Error('The extension is not built. Run "npm run build" first (or use "npm run test:e2e").');
      }
      // The tests load a copy, so the real manifest is never changed.
      const copy = mkdtempSync(join(tmpdir(), 'plain-a11y-ext-'));
      cpSync(BUILT, copy, { recursive: true });
      const loadedManifest: Manifest = { ...readBuiltManifest(), host_permissions: TEST_HOST_PERMISSIONS };
      writeFileSync(join(copy, 'manifest.json'), JSON.stringify(loadedManifest));
      const { server, baseUrl } = await startServer();
      const profile = mkdtempSync(join(tmpdir(), 'plain-a11y-profile-'));
      // Extensions need the new headless mode, which Playwright's own headless setting does not use.
      const context = await chromium.launchPersistentContext(profile, {
        headless: false,
        executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
        args: [
          '--headless=new',
          `--disable-extensions-except=${copy}`,
          `--load-extension=${copy}`,
          '--no-first-run',
        ],
      });
      const requests: string[] = [];
      context.on('request', (request) => requests.push(request.url()));
      const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
      const extensionId = new URL(worker.url()).host;
      await use({ context, worker, extensionId, loadedManifest, baseUrl, requests });
      await context.close();
      server.close();
      rmSync(copy, { recursive: true, force: true });
      rmSync(profile, { recursive: true, force: true });
    },
    { scope: 'worker' },
  ],

  tools: async ({ session }, use) => {
    const pages: Page[] = [];
    const { context, worker, extensionId, baseUrl, requests, loadedManifest } = session;
    requests.length = 0;

    const tools: Tools = {
      baseUrl,
      loadedManifest,
      requests,
      async open(path) {
        const page = await context.newPage();
        pages.push(page);
        await page.goto(`${baseUrl}/${path}`);
        return page;
      },
      async popup() {
        const page = await context.newPage();
        pages.push(page);
        await page.goto(`chrome-extension://${extensionId}/popup.html`);
        return page;
      },
      async check(target, popup) {
        // The service worker checks the tab that is in front.
        await target.bringToFront();
        const response = await popup.evaluate(
          async () => (await chrome.runtime.sendMessage({ type: 'run-check' })) as CheckResponse,
        );
        if (!response.ok) throw new Error(`The check failed: ${response.error}`);
        return response;
      },
      async highlight(popup, targets) {
        const response = await popup.evaluate(
          async (list) => (await chrome.runtime.sendMessage({ type: 'highlight', targets: list })) as HighlightResponse,
          targets,
        );
        if (!response.ok) throw new Error(`The highlight failed: ${response.error}`);
        return response;
      },
      async clearHighlight(popup) {
        await popup.evaluate(async () => {
          await chrome.runtime.sendMessage({ type: 'clear-highlight' });
        });
      },
      async badge(url) {
        return worker.evaluate(async (address) => {
          const tabs = await chrome.tabs.query({});
          const tab = tabs.find((candidate) => candidate.url === address);
          if (tab?.id === undefined) throw new Error(`No tab with the address ${address}`);
          return {
            text: await chrome.action.getBadgeText({ tabId: tab.id }),
            title: await chrome.action.getTitle({ tabId: tab.id }),
          };
        }, url);
      },
      async markup(page) {
        return page.evaluate(() => {
          const parts: string[] = [document.documentElement.outerHTML];
          const visit = (root: ParentNode) => {
            root.querySelectorAll('*').forEach((element) => {
              if (element.shadowRoot) {
                parts.push(element.shadowRoot.innerHTML);
                visit(element.shadowRoot);
              }
            });
          };
          visit(document);
          return parts.join('\n<!-- shadow root -->\n');
        });
      },
      async outlined(page) {
        return page.evaluate(() => {
          let count = 0;
          const visit = (root: ParentNode) => {
            root.querySelectorAll('*').forEach((element) => {
              if ((element.getAttribute('style') ?? '').includes('outline')) count += 1;
              if (element.shadowRoot) visit(element.shadowRoot);
            });
          };
          visit(document);
          return count;
        });
      },
    };

    await use(tools);
    for (const page of pages) await page.close().catch(() => undefined);
  },
});

export { expect } from '@playwright/test';
