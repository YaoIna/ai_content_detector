import { detectTextWithProvider } from '../src/providers';

it('returns normalized score range', async () => {
  const result = await detectTextWithProvider('sample text content for test');
  expect(result.aiProbability).toBeGreaterThanOrEqual(0);
  expect(result.aiProbability).toBeLessThanOrEqual(100);
});
