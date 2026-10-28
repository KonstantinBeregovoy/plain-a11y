export type Impact = 'minor' | 'moderate' | 'serious' | 'critical';

/** The minimal set of axe violation fields the rest of the code needs. */
export interface AxeViolationLike {
  id: string;
  help: string;
  impact?: Impact | null;
  nodes: readonly { target: readonly unknown[] }[];
}

/**
 * Where to find an element that can be highlighted:
 * - a string is a CSS selector in the page document;
 * - an array of strings is a path through open shadow roots: the first selector
 *   is looked up in the document, each next one inside the shadow root of the
 *   element found by the previous one.
 */
export type HighlightTarget = string | string[];

/** One row of the popup list. */
export interface ViolationItem {
  id: string;
  help: string;
  impact: Impact | 'unknown';
  nodeCount: number;
  /** Elements of this problem that can be highlighted on the page. */
  targets: HighlightTarget[];
}

/**
 * From an axe target we take what can be highlighted: a simple selector or a
 * path through shadow roots, both within the page document. A target with more
 * than one entry points into an iframe, which cannot be reached from here.
 */
function highlightTarget(target: readonly unknown[]): HighlightTarget | null {
  if (target.length !== 1) return null;
  const [first] = target;
  if (typeof first === 'string') return first;
  if (
    Array.isArray(first) &&
    first.length > 0 &&
    first.every((part): part is string => typeof part === 'string')
  ) {
    return first;
  }
  return null;
}

export function toViolationItems(
  violations: readonly AxeViolationLike[],
): ViolationItem[] {
  return violations.map((violation) => ({
    id: violation.id,
    help: violation.help,
    impact: violation.impact ?? 'unknown',
    nodeCount: violation.nodes.length,
    targets: violation.nodes.flatMap((node) => {
      const found = highlightTarget(node.target);
      return found === null ? [] : [found];
    }),
  }));
}

/** What one axe run turns into: issues, cases to review by hand, and AAA recommendations. */
export interface CheckResult {
  items: ViolationItem[];
  review: ViolationItem[];
  aaa: ViolationItem[];
}

/**
 * Splits an axe result. AAA rules are optional recommendations, so their
 * violations go to `aaa`, and neither their violations nor their unclear cases
 * end up in the main list or in the manual-review list.
 */
export function buildCheckResult(
  results: {
    violations: readonly AxeViolationLike[];
    incomplete: readonly AxeViolationLike[];
  },
  aaaRuleIds: readonly string[],
): CheckResult {
  const isAaa = (rule: AxeViolationLike) => aaaRuleIds.includes(rule.id);
  return {
    items: toViolationItems(results.violations.filter((rule) => !isAaa(rule))),
    review: toViolationItems(results.incomplete.filter((rule) => !isAaa(rule))),
    aaa: toViolationItems(results.violations.filter(isAaa)),
  };
}
