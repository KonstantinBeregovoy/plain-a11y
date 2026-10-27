import { describe, expect, it } from 'vitest';
import { groupReport, toSeverity } from '../src/report/groupReport';
import type { ViolationItem } from '../src/report/violations';

function item(id: string, impact: ViolationItem['impact']): ViolationItem {
  return { id, help: `help ${id}`, impact, nodeCount: 1, targets: [] };
}

describe('groupReport', () => {
  it('возвращает пустой список для пустого результата', () => {
    expect(groupReport([])).toEqual([]);
  });

  it('держит порядок групп: critical, serious, minor', () => {
    const groups = groupReport([
      item('tabindex', 'minor'),
      item('image-alt', 'critical'),
      item('color-contrast', 'serious'),
    ]);
    expect(groups.map((group) => group.severity)).toEqual([
      'critical',
      'serious',
      'minor',
    ]);
  });

  it('объединяет moderate, minor и неизвестную важность в minor', () => {
    const groups = groupReport([
      item('heading-order', 'moderate'),
      item('tabindex', 'minor'),
      item('frame-title', 'unknown'),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.severity).toBe('minor');
    expect(groups[0]?.count).toBe(3);
  });

  it('внутри важности держит порядок ролей: design, content, code', () => {
    const [group] = groupReport([
      item('tabindex', 'serious'), // code
      item('image-alt', 'serious'), // content
      item('color-contrast', 'serious'), // design
    ]);
    expect(group?.roles.map((role) => role.role)).toEqual([
      'design',
      'content',
      'code',
    ]);
  });

  it('не возвращает пустые роли', () => {
    const [group] = groupReport([item('image-alt', 'critical')]);
    expect(group?.roles.map((role) => role.role)).toEqual(['content']);
  });

  it('неизвестное правило попадает в роль code', () => {
    const [group] = groupReport([item('brand-new-rule', 'serious')]);
    expect(group?.roles[0]?.role).toBe('code');
  });

  it('фильтрует по роли и пересчитывает количество', () => {
    const items = [
      item('image-alt', 'critical'), // content
      item('link-name', 'serious'), // content
      item('color-contrast', 'serious'), // design
    ];
    const groups = groupReport(items, 'content');
    expect(groups.map((group) => [group.severity, group.count])).toEqual([
      ['critical', 1],
      ['serious', 1],
    ]);
    expect(groupReport(items, 'code')).toEqual([]);
  });
});

describe('toSeverity', () => {
  it('переводит важность axe в три уровня', () => {
    expect(toSeverity('critical')).toBe('critical');
    expect(toSeverity('serious')).toBe('serious');
    expect(toSeverity('moderate')).toBe('minor');
    expect(toSeverity('minor')).toBe('minor');
    expect(toSeverity('unknown')).toBe('minor');
  });
});
