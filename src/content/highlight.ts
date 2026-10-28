import type { HighlightTarget } from '../report/violations';

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
      if (style !== null) {
        element.setAttribute('style', style);
        continue;
      }
      element.removeAttribute('style');
      // After inline style changes made through the CSSOM, Chrome can leave an
      // empty style="" behind. Reading the attribute syncs it, then we drop it.
      if (element.getAttribute('style') === '') element.removeAttribute('style');
    }
    saved = [];
  }

  /** Resolves one target. A path goes through open shadow roots, one selector per level. */
  function resolve(target: HighlightTarget): Element[] {
    const path = typeof target === 'string' ? [target] : target;
    let scopes: ParentNode[] = [doc];
    let found: Element[] = [];
    for (const selector of path) {
      found = scopes.flatMap((scope) => [...scope.querySelectorAll(selector)]);
      // Closed shadow roots are not reachable: such hosts yield no scope, so the next level finds nothing.
      scopes = found.flatMap((host) => (host.shadowRoot ? [host.shadowRoot] : []));
    }
    return found;
  }

  function find(targets: readonly HighlightTarget[]): Element[] {
    const found = new Set<Element>();
    for (const target of targets) {
      try {
        resolve(target).forEach((element) => found.add(element));
      } catch {
        // Skip selectors the browser cannot parse.
      }
    }
    return [...found];
  }

  /** Highlights elements and scrolls to the first one. Returns how many were found. */
  function show(targets: readonly HighlightTarget[]): number {
    clear();
    const elements = find(targets).filter(hasInlineStyle);
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
