import { detectTextWithProvider } from '../providers';

export async function detectText(input: string) {
  const providerResult = await detectTextWithProvider(input);

  return {
    type: 'text' as const,
    ai_probability: providerResult.aiProbability,
    explanations: providerResult.signals,
    disclaimer: 'Detection results are advisory only.'
  };
}
