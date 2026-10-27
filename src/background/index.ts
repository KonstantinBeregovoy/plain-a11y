import {
  POPUP_PORT,
  hasType,
  isHighlightRequest,
  type CheckResponse,
  type ClearHighlightRequest,
  type HighlightRequest,
  type HighlightResponse,
  type RunAxeRequest,
} from '../report/messages';

/** Вкладка, на которой сейчас включена подсветка. */
let highlightedTabId: number | undefined;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

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
      return { ok: false, error: 'Не удалось найти открытую вкладку.' };
    }
    await browser.scripting.executeScript({
      target: { tabId },
      files: ['/content-scripts/content.js'],
    });
    const request: RunAxeRequest = { type: 'run-axe' };
    return (await browser.tabs.sendMessage(tabId, request)) as CheckResponse;
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

async function highlight(request: HighlightRequest): Promise<HighlightResponse> {
  try {
    const tabId = await activeTabId();
    if (tabId === undefined) {
      return { ok: false, error: 'Не удалось найти открытую вкладку.' };
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
    // Вкладку могли закрыть или перезагрузить, подсвечивать там уже нечего.
    return { ok: false, error: errorMessage(error) };
  }
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (hasType(message, 'run-check')) {
      checkActiveTab().then(sendResponse);
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

  // Пока popup открыт, порт жив. Закрытие popup разрывает порт.
  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== POPUP_PORT) return;
    port.onDisconnect.addListener(() => {
      void clearHighlight();
    });
  });
});
