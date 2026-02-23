import { describe, expect, it } from 'vitest';
import { resolveOutgoingProxy } from '../src/proxy-config';

describe('resolveOutgoingProxy', () => {
  it('uses CHATGPT_PROXY_URL when provided', () => {
    const result = resolveOutgoingProxy({
      CHATGPT_PROXY_URL: 'http://127.0.0.1:7003',
      HTTPS_PROXY: 'http://127.0.0.1:9999'
    });

    expect(result).toBe('http://127.0.0.1:7003');
  });

  it('returns null when CHATGPT_PROXY_URL is not set', () => {
    expect(resolveOutgoingProxy({ HTTPS_PROXY: 'http://127.0.0.1:7003' })).toBeNull();
    expect(resolveOutgoingProxy({ HTTP_PROXY: 'http://127.0.0.1:7003' })).toBeNull();
    expect(resolveOutgoingProxy({})).toBeNull();
  });

  it('returns null when disabled explicitly', () => {
    expect(resolveOutgoingProxy({ CHATGPT_PROXY_ENABLED: 'false', CHATGPT_PROXY_URL: 'http://127.0.0.1:7003' })).toBeNull();
  });
});
