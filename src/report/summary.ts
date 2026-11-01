import type { ViolationItem } from './violations';

/** How many elements and how many kinds of problem a list holds. */
export interface GroupCount {
  elements: number;
  kinds: number;
}

/** The three groups of a result, counted the same way for the popup and the icon. */
export interface ResultSummary {
  issues: GroupCount;
  review: GroupCount;
  aaa: GroupCount;
}

function countGroup(list: readonly ViolationItem[]): GroupCount {
  return {
    elements: list.reduce((sum, item) => sum + item.nodeCount, 0),
    kinds: list.length,
  };
}

export function summarize(result: {
  items: readonly ViolationItem[];
  review: readonly ViolationItem[];
  aaa: readonly ViolationItem[];
}): ResultSummary {
  return {
    issues: countGroup(result.items),
    review: countGroup(result.review),
    aaa: countGroup(result.aaa),
  };
}

const kinds = (count: number) => `${count} ${count === 1 ? 'kind' : 'kinds'}`;

/** The one-line summary of the popup: elements first, kinds of problem in brackets. */
export function summaryLine(summary: ResultSummary): string {
  const { issues, review, aaa } = summary;
  const parts = [
    issues.elements === 0
      ? 'No issues found.'
      : `Issues found: ${issues.elements} (${kinds(issues.kinds)}).`,
  ];
  if (review.elements > 0) {
    parts.push(`Needs manual review: ${review.elements} (${kinds(review.kinds)}).`);
  }
  if (aaa.elements > 0) {
    parts.push(`AAA recommendations: ${aaa.elements} (${kinds(aaa.kinds)}).`);
  }
  return parts.join(' ');
}
