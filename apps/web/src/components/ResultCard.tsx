import type { DetectResult } from '../lib/api';

type Props = {
  result: DetectResult | null;
};

export default function ResultCard({ result }: Props) {
  if (!result) {
    return <p>检测结果仅供参考，不构成绝对判定。</p>;
  }

  return (
    <section>
      <h2>AI Probability: {result.ai_probability}%</h2>
      <ul>
        {result.explanations.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p>{result.disclaimer}</p>
    </section>
  );
}
