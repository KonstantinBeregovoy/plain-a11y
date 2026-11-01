import {
  POPUP_PORT,
  errorMessage,
  hasType,
  isHighlightRequest,
  type CheckResponse,
  type ClearHighlightRequest,
  type HighlightRequest,
  type HighlightResponse,
  type LastResultResponse,
  type PingRequest,
  type PingResponse,
  type RunAxeRequest,
} from '../report/messages';
import { browserBadgeApi, clearIssueCount, showIssueCount } from './badge';
import { ensureContentScript } from './inject';
import {
  browserSessionStore,
  forgetResult,
  loadResult,
  saveResult,
} from './lastResult';

/** The tab where the highlight is currently on. */
let highlightedTabId: number | undefined;

async function activeTabId(): Promise<number | undefined> {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  return tab?.id;
}

async function checkActiveTab(): Promise<CheckResponse> {
  try {
    const tabId = await activeTabId();
    if (tabId === undefined) {
      return { ok: false, error: 'Could not find the open tab.' };
    }
    await ensureContentScript(tabId, {
      ping: async (id) => {
        const request: PingRequest = { type: 'ping' };
        const reply = (await browser.tabs.sendMessage(id, request)) as
          | PingResponse
          | undefined;
        return reply?.ok === true;
      },
      inject: async (id) => {
        await browser.scripting.executeScript({
          target: { tabId: id },
          files: ['/content-scripts/content.js'],
        });
      },
    });
    const request: RunAxeRequest = { type: 'run-axe' };
    const response = (await browser.tabs.sendMessage(tabId, request)) as CheckResponse;
    if (response.ok) {
      // The badge and the kept result are conveniences: if they cannot be set, the check still succeeded.
      // Both are dropped when the tab loads a page (see forgetTab).
      await showIssueCount(tabId, response.items.length, browserBadgeApi()).catch(
        () => undefined,
      );
      await saveResult(
        tabId,
        {
          url: response.url,
          checkedAt: Date.now(),
          items: response.items,
          review: response.review,
          aaa: response.aaa,
        },
        browserSessionStore(),
      ).catch(() => undefined);
    }
    return response;
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

async function lastResultOfActiveTab(): Promise<LastResultResponse> {
  try {
    const tabId = await activeTabId();
    if (tabId === undefined) return { ok: true, result: null };
    return { ok: true, result: await loadResult(tabId, browserSessionStore()) };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

/** Drops what a check left on a tab: the kept result and the number on the icon. */
async function forgetTab(tabId: number, clearBadge: boolean): Promise<void> {
  await forgetResult(tabId, browserSessionStore()).catch(() => undefined);
  // The tab may be gone already.
  if (clearBadge) await clearIssueCount(tabId, browserBadgeApi()).catch(() => undefined);
}

async function highlight(request: HighlightRequest): Promise<HighlightResponse> {
  try {
    const tabId = await activeTabId();
    if (tabId === undefined) {
      return { ok: false, error: 'Could not find the open tab.' };
    }
    highlightedTabId = tabId;
    return (await browser.tabs.sendMessage(tabId, request)) as HighlightResponse;
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

async function clearHighlight(): Promise<HighlightResponse> {
  const tabId = highlightedTabId;
  highlightedTabId = undefined;
  if (tabId === undefined) return { ok: true, found: 0 };
  try {
    const request: ClearHighlightRequest = { type: 'clear-highlight' };
    return (await browser.tabs.sendMessage(tabId, request)) as HighlightResponse;
  } catch (error) {
    // The tab may have been closed or reloaded, so there is nothing left to clear.
    return { ok: false, error: errorMessage(error) };
  }
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (hasType(message, 'run-check')) {
      checkActiveTab().then(sendResponse);
      return true;
    }
    if (hasType(message, 'get-last-result')) {
      lastResultOfActiveTab().then(sendResponse);
      return true;
    }
    if (isHighlightRequest(message)) {
      highlight(message).then(sendResponse);
      return true;
    }
    if (hasType(message, 'clear-highlight')) {
      clearHighlight().then(sendResponse);
      return true;
    }
    return false;
  });

  // The tab starts loading a page, also after going back, reloading, or when a single-page site
  // changes the address: the old result no longer describes the page (tests/e2e/lastResult.spec.ts).
  // Loading an iframe later does not fire this. The event also needs no host permission.
  browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === 'loading') void forgetTab(tabId, true);
  });
  browser.tabs.onRemoved.addListener((tabId) => {
    void forgetTab(tabId, false);
  });

  // The port stays alive while the popup is open. Closing the popup drops it.
  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== POPUP_PORT) return;
    port.onDisconnect.addListener(() => {
      void clearHighlight();
    });
  });
});
