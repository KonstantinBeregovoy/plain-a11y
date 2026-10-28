import { describe, expect, it } from 'vitest';
import { toViolationItems } from '../src/report/violations';

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
