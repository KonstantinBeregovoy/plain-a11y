import type { ViolationItem } from './violations';

/** The popup asks the service worker to check the active tab. */
export interface RunCheckRequest {
  type: 'run-check';
}

/** The service worker asks the content script to run axe-core. */
export interface RunAxeRequest {
  type: 'run-axe';
}

/** The service worker asks the content script whether it is already injected. */
export interface PingRequest {
  type: 'ping';
}

/** Outline elements on the page. A new highlight replaces the previous one. */
export interface HighlightRequest {
  type: 'highlight';
  targets: string[];
}

/** Remove the highlight. */
export interface ClearHighlightRequest {
  type: 'clear-highlight';
}

export interface PingResponse {
  ok: true;
}

export type CheckResponse =
  | { ok: true; url: string; items: ViolationItem[] }
  | { ok: false; error: string };

export type HighlightResponse =
  | { ok: true; found: number }
  | { ok: false; error: string };

/** Name of the port the popup keeps open while it is visible. */
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

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
