export type Impact = 'minor' | 'moderate' | 'serious' | 'critical';

/** The minimal set of axe violation fields the rest of the code needs. */
export interface AxeViolationLike {
  id: string;
  help: string;
  impact?: Impact | null;
  nodes: readonly { target: readonly unknown[] }[];
}

/** One row of the popup list. */
export interface ViolationItem {
  id: string;
  help: string;
  impact: Impact | 'unknown';
  nodeCount: number;
  /** CSS selectors of elements that can be highlighted on the page. */
  targets: string[];
}

/**
 * From a target we only take a simple selector within a single document.
 * Selector chains for iframes and shadow DOM cannot be highlighted.
 */
function simpleSelector(target: readonly unknown[]): string | null {
  const [first] = target;
  return target.length === 1 && typeof first === 'string' ? first : null;
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
      const selector = simpleSelector(node.target);
      return selector === null ? [] : [selector];
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
