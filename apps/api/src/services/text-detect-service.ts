import { detectTextWithProvider } from '../providers';
import { buildExplanation } from './explanation-service';

export async function detectText(input: string) {
  let rawText = input;

  try {
    const providerResult = await detectTextWithProvider(rawText);
    const explanation = buildExplanation(providerResult);

    return {
      type: 'text' as const,
      ai_probability: providerResult.aiProbability,
      confidence_band: explanation.confidenceBand,
      explanations: explanation.explanations,
      disclaimer: explanation.disclaimer
    };
  } finally {
    rawText = '';
  }
}
