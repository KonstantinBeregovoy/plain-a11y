const OUTLINE_COLOR = '#d93025';

interface SavedStyle {
  element: Element & ElementCSSInlineStyle;
  /** Исходное значение атрибута style, null если атрибута не было. */
  style: string | null;
}

function hasInlineStyle(
  element: Element,
): element is Element & ElementCSSInlineStyle {
  return 'style' in element;
}

/**
 * Подсветка элементов временным контуром. Меняет только inline-style,
 * а при снятии возвращает атрибут к исходному значению.
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
        // Селектор, который браузер не понимает, пропускаем.
      }
    }
    return [...found];
  }

  /** Подсвечивает элементы, прокручивает к первому. Возвращает число найденных. */
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
