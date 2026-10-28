import type { RunOptions } from 'axe-core';

/**
 * AAA rules we run on purpose. They go beyond the AA level the project targets,
 * so their results are shown separately as optional recommendations.
 */
export const AAA_RULE_IDS: readonly string[] = [
  'color-contrast-enhanced',
  'identical-links-same-purpose',
  'meta-refresh-no-exceptions',
];

/**
 * Options for every axe run.
 * - preload: false stops axe from downloading the page's styles and media.
 * - target-size (WCAG 2.2 AA, minimum clickable area) is off by default in axe,
 *   but the project targets WCAG 2.2 AA, so we switch it on.
 * - The AAA rules are off by default in axe, we switch them on for the
 *   “AAA recommendations” block.
 */
export const AXE_RUN_OPTIONS: RunOptions = {
  preload: false,
  rules: {
    'target-size': { enabled: true },
    ...Object.fromEntries(AAA_RULE_IDS.map((id) => [id, { enabled: true }])),
  },
};
