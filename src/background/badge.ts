import type { ResultSummary } from '../report/summary';

/** Issues: white on this red has a contrast of 7.8:1. */
export const BADGE_BACKGROUND = '#a01d17';
export const BADGE_TEXT_COLOR = '#ffffff';
/** Nothing is wrong for sure, but a person has something to look at: black on this amber, 13:1. */
export const BADGE_ATTENTION_BACKGROUND = '#ffc107';
export const BADGE_ATTENTION_TEXT_COLOR = '#000000';
/** The mark for "look at the popup". It is not a number, so it cannot be read as a count. */
export const ATTENTION_MARK = '!';
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
 * The number of elements with issues. Nothing for zero: a "0" could be read as "passed",
 * and an automated check cannot say that.
 */
export function badgeText(count: number): string {
  if (count <= 0) return '';
  return count > MAX_SHOWN ? `${MAX_SHOWN}+` : String(count);
}

/** What the icon shows for a result: a red number, an amber mark, or nothing. */
export function badgeLook(summary: ResultSummary): {
  text: string;
  background: string;
  textColor: string;
} {
  if (summary.issues.elements > 0) {
    return {
      text: badgeText(summary.issues.elements),
      background: BADGE_BACKGROUND,
      textColor: BADGE_TEXT_COLOR,
    };
  }
  if (summary.review.elements > 0 || summary.aaa.elements > 0) {
    return {
      text: ATTENTION_MARK,
      background: BADGE_ATTENTION_BACKGROUND,
      textColor: BADGE_ATTENTION_TEXT_COLOR,
    };
  }
  return { text: '', background: BADGE_BACKGROUND, textColor: BADGE_TEXT_COLOR };
}

/** The same information in words, for the tooltip: the three groups, zero groups left out. */
export function badgeTitle(summary: ResultSummary): string {
  const { issues, review, aaa } = summary;
  const parts: string[] = [];
  if (issues.elements > 0) {
    parts.push(`${issues.elements} ${issues.elements === 1 ? 'issue' : 'issues'}`);
  }
  if (review.elements > 0) parts.push(`${review.elements} to review by hand`);
  if (aaa.elements > 0) {
    parts.push(`${aaa.elements} AAA ${aaa.elements === 1 ? 'recommendation' : 'recommendations'}`);
  }
  return parts.length === 0
    ? DEFAULT_TITLE
    : `${DEFAULT_TITLE}: ${parts.join(', ')} in the last check`;
}

/** Shows the result on the icon, for one tab only. */
export async function showResultBadge(
  tabId: number,
  summary: ResultSummary,
  api: BadgeApi,
): Promise<void> {
  const look = badgeLook(summary);
  await api.setColors(tabId, look.background, look.textColor);
  await api.setText(tabId, look.text);
  await api.setTitle(tabId, badgeTitle(summary));
}

/**
 * Removes the number and the tooltip text of one tab. Chrome does this itself only
 * for a full navigation, not when a single-page site changes the address.
 */
export async function clearIssueCount(tabId: number, api: BadgeApi): Promise<void> {
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
