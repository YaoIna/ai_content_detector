import { detectImageWithProvider } from '../providers';

export async function detectImage(input: Buffer) {
  const providerResult = await detectImageWithProvider(input);

  return {
    type: 'image' as const,
    ai_probability: providerResult.aiProbability,
    explanations: providerResult.signals,
    disclaimer: 'Detection results are advisory only.'
  };
}
