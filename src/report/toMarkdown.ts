import { describeRule } from '../dictionary/dictionary';
import {
  ROLE_LABELS,
  ROLE_ORDER,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
  groupByRole,
  toSeverity,
} from './groupReport';
import type { ViolationItem } from './violations';

export interface ReportMeta {
  /** Address of the checked page. */
  url: string;
  /** Date of the check in local time. */
  date: Date;
}

/**
 * Keeps only scheme, host and path. Query strings and fragments often carry
 * tokens or personal data, and the report is meant to be pasted into tickets.
 */
export function formatPageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
  } catch {
    return url.split(/[?#]/)[0] ?? '';
  }
}

function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Markdown report for pasting into a ticket: sections by role, checkbox items.
 * `review` holds the cases the automated check could not decide on its own,
 * `aaa` the optional AAA recommendations (pass an empty list when they are hidden).
 */
export function toMarkdown(
  items: readonly ViolationItem[],
  meta: ReportMeta,
  review: readonly ViolationItem[] = [],
  aaa: readonly ViolationItem[] = [],
): string {
  const lines = [
    '# Accessibility report',
    '',
    `Page: ${formatPageUrl(meta.url)}`,
    `Date: ${formatDate(meta.date)}`,
    '',
  ];

  if (items.length === 0) {
    const reviewNote =
      review.length === 0
        ? ''
        : `, but ${review.length} ${review.length === 1 ? 'item needs' : 'items need'} a manual review (listed below)`;
    lines.push(
      `The automated check found no issues${reviewNote}. ` +
        'It covers only part of the accessibility requirements, ' +
        'so check the rest manually.',
      '',
    );
  }

  const issues = items.map((item) => ({
    item,
    rule: describeRule(item.id, item.help),
  }));

  for (const role of ROLE_ORDER) {
    const ofRole = issues
      .filter((issue) => issue.rule.role === role)
      .sort(
        (a, b) =>
          SEVERITY_ORDER.indexOf(toSeverity(a.item.impact)) -
          SEVERITY_ORDER.indexOf(toSeverity(b.item.impact)),
      );
    if (ofRole.length === 0) continue;
    lines.push(`## ${ROLE_LABELS[role]}`, '');
    for (const { item, rule } of ofRole) {
      const severity = SEVERITY_LABELS[toSeverity(item.impact)];
      const fix = rule.howToFix ? ` How to fix: ${rule.howToFix}` : '';
      lines.push(`- [ ] ${severity}: ${rule.title}.${fix}`);
    }
    lines.push('');
  }

  if (review.length > 0) {
    lines.push(
      '## Needs manual review',
      '',
      'The automated check could not decide these items on its own. A person needs to look at them.',
      '',
    );
    for (const { role, issues: ofRole } of groupByRole(review)) {
      for (const { rule } of ofRole) {
        const fix = rule.howToFix ? ` If confirmed, how to fix: ${rule.howToFix}` : '';
        lines.push(`- [ ] ${ROLE_LABELS[role]}: ${rule.title}.${fix}`);
      }
    }
    lines.push('');
  }

  if (aaa.length > 0) {
    lines.push(
      '## AAA recommendations',
      '',
      'Optional recommendations beyond the standard level.',
      '',
    );
    for (const { role, issues: ofRole } of groupByRole(aaa)) {
      for (const { rule } of ofRole) {
        const fix = rule.howToFix ? ` How to fix: ${rule.howToFix}` : '';
        lines.push(`- [ ] ${ROLE_LABELS[role]}: ${rule.title}.${fix}`);
      }
    }
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}
