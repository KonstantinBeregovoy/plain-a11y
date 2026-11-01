import type { StoredCheck } from '../report/messages';

/** What the last-result store needs from the browser, so it can be tested without one. */
export interface SessionStore {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

/** One key per tab. */
export function resultKey(tabId: number): string {
  return `result:${tabId}`;
}

function isStoredCheck(value: unknown): value is StoredCheck {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.url === 'string' &&
    typeof candidate.checkedAt === 'number' &&
    Array.isArray(candidate.items) &&
    Array.isArray(candidate.review) &&
    Array.isArray(candidate.aaa)
  );
}

export async function saveResult(
  tabId: number,
  result: StoredCheck,
  store: SessionStore,
): Promise<void> {
  await store.set(resultKey(tabId), result);
}

/** The result kept for the tab, or null when there is none or the stored value is damaged. */
export async function loadResult(
  tabId: number,
  store: SessionStore,
): Promise<StoredCheck | null> {
  const value = await store.get(resultKey(tabId));
  return isStoredCheck(value) ? value : null;
}

export async function forgetResult(tabId: number, store: SessionStore): Promise<void> {
  await store.remove(resultKey(tabId));
}

/**
 * `storage.session` is kept in the memory of the browser and is emptied when the
 * browser closes. It is not readable from content scripts by default.
 */
export function browserSessionStore(): SessionStore {
  return {
    get: async (key) => (await browser.storage.session.get(key))[key],
    set: (key, value) => browser.storage.session.set({ [key]: value }),
    remove: (key) => browser.storage.session.remove(key),
  };
}
