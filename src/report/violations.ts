export type Impact = 'minor' | 'moderate' | 'serious' | 'critical';

/** Минимальный набор полей нарушения axe, который нужен остальному коду. */
export interface AxeViolationLike {
  id: string;
  help: string;
  impact?: Impact | null;
  nodes: readonly unknown[];
}

/** Строка списка в popup. */
export interface ViolationItem {
  id: string;
  help: string;
  impact: Impact | 'unknown';
  nodeCount: number;
}

export function toViolationItems(
  violations: readonly AxeViolationLike[],
): ViolationItem[] {
  return violations.map((violation) => ({
    id: violation.id,
    help: violation.help,
    impact: violation.impact ?? 'unknown',
    nodeCount: violation.nodes.length,
  }));
}
