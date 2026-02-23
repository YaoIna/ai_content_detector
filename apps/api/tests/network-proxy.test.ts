import { describe, expect, it } from 'vitest';
import { resolveOutgoingProxy } from '../src/proxy-config';

describe('resolveOutgoingProxy', () => {
  it('prefers CHATGPT_PROXY_URL when provided', () => {
    const result = resolveOutgoingProxy({
      CHATGPT_PROXY_URL: 'http://127.0.0.1:9999',
      HTTPS_PROXY: 'http://127.0.0.1:7003'
    });

    expect(result).toBe('http://127.0.0.1:9999');
  });

  it('falls back to HTTPS_PROXY and HTTP_PROXY', () => {
    expect(resolveOutgoingProxy({ HTTPS_PROXY: 'http://127.0.0.1:7003' })).toBe('http://127.0.0.1:7003');
    expect(resolveOutgoingProxy({ HTTP_PROXY: 'http://127.0.0.1:7003' })).toBe('http://127.0.0.1:7003');
  });

  it('defaults to local vpn http proxy', () => {
    expect(resolveOutgoingProxy({})).toBe('http://127.0.0.1:7003');
  });

  it('returns null when disabled explicitly', () => {
    expect(resolveOutgoingProxy({ CHATGPT_PROXY_ENABLED: 'false' })).toBeNull();
  });
});
