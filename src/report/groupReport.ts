import {
  describeRule,
  type Role,
  type RuleDescription,
} from '../dictionary/dictionary';
import type { ViolationItem } from './violations';

export type Severity = 'critical' | 'serious' | 'minor';

export const SEVERITY_ORDER: readonly Severity[] = [
  'critical',
  'serious',
  'minor',
];
export const ROLE_ORDER: readonly Role[] = ['design', 'content', 'code'];

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  serious: 'Serious',
  minor: 'Minor',
};
export const ROLE_LABELS: Record<Role, string> = {
  design: 'Design',
  content: 'Content',
  code: 'Code',
};

export interface ReportIssue {
  item: ViolationItem;
  rule: RuleDescription;
}

export interface RoleGroup {
  role: Role;
  issues: ReportIssue[];
}

export interface SeverityGroup {
  severity: Severity;
  count: number;
  roles: RoleGroup[];
}

/** moderate, minor and unknown impact all fall into minor. */
export function toSeverity(impact: ViolationItem['impact']): Severity {
  return impact === 'critical' || impact === 'serious' ? impact : 'minor';
}

/** Groups items by role only, in the role order. Empty roles are omitted. */
export function groupByRole(
  items: readonly ViolationItem[],
  roleFilter?: Role,
): RoleGroup[] {
  const issues: ReportIssue[] = items
    .map((item) => ({ item, rule: describeRule(item.id, item.help) }))
    .filter((issue) => roleFilter === undefined || issue.rule.role === roleFilter);
  return ROLE_ORDER.flatMap((role) => {
    const ofRole = issues.filter((issue) => issue.rule.role === role);
    return ofRole.length === 0 ? [] : [{ role, issues: ofRole }];
  });
}

/**
 * Groups violations by severity, then by role within each severity.
 * Empty groups are omitted. The order of issues within a group is preserved.
 */
export function groupReport(
  items: readonly ViolationItem[],
  roleFilter?: Role,
): SeverityGroup[] {
  const issues: ReportIssue[] = items
    .map((item) => ({ item, rule: describeRule(item.id, item.help) }))
    .filter((issue) => roleFilter === undefined || issue.rule.role === roleFilter);

  return SEVERITY_ORDER.flatMap((severity) => {
    const ofSeverity = issues.filter(
      (issue) => toSeverity(issue.item.impact) === severity,
    );
    if (ofSeverity.length === 0) return [];
    const roles = ROLE_ORDER.flatMap((role) => {
      const ofRole = ofSeverity.filter((issue) => issue.rule.role === role);
      return ofRole.length === 0 ? [] : [{ role, issues: ofRole }];
    });
    return [{ severity, count: ofSeverity.length, roles }];
  });
}
