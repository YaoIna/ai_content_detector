import { ApiError } from '../errors/api-error';
import type { DetectProviderResult } from './types';

type ChatgptProviderConfig = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
};

type ParsedJudgeOutput = {
  ai_probability?: number;
  signals?: string[];
};

type ResponsesApiOutputItem = {
  type?: string;
  content?: Array<{
    type?: string;
    text?: string;
  }>;
};

type ResponsesApiPayload = {
  output_text?: string;
  output?: ResponsesApiOutputItem[];
};

function requireChatgptApiKey(apiKey?: string) {
  if (!apiKey) {
    throw new ApiError(500, 'PROVIDER_CONFIG_ERROR', 'ChatGPT API key is required for chatgpt provider');
  }
}

function normalizeProbability(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return 50;

  const normalized = numeric >= 0 && numeric <= 1 ? numeric * 100 : numeric;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function normalizeSignals(value: unknown): string[] {
  if (!Array.isArray(value)) return ['Model-based heuristic assessment'];
  const list = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  return list.length > 0 ? list : ['Model-based heuristic assessment'];
}

function logRawResponse(endpoint: string, status: number, bodyText: string) {
  console.info(`[chatgpt][raw-response] endpoint=${endpoint} status=${status} body=${bodyText}`);
}

async function readAndLogRawResponse(response: Response, endpoint: string): Promise<string> {
  const bodyText = await response.text();
  logRawResponse(endpoint, response.status, bodyText);
  return bodyText;
}

function parseUpstreamErrorPayload(rawPayload: string): unknown {
  try {
    return JSON.parse(rawPayload);
  } catch {
    return { error: rawPayload };
  }
}

function stripJsonCodeFence(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

function parseJudgeOutputJson(value: string): ParsedJudgeOutput {
  const candidate = stripJsonCodeFence(value);

  try {
    return JSON.parse(candidate) as ParsedJudgeOutput;
  } catch {
    const objectLike = candidate.match(/\{[\s\S]*\}/)?.[0];
    if (!objectLike) return {};

    try {
      return JSON.parse(objectLike) as ParsedJudgeOutput;
    } catch {
      return {};
    }
  }
}

function extractOutputText(payload: ResponsesApiPayload): string {
  if (typeof payload.output_text === 'string' && payload.output_text.trim().length > 0) {
    return payload.output_text;
  }

  if (!Array.isArray(payload.output)) return '{}';

  for (const item of payload.output) {
    if (!Array.isArray(item.content)) continue;

    for (const content of item.content) {
      if (content.type === 'output_text' && typeof content.text === 'string' && content.text.trim().length > 0) {
        return content.text;
      }
    }
  }

  return '{}';
}

function parseDetectionFromRawPayload(rawPayload: string): ParsedJudgeOutput {
  let payload: ResponsesApiPayload;

  try {
    payload = JSON.parse(rawPayload) as ResponsesApiPayload;
  } catch {
    return {};
  }

  const outputText = extractOutputText(payload);
  return parseJudgeOutputJson(outputText);
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

  const rawPayload = await readAndLogRawResponse(response, endpoint);

  if (!response.ok) {
    throw new ApiError(502, 'UPSTREAM_ERROR', 'Upstream provider request failed', parseUpstreamErrorPayload(rawPayload));
  }

  const parsed = parseDetectionFromRawPayload(rawPayload);

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

  const rawPayload = await readAndLogRawResponse(response, endpoint);

  if (!response.ok) {
    throw new ApiError(502, 'UPSTREAM_ERROR', 'Upstream provider request failed', parseUpstreamErrorPayload(rawPayload));
  }

  const parsed = parseDetectionFromRawPayload(rawPayload);

  return {
    aiProbability: normalizeProbability(parsed.ai_probability),
    signals: normalizeSignals(parsed.signals)
  };
}
