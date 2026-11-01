import { useEffect, useState } from 'react';
import {
  errorMessage,
  type CheckResponse,
  type GetLastResultRequest,
  type LastResultResponse,
  type RunCheckRequest,
} from '../report/messages';
import type { ViolationItem } from '../report/violations';

export type CheckState =
  | { status: 'idle' }
  | { status: 'loading' }
  | {
      status: 'done';
      items: ViolationItem[];
      review: ViolationItem[];
      aaa: ViolationItem[];
      url: string;
      checkedAt: Date;
      /** The result was kept from an earlier opening of the popup, not just checked. */
      restored?: boolean;
    }
  | { status: 'error'; message: string };

/** Runs the check through the service worker and tracks its state. */
export function useCheck(beforeCheck: () => Promise<void>) {
  const [state, setState] = useState<CheckState>({ status: 'idle' });

  // Shows the result kept for this tab, unless the person has already pressed something.
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const request: GetLastResultRequest = { type: 'get-last-result' };
        const response = (await browser.runtime.sendMessage(
          request,
        )) as LastResultResponse | undefined;
        if (!active || !response?.ok || !response.result) return;
        const { result } = response;
        setState((current) =>
          current.status === 'idle'
            ? {
                status: 'done',
                items: result.items,
                review: result.review,
                aaa: result.aaa,
                url: result.url,
                checkedAt: new Date(result.checkedAt),
                restored: true,
              }
            : current,
        );
      } catch {
        // Nothing kept, or the service worker did not answer: the popup stays empty as before.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function runCheck() {
    // The button uses aria-disabled, so presses during a check must be ignored here.
    if (state.status === 'loading') return;
    setState({ status: 'loading' });
    try {
      await beforeCheck();
      const request: RunCheckRequest = { type: 'run-check' };
      const response = (await browser.runtime.sendMessage(
        request,
      )) as CheckResponse;
      setState(
        response.ok
          ? {
              status: 'done',
              items: response.items,
              review: response.review,
              aaa: response.aaa,
              url: response.url,
              checkedAt: new Date(),
            }
          : { status: 'error', message: response.error },
      );
    } catch (error) {
      setState({ status: 'error', message: errorMessage(error) });
    }
  }

  return { state, runCheck };
}
