import type { DetectProviderResult } from './types';

export async function fakeTextDetect(text: string): Promise<DetectProviderResult> {
  const aiProbability = Math.min(100, Math.max(0, text.length % 101));
  return {
    aiProbability,
    signals: ['repetitive structure']
  };
}
