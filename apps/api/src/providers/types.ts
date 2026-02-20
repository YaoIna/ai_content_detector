export interface DetectProviderResult {
  aiProbability: number;
  signals: string[];
}

export interface DetectProvider {
  detectText(input: string): Promise<DetectProviderResult>;
}
