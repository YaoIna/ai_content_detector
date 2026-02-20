export type DetectResult = {
  type: 'text' | 'image';
  ai_probability: number;
  confidence_band?: 'low' | 'medium' | 'high';
  explanations: string[];
  disclaimer: string;
};

export async function detectText(text: string): Promise<DetectResult> {
  const response = await fetch('/api/detect/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error('Text detection failed');
  }

  return response.json();
}

export async function detectImage(file: File): Promise<DetectResult> {
  const formData = new FormData();
  formData.append('image_file', file);

  const response = await fetch('/api/detect/image', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Image detection failed');
  }

  return response.json();
}
