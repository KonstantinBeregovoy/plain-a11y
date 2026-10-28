/** What ensureContentScript needs from the browser, so it can be tested without one. */
export interface InjectionApi {
  /** Resolves true if a content script in the tab answers. Rejects if nothing listens. */
  ping(tabId: number): Promise<boolean>;
  inject(tabId: number): Promise<void>;
}

/** Injects the content script only if it is not already running in the tab. */
export async function ensureContentScript(
  tabId: number,
  api: InjectionApi,
): Promise<void> {
  try {
    if (await api.ping(tabId)) return;
  } catch {
    // Nothing is listening in the tab yet.
  }
  await api.inject(tabId);
}
