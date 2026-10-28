import { useEffect, useState } from 'react';
import {
  POPUP_PORT,
  errorMessage,
  type ClearHighlightRequest,
  type HighlightRequest,
  type HighlightResponse,
} from '../report/messages';
import type { ViolationItem } from '../report/violations';

/** Highlights issues on the page. `announce` receives short status messages. */
export function useHighlight(announce: (message: string) => void) {
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // The open port tells the service worker when the popup closes, so it can remove the highlight.
  useEffect(() => {
    const port = browser.runtime.connect({ name: POPUP_PORT });
    return () => port.disconnect();
  }, []);

  async function clear() {
    const request: ClearHighlightRequest = { type: 'clear-highlight' };
    await browser.runtime.sendMessage(request);
    setHighlightedId(null);
  }

  /** `key` tells apart the same rule listed as a problem and as a manual-review item. */
  async function toggle(item: ViolationItem, key: string = item.id) {
    try {
      if (highlightedId === key) {
        await clear();
        announce('Highlight removed.');
        return;
      }
      const request: HighlightRequest = {
        type: 'highlight',
        targets: item.targets,
      };
      const response = (await browser.runtime.sendMessage(
        request,
      )) as HighlightResponse;
      if (!response.ok) {
        setHighlightedId(null);
        announce(`Could not highlight: ${response.error}`);
      } else if (response.found === 0) {
        setHighlightedId(null);
        announce('Element not found on the page.');
      } else {
        setHighlightedId(key);
        announce(`Highlighted elements: ${response.found}.`);
      }
    } catch (error) {
      setHighlightedId(null);
      announce(`Could not highlight: ${errorMessage(error)}`);
    }
  }

  return { highlightedId, toggle, clear };
}
