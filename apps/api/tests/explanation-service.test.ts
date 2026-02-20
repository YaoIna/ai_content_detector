import { buildExplanation } from '../src/services/explanation-service';

it('returns cautious user-facing reasons', () => {
  const out = buildExplanation({ aiProbability: 78, signals: ['uniform phrasing'] });

  expect(out.explanations[0]).toContain('可能');
  expect(out.confidenceBand).toBe('high');
});
