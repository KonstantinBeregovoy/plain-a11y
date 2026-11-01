import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { AXE_RUN_OPTIONS } from '../src/content/axeOptions';
import config from '../wxt.config';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}

const SOURCES = sourceFiles('src').filter((path) => /\.(ts|tsx|html)$/.test(path));


describe('release texts', () => {
  it('uses the short description of the store listing as the manifest description, within the store limit', async () => {
    const manifest =
      typeof config.manifest === 'function' ? undefined : await config.manifest;
    const section = readFileSync('store/listing.md', 'utf8').split('## Short description')[1]?.split('\n## ')[0] ?? '';
    const [, text] = section.split('\n\n').map((paragraph) => paragraph.trim());
    expect(text).toBeTruthy();
    expect(manifest?.description).toBe(text);
    expect((text ?? '').length).toBeLessThanOrEqual(132);
  });

  it('keeps the privacy policy in step with what the extension keeps: the number on the icon and the last result of a tab', () => {
    const policy = readFileSync('PRIVACY.md', 'utf8');
    expect(policy).toContain('**Number on the icon.**');
    expect(policy).toMatch(/does not save it and does not send it/);
    expect(policy).toMatch(/yellow mark/);
    expect(policy).toContain('**Last result of a tab.**');
    expect(policy).toContain('chrome.storage.session');
    expect(policy).toMatch(/removed when the tab loads another page, when the tab is closed and when the browser is closed/);
  });

  it('says the same about the kept result in the store text, with no promise that nothing is stored', () => {
    const listing = readFileSync('store/listing.md', 'utf8');
    expect(listing).toContain('storage.session');
    expect(listing).toMatch(/yellow mark/);
    expect(readFileSync('PRIVACY.md', 'utf8')).not.toMatch(/are not sent anywhere and are not stored/);
  });
});

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
    expect(content).toMatch(/axe\s*\.run\(document,\s*AXE_RUN_OPTIONS\)/);
    expect(AXE_RUN_OPTIONS.preload).toBe(false);
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
      'docs/PROJECT_LOG.md',
      'LICENSE',
      'THIRD_PARTY_NOTICES.md',
      'package.json',
      'wxt.config.ts',
    ];
    for (const path of files) {
      expect(readFileSync(path, 'utf8'), path).not.toMatch(/[\u0400-\u04FF]/);
    }
  });
});

describe('license files', () => {
  it('has an MIT license held by the author, in the repository and in the extension package', () => {
    const license = readFileSync('LICENSE', 'utf8');
    expect(license).toContain('MIT License');
    expect(license).toContain('Copyright (c) 2026 Konstantin Beregovoy');
    expect(readFileSync('src/public/LICENSE', 'utf8')).toBe(license);
  });

  it('declares the license and the author in package.json', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      license: string;
      author: string;
    };
    expect(pkg.license).toBe('MIT');
    expect(pkg.author).toBe('Konstantin Beregovoy');
  });

  it('ships the notices for bundled libraries and the full axe-core license text', () => {
    const notices = readFileSync('THIRD_PARTY_NOTICES.md', 'utf8');
    expect(readFileSync('src/public/THIRD_PARTY_NOTICES.md', 'utf8')).toBe(notices);
    expect(notices).toContain('axe-core');
    expect(notices).toContain('MPL-2.0');
    expect(notices).toContain('https://github.com/dequelabs/axe-core');
    expect(notices).toContain('MIT License');
    const mpl = readFileSync('src/public/licenses/axe-core-MPL-2.0.txt', 'utf8');
    expect(mpl).toContain('Mozilla Public License, version 2.0');
  });

  it('keeps the axe-core version in the notices equal to the pinned one', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as {
      dependencies: Record<string, string>;
    };
    const version = pkg.dependencies['axe-core'] ?? '';
    expect(readFileSync('THIRD_PARTY_NOTICES.md', 'utf8')).toContain(`axe-core ${version}`);
  });
});
