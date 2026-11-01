import { readBuiltManifest, TEST_HOST_PERMISSIONS, expect, test } from './harness';

test.describe('what the package may do', () => {
  test('the built manifest asks only for activeTab, scripting and storage, and no host access', () => {
    const manifest = readBuiltManifest();
    expect([...(manifest['permissions'] as string[])].sort()).toEqual(['activeTab', 'scripting', 'storage']);
    expect(manifest.host_permissions).toBeUndefined();
    expect(manifest['content_scripts']).toBeUndefined();
  });

  test('the copy used by these tests differs from the built manifest only by the host permission', async ({ tools }) => {
    const { host_permissions: added, ...rest } = tools.loadedManifest;
    expect(added).toEqual(TEST_HOST_PERMISSIONS);
    expect(rest).toEqual(readBuiltManifest());
  });

  test('a check makes no request except to the local pages and to the extension itself', async ({ tools }) => {
    const page = await tools.open('basic.html');
    const popup = await tools.popup();
    tools.requests.length = 0;
    await tools.check(page, popup);
    await tools.highlight(popup, (await tools.check(page, popup)).items.flatMap((item) => item.targets));
    await tools.clearHighlight(popup);
    const outside = tools.requests.filter(
      (url) => !url.startsWith(tools.baseUrl) && !url.startsWith('chrome-extension://') && !url.startsWith('data:'),
    );
    // The fixture page itself links to https://example.com, which is only a link and is not loaded.
    expect(outside).toEqual([]);
  });
});
