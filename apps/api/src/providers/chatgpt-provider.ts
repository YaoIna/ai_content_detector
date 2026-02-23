import type { DetectProviderResult } from './types';

type ChatgptProviderConfig = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
};

function requireChatgptApiKey(apiKey?: string) {
  if (!apiKey) {
    throw new Error('ChatGPT API key is required for chatgpt provider');
  }
}

function normalizeProbability(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 50;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeSignals(value: unknown): string[] {
  if (!Array.isArray(value)) return ['Model-based heuristic assessment'];
  const list = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  return list.length > 0 ? list : ['Model-based heuristic assessment'];
}

function formatUpstreamError(endpoint: string, status: number, bodyText: string) {
  const compact = bodyText.replace(/\s+/g, ' ').slice(0, 600);
  return `ChatGPT upstream error: POST ${endpoint} -> ${status}; body=${compact}`;
}

export async function chatgptTextDetect(text: string, config: ChatgptProviderConfig): Promise<DetectProviderResult> {
  requireChatgptApiKey(config.apiKey);

  const baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
  const model = config.model ?? 'gpt-4.1-mini';
  const endpoint = `${baseUrl}/responses`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'You are an AI-content judge. Return strict JSON only: {"ai_probability": number, "signals": string[]}.'
            }
          ]
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: `Evaluate this text:\n${text}` }]
        }
      ]
    })
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(formatUpstreamError(endpoint, response.status, bodyText));
  }

  const payload = (await response.json()) as { output_text?: string };
  const raw = payload.output_text ?? '{}';
  const parsed = JSON.parse(raw) as { ai_probability?: number; signals?: string[] };

  return {
    aiProbability: normalizeProbability(parsed.ai_probability),
    signals: normalizeSignals(parsed.signals)
  };
}

export async function chatgptImageDetect(buffer: Buffer, config: ChatgptProviderConfig): Promise<DetectProviderResult> {
  requireChatgptApiKey(config.apiKey);

  const baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
  const model = config.model ?? 'gpt-4.1-mini';
  const endpoint = `${baseUrl}/responses`;
  const imageBase64 = buffer.toString('base64');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'You are an AI-image judge. Return strict JSON only: {"ai_probability": number, "signals": string[]}.'
            }
          ]
        },
        {
          role: 'user',
          content: [
            { type: 'input_text', text: 'Evaluate whether this image appears AI-generated.' },
            {
              type: 'input_image',
              image_url: `data:image/jpeg;base64,${imageBase64}`
            }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(formatUpstreamError(endpoint, response.status, bodyText));
  }

  const payload = (await response.json()) as { output_text?: string };
  const raw = payload.output_text ?? '{}';
  const parsed = JSON.parse(raw) as { ai_probability?: number; signals?: string[] };

  return {
    aiProbability: normalizeProbability(parsed.ai_probability),
    signals: normalizeSignals(parsed.signals)
  };
}
