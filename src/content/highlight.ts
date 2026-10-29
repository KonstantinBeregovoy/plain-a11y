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

/** What `show` did with the elements it found. */
export interface HighlightResult {
  /** Elements outlined (an ancestor counts once, even if several matches share it). */
  found: number;
  /** Matches that have no visible area, so their nearest visible ancestor is outlined instead. */
  nearest: number;
  /** Matches that are not visible on the page at all (hidden, or in the page head). */
  notVisible: number;
}

/** True if the element takes up visible space: an outline around it can be seen. */
function hasVisibleBox(element: Element): boolean {
  const { width, height } = element.getBoundingClientRect();
  return width > 1 && height > 1;
}

function parentOf(element: Element): Element | null {
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

/**
 * Highlights elements with a temporary outline. Only touches inline style
 * and restores the attribute to its original value on clear.
 */
export function createHighlighter(
  doc: Document,
  hasBox: (element: Element) => boolean = hasVisibleBox,
) {
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

  function isInBody(element: Element): boolean {
    for (let current: Element | null = element; current; current = parentOf(current)) {
      if (current === doc.body) return true;
    }
    return false;
  }

  /**
   * The element to outline for a match. A match with no visible area (an empty
   * link, a visually hidden element) gives its nearest ancestor that has one.
   * The page root and body are outlined as they are. Null if nothing visible is left.
   */
  function visibleFor(element: Element): Element | null {
    if (element === doc.documentElement || element === doc.body) return element;
    // Elements of the page head are never drawn, so there is nothing to outline.
    if (!isInBody(element)) return null;
    let candidate: Element | null = element;
    while (candidate && candidate !== doc.body && candidate !== doc.documentElement) {
      if (hasBox(candidate)) return candidate;
      candidate = parentOf(candidate);
    }
    return null;
  }

  /** Highlights elements and scrolls to the first one. */
  function show(targets: readonly HighlightTarget[]): HighlightResult {
    clear();
    let nearest = 0;
    let notVisible = 0;
    const visible = new Set<Element>();
    for (const match of find(targets)) {
      const element = visibleFor(match);
      if (!element) notVisible += 1;
      else {
        if (element !== match) nearest += 1;
        visible.add(element);
      }
    }
    const elements = [...visible].filter(hasInlineStyle);
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
    return { found: elements.length, nearest, notVisible };
  }

  return { show, clear };
}
