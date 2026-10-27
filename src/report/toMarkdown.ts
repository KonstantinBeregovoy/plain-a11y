import { describeRule } from '../dictionary/dictionary';
import {
  ROLE_LABELS,
  ROLE_ORDER,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
  toSeverity,
} from './groupReport';
import type { ViolationItem } from './violations';

export interface ReportMeta {
  /** Адрес проверенной страницы. */
  url: string;
  /** Дата проверки в локальном времени. */
  date: Date;
}

function formatDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Отчёт в Markdown для вставки в тикет: секции по ролям, пункты-чекбоксы. */
export function toMarkdown(
  items: readonly ViolationItem[],
  meta: ReportMeta,
): string {
  const lines = [
    '# Отчёт о доступности',
    '',
    `Страница: ${meta.url}`,
    `Дата: ${formatDate(meta.date)}`,
    '',
  ];

  if (items.length === 0) {
    lines.push(
      'Автоматическая проверка проблем не нашла. ' +
        'Она покрывает только часть требований доступности, ' +
        'поэтому остальное нужно проверить вручную.',
    );
    return `${lines.join('\n')}\n`;
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
      const fix = rule.howToFix ? ` Как исправить: ${rule.howToFix}` : '';
      lines.push(`- [ ] ${severity}: ${rule.title}.${fix}`);
    }
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}
