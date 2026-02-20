import path from 'node:path';
import request from 'supertest';
import { buildApp } from '../src/app';
import type { DetectProvider } from '../src/providers/types';

it('returns normalized response contract with injected provider for image', async () => {
  const mockProvider: DetectProvider = {
    async detectText() {
      return { aiProbability: 55, signals: ['unused'] };
    },
    async detectImage() {
      return { aiProbability: 12, signals: ['pixel pattern'] };
    }
  };

  const app = buildApp({ provider: mockProvider });
  await app.ready();

  const res = await request(app.server)
    .post('/api/detect/image')
    .attach('image_file', path.resolve(__dirname, 'fixtures/sample.jpg'));

  expect(res.status).toBe(200);
  expect(res.body.type).toBe('image');
  expect(res.body.ai_probability).toBe(12);
  expect(res.body.confidence_band).toBe('low');
  expect(Array.isArray(res.body.explanations)).toBe(true);

  await app.close();
});
