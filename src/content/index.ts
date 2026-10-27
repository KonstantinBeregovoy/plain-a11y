import axe from 'axe-core';
import type { CheckResponse, RunAxeRequest } from '../report/messages';
import { toViolationItems } from '../report/violations';

declare global {
  interface Window {
    __plainA11yReady?: boolean;
  }
}

function isRunAxeRequest(message: unknown): message is RunAxeRequest {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === 'run-axe'
  );
}

export default defineContentScript({
  registration: 'runtime',
  matches: [],
  main() {
    // Скрипт внедряется при каждой проверке, слушатель нужен один.
    if (window.__plainA11yReady) return;
    window.__plainA11yReady = true;

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (!isRunAxeRequest(message)) return false;
      axe
        .run(document)
        .then((results) => {
          const response: CheckResponse = {
            ok: true,
            items: toViolationItems(results.violations),
          };
          sendResponse(response);
        })
        .catch((error: unknown) => {
          const response: CheckResponse = {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          };
          sendResponse(response);
        });
      return true;
    });
  },
});
