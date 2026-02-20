import type { DetectResult } from '../lib/api';

type Props = {
  result: DetectResult | null;
};

export default function ResultCard({ result }: Props) {
  if (!result) {
    return (
      <section className="result-card empty">
        <p>检测结果仅供参考，不构成绝对判定。</p>
      </section>
    );
  }

  return (
    <section className="result-card">
      <p className="metric-label">AI 生成概率</p>
      <p className="metric-value">{result.ai_probability}%</p>
      <ul>
        {result.explanations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="disclaimer">{result.disclaimer}</p>
    </section>
  );
}
