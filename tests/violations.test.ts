import { describe, expect, it } from 'vitest';
import { toViolationItems } from '../src/report/violations';

describe('toViolationItems', () => {
  it('превращает нарушения axe в строки списка', () => {
    const items = toViolationItems([
      { id: 'image-alt', help: 'Images must have alternate text', impact: 'critical', nodes: [{}, {}] },
      { id: 'color-contrast', help: 'Elements must have sufficient color contrast', impact: 'serious', nodes: [{}] },
    ]);
    expect(items).toEqual([
      { id: 'image-alt', help: 'Images must have alternate text', impact: 'critical', nodeCount: 2 },
      { id: 'color-contrast', help: 'Elements must have sufficient color contrast', impact: 'serious', nodeCount: 1 },
    ]);
  });

  it('подставляет unknown, если impact не задан', () => {
    expect(
      toViolationItems([{ id: 'x', help: 'X', impact: null, nodes: [] }, { id: 'y', help: 'Y', nodes: [{}] }]),
    ).toEqual([
      { id: 'x', help: 'X', impact: 'unknown', nodeCount: 0 },
      { id: 'y', help: 'Y', impact: 'unknown', nodeCount: 1 },
    ]);
  });

  it('возвращает пустой список для пустого результата', () => {
    expect(toViolationItems([])).toEqual([]);
  });
});
