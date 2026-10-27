import type { ViolationItem } from './violations';

/** Popup просит service worker проверить активную вкладку. */
export interface RunCheckRequest {
  type: 'run-check';
}

/** Service worker просит content script запустить axe-core. */
export interface RunAxeRequest {
  type: 'run-axe';
}

export type CheckResponse =
  | { ok: true; items: ViolationItem[] }
  | { ok: false; error: string };
