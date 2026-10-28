import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import config from '../wxt.config';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

const SOURCES = sourceFiles('src').filter((path) => /\.(ts|tsx|html)$/.test(path));


describe('package constraints', () => {
  it('declares only activeTab, scripting and storage and no host_permissions', async () => {
    expect(typeof config.manifest).not.toBe('function');
    const manifest =
      typeof config.manifest === 'function' ? undefined : await config.manifest;
    expect(manifest).toBeDefined();
    expect([...(manifest?.permissions ?? [])].sort()).toEqual([
      'activeTab',
      'scripting',
      'storage',
    ]);
    expect(manifest?.host_permissions).toBeUndefined();
  });

  it('has no network calls or remotely loaded code in the sources', () => {
    expect(SOURCES.length).toBeGreaterThan(5);
    const forbidden = [
      /\bfetch\s*\(/,
      /XMLHttpRequest/,
      /WebSocket/,
      /sendBeacon/,
      /EventSource/,
      /importScripts/,
      /\beval\s*\(/,
      /new Function/,
      /<script[^>]+src=["']https?:/,
    ];
    for (const path of SOURCES) {
      const text = readFileSync(path, 'utf8');
      for (const pattern of forbidden) {
        expect(text, `${path}: ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it('does not let axe-core download page resources (preload: false)', () => {
    const content = readFileSync('src/content/index.ts', 'utf8');
    expect(content).toMatch(/axe\s*\.run\(document,\s*\{\s*preload:\s*false\s*\}\)/);
  });

  it('pins the axe-core version to an exact number', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      dependencies: Record<string, string>;
    };
    expect(pkg.dependencies['axe-core']).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('keeps the project language English: no Cyrillic in sources, tests or docs', () => {
    const files = [
      ...sourceFiles('src').filter((path) => !path.endsWith('.png')),
      ...sourceFiles('tests'),
      ...sourceFiles('scripts'),
      'README.md',
      'PRIVACY.md',
      'store/listing.md',
      'docs/a11y-checklist.md',
      'docs/ROADMAP.md',
      'package.json',
      'wxt.config.ts',
    ];
    for (const path of files) {
      expect(readFileSync(path, 'utf8'), path).not.toMatch(/[\u0400-\u04FF]/);
    }
  });
});
