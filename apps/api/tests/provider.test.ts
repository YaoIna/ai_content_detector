import { createProviderFromConfig, detectTextWithProvider } from '../src/providers';

it('returns normalized score range with default fake provider', async () => {
  const result = await detectTextWithProvider('sample text content for test');
  expect(result.aiProbability).toBeGreaterThanOrEqual(0);
  expect(result.aiProbability).toBeLessThanOrEqual(100);
});

it('uses hive skeleton for text when configured and fake for image fallback', async () => {
  const provider = createProviderFromConfig({
    textProvider: 'hive',
    imageProvider: 'fake',
    hiveApiKey: ''
  });

  await expect(provider.detectText('hello world')).rejects.toThrow(/hive api key/i);

  const imageResult = await provider.detectImage(Buffer.from('abc'));
  expect(imageResult.aiProbability).toBeGreaterThanOrEqual(0);
  expect(imageResult.aiProbability).toBeLessThanOrEqual(100);
});
