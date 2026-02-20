import { detectImageWithProvider } from '../providers';
import { buildExplanation } from './explanation-service';

export async function detectImage(input: Buffer) {
  const providerResult = await detectImageWithProvider(input);
  const explanation = buildExplanation(providerResult);

  return {
    type: 'image' as const,
    ai_probability: providerResult.aiProbability,
    confidence_band: explanation.confidenceBand,
    explanations: explanation.explanations,
    disclaimer: explanation.disclaimer
  };
}
