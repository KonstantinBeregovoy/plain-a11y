import { useState } from 'react';
import {
  errorMessage,
  type CheckResponse,
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
      url: string;
      checkedAt: Date;
    }
  | { status: 'error'; message: string };

/** Runs the check through the service worker and tracks its state. */
export function useCheck(beforeCheck: () => Promise<void>) {
  const [state, setState] = useState<CheckState>({ status: 'idle' });

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
