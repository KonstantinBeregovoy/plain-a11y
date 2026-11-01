import { describe, expect, it, vi } from 'vitest';
import {
  ATTENTION_MARK,
  BADGE_ATTENTION_BACKGROUND,
  BADGE_ATTENTION_TEXT_COLOR,
  BADGE_BACKGROUND,
  BADGE_TEXT_COLOR,
  DEFAULT_TITLE,
  badgeLook,
  badgeText,
  badgeTitle,
  clearIssueCount,
  showResultBadge,
  type BadgeApi,
} from '../src/background/badge';
import type { ResultSummary } from '../src/report/summary';

function fakeApi(): BadgeApi & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    setText: vi.fn(async (tabId, text) => void calls.push(`text ${tabId} "${text}"`)),
    setColors: vi.fn(async (tabId, bg, fg) => void calls.push(`colors ${tabId} ${bg} ${fg}`)),
    setTitle: vi.fn(async (tabId, title) => void calls.push(`title ${tabId} "${title}"`)),
  };
}

/** A summary from the numbers of elements; the kinds do not matter for the icon. */
function summary(issues: number, review = 0, aaa = 0): ResultSummary {
  const group = (elements: number) => ({ elements, kinds: elements > 0 ? 1 : 0 });
  return { issues: group(issues), review: group(review), aaa: group(aaa) };
}

function luminance(hex: string): number {
  const channel = (index: number) => {
    const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

function contrast(a: string, b: string): number {
  const lights = [luminance(a), luminance(b)];
  return (Math.max(...lights) + 0.05) / (Math.min(...lights) + 0.05);
}

describe('badgeText', () => {
  it('is empty for zero, because a zero or a mark could be read as "passed"', () => {
    expect(badgeText(0)).toBe('');
    expect(badgeText(-1)).toBe('');
  });

  it('shows the number up to 99 and "99+" above it', () => {
    expect(badgeText(1)).toBe('1');
    expect(badgeText(8)).toBe('8');
    expect(badgeText(99)).toBe('99');
    expect(badgeText(100)).toBe('99+');
  });
});

describe('badgeLook', () => {
  it('shows the number of elements with issues, in red', () => {
    expect(badgeLook(summary(8, 14, 21))).toEqual({
      text: '8',
      background: BADGE_BACKGROUND,
      textColor: BADGE_TEXT_COLOR,
    });
  });

  it('shows an amber mark, not a number, when there are no issues but something to look at', () => {
    const attention = {
      text: ATTENTION_MARK,
      background: BADGE_ATTENTION_BACKGROUND,
      textColor: BADGE_ATTENTION_TEXT_COLOR,
    };
    expect(badgeLook(summary(0, 3, 0))).toEqual(attention);
    expect(badgeLook(summary(0, 0, 2))).toEqual(attention);
    expect(badgeLook(summary(0, 3, 2))).toEqual(attention);
  });

  it('shows nothing when there is nothing at all', () => {
    expect(badgeLook(summary(0)).text).toBe('');
  });
});

describe('badgeTitle', () => {
  it('names the three groups, in singular and plural, and leaves out the empty ones', () => {
    expect(badgeTitle(summary(8, 14, 21))).toBe(
      'Plain A11y: 8 issues, 14 to review by hand, 21 AAA recommendations in the last check',
    );
    expect(badgeTitle(summary(1, 0, 1))).toBe(
      'Plain A11y: 1 issue, 1 AAA recommendation in the last check',
    );
    expect(badgeTitle(summary(0, 5))).toBe('Plain A11y: 5 to review by hand in the last check');
  });

  it('is the name of the extension when there is nothing to report, and never says "accessible"', () => {
    expect(badgeTitle(summary(0))).toBe(DEFAULT_TITLE);
    for (const value of [summary(0), summary(1), summary(0, 2), summary(0, 0, 3), summary(7, 7, 7)]) {
      expect(badgeTitle(value)).not.toMatch(/accessible|passed|no issues/i);
    }
  });
});

describe('badge colors', () => {
  it('have a contrast of at least 4.5:1 in both looks', () => {
    expect(contrast(BADGE_TEXT_COLOR, BADGE_BACKGROUND)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(BADGE_ATTENTION_TEXT_COLOR, BADGE_ATTENTION_BACKGROUND)).toBeGreaterThanOrEqual(4.5);
  });

  it('are different, so the two looks are told apart by color and also by number and mark', () => {
    expect(BADGE_BACKGROUND).not.toBe(BADGE_ATTENTION_BACKGROUND);
    expect(ATTENTION_MARK).not.toMatch(/\d/);
  });
});

describe('showResultBadge', () => {
  it('sets the colors, the text and the title of one tab', async () => {
    const api = fakeApi();
    await showResultBadge(12, summary(4, 2, 0), api);
    expect(api.calls).toEqual([
      `colors 12 ${BADGE_BACKGROUND} ${BADGE_TEXT_COLOR}`,
      'text 12 "4"',
      'title 12 "Plain A11y: 4 issues, 2 to review by hand in the last check"',
    ]);
  });

  it('sets the amber mark when only the review and the recommendations are left', async () => {
    const api = fakeApi();
    await showResultBadge(3, summary(0, 2, 1), api);
    expect(api.calls).toContain(`colors 3 ${BADGE_ATTENTION_BACKGROUND} ${BADGE_ATTENTION_TEXT_COLOR}`);
    expect(api.calls).toContain(`text 3 "${ATTENTION_MARK}"`);
  });

  it('leaves the text empty for a result with nothing in it', async () => {
    const api = fakeApi();
    await showResultBadge(3, summary(0), api);
    expect(api.calls).toContain('text 3 ""');
    expect(api.calls).toContain(`title 3 "${DEFAULT_TITLE}"`);
  });

  it('passes a failure of the browser API on, so the caller can ignore it', async () => {
    const api = fakeApi();
    api.setText = async () => {
      throw new Error('No tab with id: 9.');
    };
    await expect(showResultBadge(9, summary(2), api)).rejects.toThrow('No tab');
  });
});

describe('clearIssueCount', () => {
  it('empties the text and puts the plain name back in the tooltip, for that tab only', async () => {
    const api = fakeApi();
    await clearIssueCount(4, api);
    expect(api.calls).toEqual(['text 4 ""', `title 4 "${DEFAULT_TITLE}"`]);
  });
});
