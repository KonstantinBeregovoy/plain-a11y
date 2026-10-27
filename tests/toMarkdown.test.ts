import { describe, expect, it } from 'vitest';
import { toMarkdown } from '../src/report/toMarkdown';
import type { ViolationItem } from '../src/report/violations';

function item(
  id: string,
  impact: ViolationItem['impact'],
  help = `help ${id}`,
): ViolationItem {
  return { id, help, impact, nodeCount: 1, targets: [] };
}

const META = { url: 'https://example.com/page', date: new Date(2026, 9, 27) };

describe('toMarkdown', () => {
  it('формирует отчёт для фиксированного входа', () => {
    const markdown = toMarkdown(
      [
        item('tabindex', 'minor'),
        item('link-name', 'serious'),
        item('image-alt', 'critical'),
        item('color-contrast', 'serious'),
        item('label', 'critical'),
        item('brand-new-rule', 'moderate', 'Some new rule must pass'),
      ],
      META,
    );
    expect(markdown).toMatchSnapshot();
  });

  it('пишет адрес и дату в заголовок', () => {
    const markdown = toMarkdown([item('image-alt', 'critical')], META);
    expect(markdown).toContain('Страница: https://example.com/page');
    expect(markdown).toContain('Дата: 2026-10-27');
  });

  it('делает пункты-чекбоксы, внутри роли сначала более важные', () => {
    const markdown = toMarkdown(
      [item('tabindex', 'minor'), item('label', 'critical')],
      META,
    );
    const checkboxes = markdown.split('\n').filter((line) => line.startsWith('- [ ] '));
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toMatch(/^- \[ \] Критично: У поля ввода нет подписи\. Как исправить: /);
    expect(checkboxes[1]).toMatch(/^- \[ \] Желательно: /);
  });

  it('для пустого результата говорит, что проблем не найдено, и напоминает об ограничении', () => {
    const markdown = toMarkdown([], META);
    expect(markdown).toContain('Автоматическая проверка проблем не нашла.');
    expect(markdown).toContain('только часть требований');
    expect(markdown).not.toContain('- [ ]');
    expect(markdown).not.toContain('## ');
  });
});
