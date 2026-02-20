import { detectTextWithProvider } from '../providers';
import type { DetectProvider } from '../providers/types';
import { buildExplanation } from './explanation-service';

export async function detectText(input: string, provider?: DetectProvider) {
  let rawText = input;

  try {
    const providerResult = await detectTextWithProvider(rawText, provider);
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
