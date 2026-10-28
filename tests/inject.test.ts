import { describe, expect, it, vi } from 'vitest';
import { ensureContentScript } from '../src/background/inject';

describe('ensureContentScript', () => {
  it('does not inject when the script already answers', async () => {
    const inject = vi.fn(async () => undefined);
    await ensureContentScript(7, { ping: async () => true, inject });
    expect(inject).not.toHaveBeenCalled();
  });

  it('injects when nothing listens in the tab (ping rejects)', async () => {
    const inject = vi.fn(async () => undefined);
    await ensureContentScript(7, {
      ping: async () => {
        throw new Error('Receiving end does not exist.');
      },
      inject,
    });
    expect(inject).toHaveBeenCalledExactlyOnceWith(7);
  });

  it('injects when the ping gets no valid answer', async () => {
    const inject = vi.fn(async () => undefined);
    await ensureContentScript(3, { ping: async () => false, inject });
    expect(inject).toHaveBeenCalledExactlyOnceWith(3);
  });

  it('passes an injection failure on to the caller', async () => {
    await expect(
      ensureContentScript(1, {
        ping: async () => false,
        inject: async () => {
          throw new Error('Cannot access contents of the page.');
        },
      }),
    ).rejects.toThrow('Cannot access contents');
  });
});
