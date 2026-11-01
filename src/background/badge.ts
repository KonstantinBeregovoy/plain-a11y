/** The color pair of the badge. White on this red has a contrast of 7.8:1. */
export const BADGE_BACKGROUND = '#a01d17';
export const BADGE_TEXT_COLOR = '#ffffff';
/** The tooltip of the icon when there is no count to show (the name of the extension). */
export const DEFAULT_TITLE = 'Plain A11y';

const MAX_SHOWN = 99;

/** What the badge needs from the browser, so it can be tested without one. */
export interface BadgeApi {
  setText(tabId: number, text: string): Promise<void>;
  setColors(tabId: number, background: string, text: string): Promise<void>;
  setTitle(tabId: number, title: string): Promise<void>;
}

/**
 * The text on the icon. Nothing for zero issues: a "0" or a mark could be read as
 * "this page passed", and an automated check cannot say that.
 */
export function badgeText(count: number): string {
  if (count <= 0) return '';
  return count > MAX_SHOWN ? `${MAX_SHOWN}+` : String(count);
}

/** The same information in words, for the tooltip. */
export function badgeTitle(count: number): string {
  if (count <= 0) return DEFAULT_TITLE;
  const noun = count === 1 ? 'issue' : 'issues';
  return `${DEFAULT_TITLE}: ${count} ${noun} found in the last check`;
}

/** Shows the number of issues on the icon, for one tab only. */
export async function showIssueCount(
  tabId: number,
  count: number,
  api: BadgeApi,
): Promise<void> {
  await api.setColors(tabId, BADGE_BACKGROUND, BADGE_TEXT_COLOR);
  await api.setText(tabId, badgeText(count));
  await api.setTitle(tabId, badgeTitle(count));
}

/** Removes the count of one tab, for example when the tab loads another page. */
export async function clearBadge(tabId: number, api: BadgeApi): Promise<void> {
  await api.setText(tabId, '');
  await api.setTitle(tabId, DEFAULT_TITLE);
}

/** The badge API of the browser, for one tab each time. */
export function browserBadgeApi(): BadgeApi {
  return {
    setText: (tabId, text) => browser.action.setBadgeText({ tabId, text }),
    setColors: async (tabId, background, text) => {
      await browser.action.setBadgeBackgroundColor({ tabId, color: background });
      await browser.action.setBadgeTextColor({ tabId, color: text });
    },
    setTitle: (tabId, title) => browser.action.setTitle({ tabId, title }),
  };
}
