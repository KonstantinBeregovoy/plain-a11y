import type { RunOptions } from 'axe-core';

/**
 * Options for every axe run.
 * - preload: false stops axe from downloading the page's styles and media.
 * - target-size (WCAG 2.2 AA, minimum clickable area) is off by default in axe,
 *   but the project targets WCAG 2.2 AA, so we switch it on.
 */
export const AXE_RUN_OPTIONS: RunOptions = {
  preload: false,
  rules: {
    'target-size': { enabled: true },
  },
};
