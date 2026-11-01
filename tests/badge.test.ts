import { describe, expect, it, vi } from 'vitest';
import {
  BADGE_BACKGROUND,
  BADGE_TEXT_COLOR,
  DEFAULT_TITLE,
  badgeText,
  badgeTitle,
  showIssueCount,
  type BadgeApi,
} from '../src/background/badge';

function fakeApi(): BadgeApi & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    setText: vi.fn(async (tabId, text) => void calls.push(`text ${tabId} "${text}"`)),
    setColors: vi.fn(async (tabId, bg, fg) => void calls.push(`colors ${tabId} ${bg} ${fg}`)),
    setTitle: vi.fn(async (tabId, title) => void calls.push(`title ${tabId} "${title}"`)),
  };
}

function luminance(hex: string): number {
  const channel = (index: number) => {
    const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

describe('badgeText', () => {
  it('is empty for zero, because a zero or a mark could be read as "passed"', () => {
    expect(badgeText(0)).toBe('');
    expect(badgeText(-1)).toBe('');
  });

  it('shows the number up to 99 and "99+" above it', () => {
    expect(badgeText(1)).toBe('1');
    expect(badgeText(5)).toBe('5');
    expect(badgeText(99)).toBe('99');
    expect(badgeText(100)).toBe('99+');
  });
});

describe('badgeTitle', () => {
  it('says the same in words, in singular and plural', () => {
    expect(badgeTitle(1)).toBe('Plain A11y: 1 issue found in the last check');
    expect(badgeTitle(5)).toBe('Plain A11y: 5 issues found in the last check');
  });

  it('is the name of the extension when there is nothing to report, and never says "accessible"', () => {
    expect(badgeTitle(0)).toBe(DEFAULT_TITLE);
    for (const count of [0, 1, 7]) expect(badgeTitle(count)).not.toMatch(/accessible|passed|no issues/i);
  });
});

describe('badge colors', () => {
  it('have a contrast of at least 4.5:1', () => {
    const lights = [luminance(BADGE_TEXT_COLOR), luminance(BADGE_BACKGROUND)];
    const ratio = (Math.max(...lights) + 0.05) / (Math.min(...lights) + 0.05);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

describe('showIssueCount', () => {
  it('sets the colors, the text and the title of one tab', async () => {
    const api = fakeApi();
    await showIssueCount(12, 4, api);
    expect(api.calls).toEqual([
      `colors 12 ${BADGE_BACKGROUND} ${BADGE_TEXT_COLOR}`,
      'text 12 "4"',
      'title 12 "Plain A11y: 4 issues found in the last check"',
    ]);
  });

  it('leaves the text empty for a clean result', async () => {
    const api = fakeApi();
    await showIssueCount(3, 0, api);
    expect(api.calls).toContain('text 3 ""');
    expect(api.calls).toContain(`title 3 "${DEFAULT_TITLE}"`);
  });

  it('passes a failure of the browser API on, so the caller can ignore it', async () => {
    const api = fakeApi();
    api.setText = async () => {
      throw new Error('No tab with id: 9.');
    };
    await expect(showIssueCount(9, 2, api)).rejects.toThrow('No tab');
  });
});
