// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { createHighlighter } from '../src/content/highlight';

const PAGE = `
  <main>
    <h1 style="color: red">Heading</h1>
    <img id="pic" src="x.gif">
    <p class="note" style="margin: 0">Text</p>
    <p class="note">More text</p>
    <a href="#"></a>
  </main>`;

beforeEach(() => {
  document.body.innerHTML = PAGE;
});

describe('createHighlighter', () => {
  it('restores the original markup after the highlight is shown and removed', () => {
    const before = document.documentElement.outerHTML;
    const highlighter = createHighlighter(document);

    expect(highlighter.show(['#pic', '.note', 'h1', 'a'])).toBe(5);
    expect(document.documentElement.outerHTML).not.toBe(before);

    highlighter.clear();
    expect(document.documentElement.outerHTML).toBe(before);
  });

  it('outlines the found elements and returns their count', () => {
    const highlighter = createHighlighter(document);
    expect(highlighter.show(['.note'])).toBe(2);
    const note = document.querySelector<HTMLElement>('.note');
    expect(note?.style.getPropertyValue('outline')).toContain('3px solid');
  });

  it('replaces the previous highlight with a new one', () => {
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

  it('survives repeated clearing and unknown selectors', () => {
    const before = document.documentElement.outerHTML;
    const highlighter = createHighlighter(document);
    expect(highlighter.show(['#no-such-element', '###'])).toBe(0);
    highlighter.clear();
    highlighter.clear();
    expect(document.documentElement.outerHTML).toBe(before);
  });
});
