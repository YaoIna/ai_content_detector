export type DetectionType = 'text' | 'image';

export type ConfidenceBand = 'low' | 'medium' | 'high';

export interface DetectResult {
  type: DetectionType;
  ai_probability: number;
  confidence_band: ConfidenceBand;
  explanations: string[];
  disclaimer: string;
  request_id: string;
  processed_at: string;
}
