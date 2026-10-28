import { describe, expect, it } from 'vitest';
import { buildCheckResult, toViolationItems } from '../src/report/violations';

describe('toViolationItems', () => {
  it('converts axe violations into list rows', () => {
    const items = toViolationItems([
      { id: 'image-alt', help: 'Images must have alternate text', impact: 'critical', nodes: [{ target: ['#a'] }, { target: ['.b > img'] }] },
      { id: 'color-contrast', help: 'Elements must have sufficient color contrast', impact: 'serious', nodes: [{ target: ['p'] }] },
    ]);
    expect(items).toEqual([
      { id: 'image-alt', help: 'Images must have alternate text', impact: 'critical', nodeCount: 2, targets: ['#a', '.b > img'] },
      { id: 'color-contrast', help: 'Elements must have sufficient color contrast', impact: 'serious', nodeCount: 1, targets: ['p'] },
    ]);
  });

  it('uses unknown when impact is missing', () => {
    expect(
      toViolationItems([{ id: 'x', help: 'X', impact: null, nodes: [] }, { id: 'y', help: 'Y', nodes: [{ target: ['p'] }] }]),
    ).toEqual([
      { id: 'x', help: 'X', impact: 'unknown', nodeCount: 0, targets: [] },
      { id: 'y', help: 'Y', impact: 'unknown', nodeCount: 1, targets: ['p'] },
    ]);
  });

  it('returns an empty list for an empty result', () => {
    expect(toViolationItems([])).toEqual([]);
  });

  it('skips selectors for iframes and shadow DOM', () => {
    const [item] = toViolationItems([
      {
        id: 'image-alt',
        help: 'h',
        impact: 'critical',
        nodes: [
          { target: ['img'] },
          { target: ['iframe', 'img'] },
          { target: [['#host', 'img']] },
        ],
      },
    ]);
    expect(item?.nodeCount).toBe(3);
    expect(item?.targets).toEqual(['img']);
  });
});

describe('buildCheckResult', () => {
  const rule = (id: string, impact: 'critical' | 'minor' | null = 'critical') => ({
    id,
    help: `help ${id}`,
    impact,
    nodes: [{ target: ['p'] }],
  });
  const AAA = ['color-contrast-enhanced', 'meta-refresh-no-exceptions'];

  it('puts violations in items, incomplete cases in review and AAA violations in aaa', () => {
    const result = buildCheckResult(
      {
        violations: [rule('image-alt'), rule('color-contrast-enhanced', 'minor')],
        incomplete: [rule('video-caption', null)],
      },
      AAA,
    );
    expect(result.items.map((item) => item.id)).toEqual(['image-alt']);
    expect(result.review.map((item) => item.id)).toEqual(['video-caption']);
    expect(result.aaa.map((item) => item.id)).toEqual(['color-contrast-enhanced']);
  });

  it('drops unclear AAA cases instead of flooding the manual-review list', () => {
    const result = buildCheckResult(
      {
        violations: [],
        incomplete: [rule('color-contrast-enhanced', null), rule('video-caption', null)],
      },
      AAA,
    );
    expect(result.review.map((item) => item.id)).toEqual(['video-caption']);
    expect(result.aaa).toEqual([]);
  });

  it('returns three empty lists for an empty result', () => {
    expect(buildCheckResult({ violations: [], incomplete: [] }, AAA)).toEqual({
      items: [],
      review: [],
      aaa: [],
    });
  });

  it('keeps the compact item format', () => {
    const [aaa] = buildCheckResult(
      { violations: [rule('meta-refresh-no-exceptions', 'minor')], incomplete: [] },
      AAA,
    ).aaa;
    expect(aaa).toEqual({
      id: 'meta-refresh-no-exceptions',
      help: 'help meta-refresh-no-exceptions',
      impact: 'minor',
      nodeCount: 1,
      targets: ['p'],
    });
  });
});
