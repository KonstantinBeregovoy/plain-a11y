const OUTLINE_COLOR = '#d93025';

interface SavedStyle {
  element: Element & ElementCSSInlineStyle;
  /** Original value of the style attribute, null if there was none. */
  style: string | null;
}

function hasInlineStyle(
  element: Element,
): element is Element & ElementCSSInlineStyle {
  return 'style' in element;
}

/**
 * Highlights elements with a temporary outline. Only touches inline style
 * and restores the attribute to its original value on clear.
 */
export function createHighlighter(doc: Document) {
  let saved: SavedStyle[] = [];

  function clear(): void {
    for (const { element, style } of saved) {
      if (style === null) element.removeAttribute('style');
      else element.setAttribute('style', style);
    }
    saved = [];
  }

  function find(selectors: readonly string[]): Element[] {
    const found = new Set<Element>();
    for (const selector of selectors) {
      try {
        doc.querySelectorAll(selector).forEach((element) => found.add(element));
      } catch {
        // Skip selectors the browser cannot parse.
      }
    }
    return [...found];
  }

  /** Highlights elements and scrolls to the first one. Returns how many were found. */
  function show(selectors: readonly string[]): number {
    clear();
    const elements = find(selectors).filter(hasInlineStyle);
    for (const element of elements) {
      saved.push({ element, style: element.getAttribute('style') });
      element.style.setProperty('outline', `3px solid ${OUTLINE_COLOR}`, 'important');
      element.style.setProperty('outline-offset', '2px', 'important');
    }
    const [first] = elements;
    if (first && typeof first.scrollIntoView === 'function') {
      const reduceMotion =
        doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)')
          .matches ?? false;
      first.scrollIntoView({
        block: 'center',
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    }
    return elements.length;
  }

  return { show, clear };
}
