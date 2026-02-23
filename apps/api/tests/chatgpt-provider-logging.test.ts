import { afterEach, describe, expect, it, vi } from 'vitest';
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
});
