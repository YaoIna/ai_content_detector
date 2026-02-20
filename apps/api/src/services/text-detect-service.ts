import { detectTextWithProvider } from '../providers';
import { buildExplanation } from './explanation-service';

export async function detectText(input: string) {
  const providerResult = await detectTextWithProvider(input);
  const explanation = buildExplanation(providerResult);

  return {
    type: 'text' as const,
    ai_probability: providerResult.aiProbability,
    confidence_band: explanation.confidenceBand,
    explanations: explanation.explanations,
    disclaimer: explanation.disclaimer
  };
}
