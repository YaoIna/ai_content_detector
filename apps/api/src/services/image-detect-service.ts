import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { detectImageWithProvider } from '../providers';
import type { DetectProvider } from '../providers/types';
import { buildExplanation } from './explanation-service';

export async function processImageAndCleanup(input: Buffer, provider?: DetectProvider) {
  const tempPath = path.join(tmpdir(), `ai-detector-${randomUUID()}.bin`);

  let cleaned = false;
  let aiProbability = 0;
  let signals: string[] = [];

  try {
    await fs.writeFile(tempPath, input);

    const providerResult = await detectImageWithProvider(input, provider);
    aiProbability = providerResult.aiProbability;
    signals = providerResult.signals;
  } finally {
    await fs.rm(tempPath, { force: true });
    cleaned = true;
  }

  return {
    tempPath,
    cleaned,
    aiProbability,
    signals
  };
}

export async function detectImage(input: Buffer, provider?: DetectProvider) {
  const processing = await processImageAndCleanup(input, provider);
  const explanation = buildExplanation({
    aiProbability: processing.aiProbability,
    signals: processing.signals
  });

  return {
    type: 'image' as const,
    ai_probability: processing.aiProbability,
    confidence_band: explanation.confidenceBand,
    explanations: explanation.explanations,
    disclaimer: explanation.disclaimer
  };
}
