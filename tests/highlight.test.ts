// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
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
    const highlighter = createHighlighter(document, () => true);

    expect(highlighter.show(['#pic', '.note', 'h1', 'a']).found).toBe(5);
    expect(document.documentElement.outerHTML).not.toBe(before);

    highlighter.clear();
    expect(document.documentElement.outerHTML).toBe(before);
  });

  it('outlines the found elements and returns their count', () => {
    const highlighter = createHighlighter(document, () => true);
    expect(highlighter.show(['.note']).found).toBe(2);
    const note = document.querySelector<HTMLElement>('.note');
    expect(note?.style.getPropertyValue('outline')).toContain('3px solid');
  });

  it('replaces the previous highlight with a new one', () => {
    const before = document.documentElement.outerHTML;
    const highlighter = createHighlighter(document, () => true);
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
    const highlighter = createHighlighter(document, () => true);
    expect(highlighter.show(['#no-such-element', '###']).found).toBe(0);
    highlighter.clear();
    highlighter.clear();
    expect(document.documentElement.outerHTML).toBe(before);
  });

  it('drops an empty style attribute that the browser leaves behind', () => {
    // Chrome can keep style="" after removeAttribute when the inline style was
    // changed through the CSSOM and the attribute was never read. Simulate it.
    const before = document.documentElement.outerHTML;
    const img = document.querySelector('img');
    expect(img).not.toBeNull();
    if (!img) return;
    const original = img.removeAttribute.bind(img);
    let leaked = false;
    img.removeAttribute = (name: string) => {
      if (name === 'style' && !leaked) {
        leaked = true;
        img.setAttribute('style', '');
        return;
      }
      original(name);
    };

    const highlighter = createHighlighter(document, () => true);
    highlighter.show(['#pic']);
    highlighter.clear();

    expect(leaked).toBe(true);
    expect(document.documentElement.outerHTML).toBe(before);
  });
});

describe('createHighlighter in shadow DOM', () => {
  /** The page markup including the content of open shadow roots, which outerHTML leaves out. */
  function snapshot(): string {
    const parts: string[] = [document.documentElement.outerHTML];
    const visit = (root: ParentNode) => {
      root.querySelectorAll('*').forEach((element) => {
        if (element.shadowRoot) {
          parts.push(`#shadow of ${element.tagName.toLowerCase()}: ${element.shadowRoot.innerHTML}`);
          visit(element.shadowRoot);
        }
      });
    };
    visit(document);
    return parts.join('\n');
  }

  const scrolled: Element[] = [];
  const original = Element.prototype.scrollIntoView;

  beforeEach(() => {
    document.body.innerHTML = `
      <p id="plain">Plain text</p>
      <div id="host"></div>
      <div id="outer"></div>`;
    const host = document.getElementById('host')!;
    host.attachShadow({ mode: 'open' }).innerHTML =
      '<img id="pic" src="x.gif"><button style="color: red">Inside</button>';
    const outer = document.getElementById('outer')!;
    outer.attachShadow({ mode: 'open' }).innerHTML = '<div id="inner"></div>';
    outer.shadowRoot!.getElementById('inner')!.attachShadow({ mode: 'open' }).innerHTML =
      '<span class="deep">Deep</span>';
    scrolled.length = 0;
    Element.prototype.scrollIntoView = function scrollIntoView(this: Element) {
      scrolled.push(this);
    };
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = original;
  });

  it('outlines an element inside an open shadow root and restores everything afterwards', () => {
    const before = snapshot();
    const highlighter = createHighlighter(document, () => true);

    expect(highlighter.show([['#host', 'img']]).found).toBe(1);
    const img = document.getElementById('host')!.shadowRoot!.querySelector('img')!;
    expect(img.style.getPropertyValue('outline')).toContain('3px solid');
    expect(snapshot()).not.toBe(before);

    highlighter.clear();
    expect(snapshot()).toBe(before);
  });

  it('follows a path through nested shadow roots', () => {
    const highlighter = createHighlighter(document, () => true);
    expect(highlighter.show([['#outer', '#inner', '.deep']]).found).toBe(1);
  });

  it('highlights simple selectors and shadow paths together and scrolls to the first element', () => {
    const before = snapshot();
    const highlighter = createHighlighter(document, () => true);

    expect(highlighter.show(['#plain', ['#host', 'button']]).found).toBe(2);
    expect(scrolled).toHaveLength(1);
    expect(scrolled[0]?.id).toBe('plain');

    highlighter.clear();
    expect(snapshot()).toBe(before);
  });

  it('scrolls to an element inside a shadow root when it is the first one', () => {
    const highlighter = createHighlighter(document, () => true);
    highlighter.show([['#host', 'img']]);
    expect(scrolled.map((element) => element.id)).toEqual(['pic']);
  });

  it('keeps the original inline style of an element inside a shadow root', () => {
    const highlighter = createHighlighter(document, () => true);
    highlighter.show([['#host', 'button']]);
    highlighter.clear();
    const button = document.getElementById('host')!.shadowRoot!.querySelector('button')!;
    expect(button.getAttribute('style')).toBe('color: red');
  });

  it('finds nothing for a path with a missing host, a closed shadow root or a bad selector', () => {
    const closed = document.createElement('div');
    closed.id = 'closed';
    closed.attachShadow({ mode: 'closed' }).innerHTML = '<img id="secret">';
    document.body.append(closed);

    const before = snapshot();
    const highlighter = createHighlighter(document, () => true);
    expect(highlighter.show([['#missing', 'img']]).found).toBe(0);
    expect(highlighter.show([['#closed', 'img']]).found).toBe(0);
    expect(highlighter.show([['#host', '###']]).found).toBe(0);
    expect(highlighter.show([['#plain', 'img']]).found).toBe(0); // host without a shadow root
    expect(snapshot()).toBe(before);
  });

  it('replaces a previous highlight inside a shadow root with a new one', () => {
    const before = snapshot();
    const highlighter = createHighlighter(document, () => true);
    highlighter.show([['#host', 'img']]);
    highlighter.show([['#host', 'button']]);
    const img = document.getElementById('host')!.shadowRoot!.querySelector('img')!;
    expect(img.hasAttribute('style')).toBe(false);
    highlighter.clear();
    expect(snapshot()).toBe(before);
  });
});

describe('createHighlighter with elements that have no visible area', () => {
  // jsdom has no layout, so the visible area is decided by a stand-in for the browser check.
  const NO_BOX = new Set(['empty-link', 'wrapper', 'meta']);
  const hasBox = (element: Element) => !NO_BOX.has(element.id);
  const outlined = (selector: string) =>
    document.querySelector<HTMLElement>(selector)?.style.outline ?? '';

  beforeEach(() => {
    document.head.innerHTML = '<meta id="meta" name="viewport" content="x">';
    document.body.innerHTML = `
      <nav id="bar"><a id="empty-link" href="#"></a></nav>
      <div id="shown"><p id="wrapper"><span id="inner">text</span></p></div>
      <img id="pic" src="x.gif">`;
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('outlines the nearest visible parent of an element with no visible area', () => {
    const highlighter = createHighlighter(document, hasBox);
    expect(highlighter.show(['#empty-link'])).toEqual({ found: 1, nearest: 1, notVisible: 0 });
    expect(outlined('#bar')).toContain('solid');
    expect(outlined('#empty-link')).toBe('');
  });

  it('counts a shared parent once and the matches that moved separately', () => {
    const highlighter = createHighlighter(document, hasBox);
    // #wrapper has no box and moves to #shown; #inner has one; #pic has one.
    const result = highlighter.show(['#wrapper', '#inner', '#pic']);
    expect(result).toEqual({ found: 3, nearest: 1, notVisible: 0 });
    expect(outlined('#shown')).toContain('solid');
    expect(outlined('#inner')).toContain('solid');
  });

  it('does not outline anything for an element that is not in the page body', () => {
    const highlighter = createHighlighter(document, hasBox);
    expect(highlighter.show(['#meta'])).toEqual({ found: 0, nearest: 0, notVisible: 1 });
    expect(document.documentElement.getAttribute('style')).toBeNull();
    expect(document.body.getAttribute('style')).toBeNull();
  });

  it('does not move to the body when no parent inside it has a visible area', () => {
    const highlighter = createHighlighter(document, () => false);
    expect(highlighter.show(['#inner'])).toEqual({ found: 0, nearest: 0, notVisible: 1 });
  });

  it('outlines the page root as it is (document-level rules)', () => {
    const highlighter = createHighlighter(document, () => false);
    expect(highlighter.show(['html'])).toEqual({ found: 1, nearest: 0, notVisible: 0 });
    highlighter.clear();
    expect(document.documentElement.getAttribute('style')).toBeNull();
  });

  it('climbs out of an open shadow root to its host', () => {
    document.body.insertAdjacentHTML('beforeend', '<div id="host"></div>');
    const host = document.querySelector('#host');
    const root = host?.attachShadow({ mode: 'open' });
    if (root) root.innerHTML = '<a id="empty-link" href="#"></a>';
    const highlighter = createHighlighter(document, hasBox);
    expect(highlighter.show([['#host', '#empty-link']])).toEqual({
      found: 1,
      nearest: 1,
      notVisible: 0,
    });
    expect(outlined('#host')).toContain('solid');
  });
});
