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


describe('ограничения пакета', () => {
  it('в манифесте только activeTab, scripting, storage и нет host_permissions', async () => {
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

  it('в исходниках нет сетевых вызовов и удалённо загружаемого кода', () => {
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

  it('axe-core не скачивает ресурсы страницы (preload: false)', () => {
    const content = readFileSync('src/content/index.ts', 'utf8');
    expect(content).toMatch(/axe\s*\.run\(document,\s*\{\s*preload:\s*false\s*\}\)/);
  });

  it('версия axe-core закреплена точным номером', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      dependencies: Record<string, string>;
    };
    expect(pkg.dependencies['axe-core']).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
