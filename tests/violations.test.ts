import { describe, expect, it } from 'vitest';
import { toViolationItems } from '../src/report/violations';

describe('toViolationItems', () => {
  it('превращает нарушения axe в строки списка', () => {
    const items = toViolationItems([
      { id: 'image-alt', impact: 'critical', nodes: [{}, {}] },
      { id: 'color-contrast', impact: 'serious', nodes: [{}] },
    ]);
    expect(items).toEqual([
      { id: 'image-alt', impact: 'critical', nodeCount: 2 },
      { id: 'color-contrast', impact: 'serious', nodeCount: 1 },
    ]);
  });

  it('подставляет unknown, если impact не задан', () => {
    expect(
      toViolationItems([{ id: 'x', impact: null, nodes: [] }, { id: 'y', nodes: [{}] }]),
    ).toEqual([
      { id: 'x', impact: 'unknown', nodeCount: 0 },
      { id: 'y', impact: 'unknown', nodeCount: 1 },
    ]);
  });

  it('возвращает пустой список для пустого результата', () => {
    expect(toViolationItems([])).toEqual([]);
  });
});
