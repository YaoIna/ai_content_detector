import request from 'supertest';
import { buildApp } from '../src/app';
import type { DetectProvider } from '../src/providers/types';

it('returns normalized response contract with injected provider for text', async () => {
  const mockProvider: DetectProvider = {
    async detectText() {
      return { aiProbability: 88, signals: ['synthetic cadence'] };
    },
    async detectImage() {
      return { aiProbability: 11, signals: ['unused'] };
    }
  };

  const app = buildApp({ provider: mockProvider });
  await app.ready();

  const res = await request(app.server)
    .post('/api/detect/text')
    .send({ text: 'This is a sufficiently long sample to pass validation.' });

  expect(res.status).toBe(200);
  expect(res.body.type).toBe('text');
  expect(res.body.ai_probability).toBe(88);
  expect(res.body.confidence_band).toBe('high');
  expect(Array.isArray(res.body.explanations)).toBe(true);

  await app.close();
});
