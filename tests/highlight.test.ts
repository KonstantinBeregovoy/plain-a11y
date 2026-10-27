// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { createHighlighter } from '../src/content/highlight';

const PAGE = `
  <main>
    <h1 style="color: red">Заголовок</h1>
    <img id="pic" src="x.gif">
    <p class="note" style="margin: 0">Текст</p>
    <p class="note">Ещё текст</p>
    <a href="#"></a>
  </main>`;

beforeEach(() => {
  document.body.innerHTML = PAGE;
});

describe('createHighlighter', () => {
  it('после включения и снятия подсветки разметка совпадает с исходной', () => {
    const before = document.documentElement.outerHTML;
    const highlighter = createHighlighter(document);

    expect(highlighter.show(['#pic', '.note', 'h1', 'a'])).toBe(5);
    expect(document.documentElement.outerHTML).not.toBe(before);

    highlighter.clear();
    expect(document.documentElement.outerHTML).toBe(before);
  });

  it('обводит найденные элементы и возвращает их число', () => {
    const highlighter = createHighlighter(document);
    expect(highlighter.show(['.note'])).toBe(2);
    const note = document.querySelector<HTMLElement>('.note');
    expect(note?.style.getPropertyValue('outline')).toContain('3px solid');
  });

  it('новая подсветка заменяет прежнюю', () => {
    const before = document.documentElement.outerHTML;
    const highlighter = createHighlighter(document);
    highlighter.show(['h1']);
    highlighter.show(['#pic']);
    expect(document.querySelector<HTMLElement>('h1')?.getAttribute('style')).toBe(
      'color: red',
    );
    highlighter.clear();
    expect(document.documentElement.outerHTML).toBe(before);
  });

  it('повторное снятие и неизвестный селектор ничего не ломают', () => {
    const before = document.documentElement.outerHTML;
    const highlighter = createHighlighter(document);
    expect(highlighter.show(['#нет-такого', '###'])).toBe(0);
    highlighter.clear();
    highlighter.clear();
    expect(document.documentElement.outerHTML).toBe(before);
  });
});
