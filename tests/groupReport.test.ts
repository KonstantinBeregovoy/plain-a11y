import { describe, expect, it } from 'vitest';
import { groupByRole, groupReport, toSeverity } from '../src/report/groupReport';
import type { ViolationItem } from '../src/report/violations';

function item(id: string, impact: ViolationItem['impact']): ViolationItem {
  return { id, help: `help ${id}`, impact, nodeCount: 1, targets: [] };
}

describe('groupReport', () => {
  it('returns an empty list for an empty result', () => {
    expect(groupReport([])).toEqual([]);
  });

  it('keeps the group order: critical, serious, minor', () => {
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

  it('merges moderate, minor and unknown impact into minor', () => {
    const groups = groupReport([
      item('heading-order', 'moderate'),
      item('tabindex', 'minor'),
      item('frame-title', 'unknown'),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.severity).toBe('minor');
    expect(groups[0]?.count).toBe(3);
  });

  it('keeps the role order within a severity: design, content, code', () => {
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

  it('does not return empty roles', () => {
    const [group] = groupReport([item('image-alt', 'critical')]);
    expect(group?.roles.map((role) => role.role)).toEqual(['content']);
  });

  it('puts an unknown rule into the code role', () => {
    const [group] = groupReport([item('brand-new-rule', 'serious')]);
    expect(group?.roles[0]?.role).toBe('code');
  });

  it('filters by role and recounts', () => {
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
  it('maps axe impact to three levels', () => {
    expect(toSeverity('critical')).toBe('critical');
    expect(toSeverity('serious')).toBe('serious');
    expect(toSeverity('moderate')).toBe('minor');
    expect(toSeverity('minor')).toBe('minor');
    expect(toSeverity('unknown')).toBe('minor');
  });
});

describe('groupByRole', () => {
  it('returns an empty list for an empty result', () => {
    expect(groupByRole([])).toEqual([]);
  });

  it('keeps the role order design, content, code and the input order inside a role', () => {
    const roles = groupByRole([
      item('tabindex', 'unknown'), // code
      item('image-alt', 'unknown'), // content
      item('color-contrast', 'unknown'), // design
      item('link-name', 'unknown'), // content
    ]);
    expect(roles.map((group) => group.role)).toEqual(['design', 'content', 'code']);
    expect(roles[1]?.issues.map((issue) => issue.item.id)).toEqual([
      'image-alt',
      'link-name',
    ]);
  });

  it('does not mix severity into the grouping', () => {
    const roles = groupByRole([item('image-alt', 'critical'), item('link-name', 'minor')]);
    expect(roles).toHaveLength(1);
    expect(roles[0]?.issues).toHaveLength(2);
  });

  it('filters by role', () => {
    const items = [item('image-alt', 'unknown'), item('tabindex', 'unknown')];
    expect(groupByRole(items, 'code').map((group) => group.role)).toEqual(['code']);
    expect(groupByRole(items, 'design')).toEqual([]);
  });
});
