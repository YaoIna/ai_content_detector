import { useState } from 'react';
import ImageUploadPanel from './components/ImageUploadPanel';
import ResultCard from './components/ResultCard';
import TextInputPanel from './components/TextInputPanel';
import { detectImage, detectText, type DetectResult } from './lib/api';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectResult | null>(null);

  async function handleTextSubmit(text: string) {
    setLoading(true);
    try {
      setResult(await detectText(text));
    } finally {
      setLoading(false);
    }
  }

  async function handleImageSubmit(file: File) {
    setLoading(true);
    try {
      setResult(await detectImage(file));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>AI 内容鉴别</h1>
      <TextInputPanel onSubmit={handleTextSubmit} disabled={loading} />
      <ImageUploadPanel onSubmit={handleImageSubmit} disabled={loading} />
      <ResultCard result={result} />
    </main>
  );
}
