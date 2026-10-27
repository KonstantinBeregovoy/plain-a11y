import type {
  CheckResponse,
  RunAxeRequest,
  RunCheckRequest,
} from '../report/messages';

function isRunCheckRequest(message: unknown): message is RunCheckRequest {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'run-check'
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function checkActiveTab(): Promise<CheckResponse> {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id === undefined) {
      return { ok: false, error: 'Не удалось найти открытую вкладку.' };
    }
    await browser.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['/content-scripts/content.js'],
    });
    const request: RunAxeRequest = { type: 'run-axe' };
    return (await browser.tabs.sendMessage(tab.id, request)) as CheckResponse;
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isRunCheckRequest(message)) return false;
    checkActiveTab().then(sendResponse);
    return true;
  });
});
