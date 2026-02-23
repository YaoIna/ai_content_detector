import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../src/errors/api-error';
import { chatgptTextDetect } from '../src/providers/chatgpt-provider';

describe('chatgpt provider raw response logging', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs raw upstream response body on success', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const rawPayload = JSON.stringify({ output_text: '{"ai_probability": 72, "signals": ["uniform style"]}' });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(rawPayload, {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    await chatgptTextDetect('This is a long enough sample text for provider logging test.', {
      apiKey: 'test-key'
    });

    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('[chatgpt][raw-response]'));
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining(rawPayload));
  });

  it('parses responses api message content payload', async () => {
    const rawPayload = JSON.stringify({
      output: [
        {
          type: 'message',
          role: 'assistant',
          content: [
            {
              type: 'output_text',
              text: '{"ai_probability": 83, "signals": ["repetitive phrasing", "uniform sentence rhythm"]}'
            }
          ]
        }
      ]
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(rawPayload, {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const result = await chatgptTextDetect('This is a long enough sample text for responses payload parsing test.', {
      apiKey: 'test-key'
    });

    expect(result.aiProbability).toBe(83);
    expect(result.signals).toEqual(['repetitive phrasing', 'uniform sentence rhythm']);
  });

  it('converts decimal probability to percent', async () => {
    const rawPayload = JSON.stringify({
      output_text: '{"ai_probability": 0.9, "signals": ["high coherence"]}'
    });

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(rawPayload, {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    const result = await chatgptTextDetect('This is a long enough sample text for decimal probability normalization test.', {
      apiKey: 'test-key'
    });

    expect(result.aiProbability).toBe(90);
  });

  it('throws unified ApiError and preserves upstream payload', async () => {
    const upstreamPayload = {
      error: {
        message: 'You exceeded your current quota.',
        type: 'insufficient_quota',
        code: 'insufficient_quota'
      }
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(upstreamPayload), {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );

    try {
      await chatgptTextDetect('This is a long enough sample text for upstream error normalization test.', {
        apiKey: 'test-key'
      });
      throw new Error('expected chatgptTextDetect to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;
      expect(apiError.statusCode).toBe(502);
      expect(apiError.code).toBe('UPSTREAM_ERROR');
      expect(apiError.payload).toEqual(upstreamPayload);
    }
  });
});
