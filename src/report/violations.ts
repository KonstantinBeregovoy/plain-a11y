export type Impact = 'minor' | 'moderate' | 'serious' | 'critical';

/** Минимальный набор полей нарушения axe, который нужен остальному коду. */
export interface AxeViolationLike {
  id: string;
  impact?: Impact | null;
  nodes: readonly unknown[];
}

/** Строка списка в popup. */
export interface ViolationItem {
  id: string;
  impact: Impact | 'unknown';
  nodeCount: number;
}

export function toViolationItems(
  violations: readonly AxeViolationLike[],
): ViolationItem[] {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact ?? 'unknown',
    nodeCount: violation.nodes.length,
  }));
}
