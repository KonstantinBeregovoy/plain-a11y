export type Impact = 'minor' | 'moderate' | 'serious' | 'critical';

/** Минимальный набор полей нарушения axe, который нужен остальному коду. */
export interface AxeViolationLike {
  id: string;
  help: string;
  impact?: Impact | null;
  nodes: readonly { target: readonly unknown[] }[];
}

/** Строка списка в popup. */
export interface ViolationItem {
  id: string;
  help: string;
  impact: Impact | 'unknown';
  nodeCount: number;
  /** CSS-селекторы элементов, которые можно подсветить на странице. */
  targets: string[];
}

/**
 * Из target берём только простой селектор в одном документе.
 * Цепочки для iframe и shadow DOM подсветить нельзя.
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
