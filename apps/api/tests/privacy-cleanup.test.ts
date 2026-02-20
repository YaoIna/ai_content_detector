import { processImageAndCleanup } from '../src/services/image-detect-service';

it('removes temp file after processing', async () => {
  const out = await processImageAndCleanup(Buffer.from('abc'));

  expect(out.cleaned).toBe(true);
  expect(out.tempPath).toBeDefined();
});
