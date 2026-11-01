import { describe, expect, it } from 'vitest';
import { summarize, summaryLine } from '../src/report/summary';
import type { ViolationItem } from '../src/report/violations';

const item = (id: string, nodeCount: number): ViolationItem => ({
  id,
  help: id,
  impact: 'minor',
  nodeCount,
  targets: [],
});

describe('summarize', () => {
  it('counts elements, not kinds of problem, for each of the three groups', () => {
    const summary = summarize({
      items: [item('a', 3), item('b', 1), item('c', 1), item('d', 1), item('e', 2)],
      review: [item('f', 5), item('g', 1)],
      aaa: [item('h', 21)],
    });
    expect(summary).toEqual({
      issues: { elements: 8, kinds: 5 },
      review: { elements: 6, kinds: 2 },
      aaa: { elements: 21, kinds: 1 },
    });
  });
});

describe('summaryLine', () => {
  const line = (items: number[], review: number[], aaa: number[]) =>
    summaryLine(
      summarize({
        items: items.map((n, i) => item(`i${i}`, n)),
        review: review.map((n, i) => item(`r${i}`, n)),
        aaa: aaa.map((n, i) => item(`a${i}`, n)),
      }),
    );

  it('puts the elements first and the kinds in brackets, for the three groups', () => {
    expect(line([3, 1, 1, 1, 2], [5, 1], [21])).toBe(
      'Issues found: 8 (5 kinds). Needs manual review: 6 (2 kinds). AAA recommendations: 21 (1 kind).',
    );
  });

  it('says there are no issues, and still names what is left for a person', () => {
    expect(line([], [], [])).toBe('No issues found.');
    expect(line([], [2], [])).toBe('No issues found. Needs manual review: 2 (1 kind).');
    expect(line([], [], [4])).toBe('No issues found. AAA recommendations: 4 (1 kind).');
  });
});
