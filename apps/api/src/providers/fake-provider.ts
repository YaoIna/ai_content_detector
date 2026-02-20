import type { DetectProviderResult } from './types';

export async function fakeTextDetect(text: string): Promise<DetectProviderResult> {
  const aiProbability = Math.min(100, Math.max(0, text.length % 101));
  return {
    aiProbability,
    signals: ['repetitive structure']
  };
}

export async function fakeImageDetect(buffer: Buffer): Promise<DetectProviderResult> {
  const aiProbability = Math.min(100, Math.max(0, buffer.length % 101));
  return {
    aiProbability,
    signals: ['texture irregularity']
  };
}
