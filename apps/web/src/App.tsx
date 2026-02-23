import { useState } from 'react';
import ImageUploadPanel from './components/ImageUploadPanel';
import ResultCard from './components/ResultCard';
import TextInputPanel from './components/TextInputPanel';
import { detectImage, detectText, type DetectResult } from './lib/api';
import './App.css';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleTextSubmit(text: string) {
    setLoading(true);
    setError(null);
    try {
      setResult(await detectText(text));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Text detection failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleImageSubmit(file: File) {
    setLoading(true);
    setError(null);
    try {
      setResult(await detectImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image detection failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <p className="hero-kicker">AI Authenticity Desk</p>
        <h1>AI 内容鉴别</h1>
        <p className="hero-subtitle">上传文本或图片，快速获取 AI 生成概率与可读解释。</p>
      </header>

      {error ? <p className="error-banner">请求失败：{error}</p> : null}

      <section className="grid-layout">
        <div className="input-column">
          <article className="panel reveal">
            <h2>文本检测</h2>
            <p className="panel-note">建议粘贴完整段落，结果更稳定。</p>
            <TextInputPanel onSubmit={handleTextSubmit} disabled={loading} />
          </article>

          <article className="panel reveal delay-1">
            <h2>图片检测</h2>
            <p className="panel-note">支持常见图片格式，上传后立即处理。</p>
            <ImageUploadPanel onSubmit={handleImageSubmit} disabled={loading} />
          </article>
        </div>

        <aside className="result-column reveal delay-2">
          <h2>检测报告</h2>
          {loading ? (
            <div className="result-loading" role="status" aria-live="polite">
              <span className="loading-dot" aria-hidden="true" />
              <p>正在检测中...</p>
            </div>
          ) : null}
          <ResultCard result={result} />
        </aside>
      </section>
    </main>
  );
}
