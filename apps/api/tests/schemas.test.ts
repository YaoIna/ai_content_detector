import { textDetectSchema } from '../src/schemas/detect';

describe('text schema', () => {
  it('rejects empty input', () => {
    const parsed = textDetectSchema.safeParse({ text: '' });
    expect(parsed.success).toBe(false);
  });
});
