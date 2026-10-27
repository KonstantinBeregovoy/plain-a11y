import type { ViolationItem } from './violations';

/** Popup просит service worker проверить активную вкладку. */
export interface RunCheckRequest {
  type: 'run-check';
}

/** Service worker просит content script запустить axe-core. */
export interface RunAxeRequest {
  type: 'run-axe';
}

/** Обвести элементы на странице. Новая подсветка заменяет прежнюю. */
export interface HighlightRequest {
  type: 'highlight';
  targets: string[];
}

/** Снять подсветку. */
export interface ClearHighlightRequest {
  type: 'clear-highlight';
}

export type CheckResponse =
  | { ok: true; url: string; items: ViolationItem[] }
  | { ok: false; error: string };

export type HighlightResponse =
  | { ok: true; found: number }
  | { ok: false; error: string };

/** Имя порта, который popup держит открытым, пока он виден. */
export const POPUP_PORT = 'popup';

export function hasType(message: unknown, type: string): boolean {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === type
  );
}

export function isHighlightRequest(
  message: unknown,
): message is HighlightRequest {
  if (!hasType(message, 'highlight')) return false;
  const { targets } = message as { targets?: unknown };
  return (
    Array.isArray(targets) && targets.every((item) => typeof item === 'string')
  );
}
