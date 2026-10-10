import { describe, expect, it } from 'vitest';
import { testHookEnabled } from '../../src/scene/testHook';

describe('test hook gating', () => {
  it('is installed in development builds', () => {
    expect(testHookEnabled('', true)).toBe(true);
  });

  it('is installed in production builds only with ?test', () => {
    expect(testHookEnabled('', false)).toBe(false);
    expect(testHookEnabled('?test', false)).toBe(true);
    expect(testHookEnabled('?foo=1&test=1', false)).toBe(true);
    expect(testHookEnabled('?testing', false)).toBe(false);
  });
});
