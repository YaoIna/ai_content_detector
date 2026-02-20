export function buildExplanation(input: { aiProbability: number; signals: string[] }) {
  const confidenceBand = input.aiProbability >= 70 ? 'high' : input.aiProbability >= 40 ? 'medium' : 'low';

  return {
    confidenceBand,
    explanations: input.signals.map((signal) => `可能依据：${signal}`),
    disclaimer: '检测结果仅供参考，不构成绝对判定。'
  };
}
