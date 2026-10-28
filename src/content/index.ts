import axe from 'axe-core';
import {
  hasType,
  isHighlightRequest,
  type CheckResponse,
  type HighlightResponse,
} from '../report/messages';
import { toViolationItems } from '../report/violations';
import { createHighlighter } from './highlight';

declare global {
  interface Window {
    __plainA11yReady?: boolean;
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default defineContentScript({
  registration: 'runtime',
  matches: [],
  main() {
    // The script is injected on every check, but one listener is enough.
    if (window.__plainA11yReady) return;
    window.__plainA11yReady = true;

    const highlighter = createHighlighter(document);

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (hasType(message, 'run-axe')) {
        // preload: false stops axe from downloading the page's styles and media.
        axe
          .run(document, { preload: false })
          .then((results) => {
            const response: CheckResponse = {
              ok: true,
              url: location.href,
              items: toViolationItems(results.violations),
            };
            sendResponse(response);
          })
          .catch((error: unknown) => {
            const response: CheckResponse = {
              ok: false,
              error: errorMessage(error),
            };
            sendResponse(response);
          });
        return true;
      }
      if (isHighlightRequest(message)) {
        const response: HighlightResponse = {
          ok: true,
          found: highlighter.show(message.targets),
        };
        sendResponse(response);
        return false;
      }
      if (hasType(message, 'clear-highlight')) {
        highlighter.clear();
        const response: HighlightResponse = { ok: true, found: 0 };
        sendResponse(response);
        return false;
      }
      return false;
    });
  },
});
