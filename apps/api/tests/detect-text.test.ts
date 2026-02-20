import request from 'supertest';
import { buildApp } from '../src/app';

it('returns probability and explanations for text', async () => {
  const app = buildApp();
  await app.ready();

  const res = await request(app.server)
    .post('/api/detect/text')
    .send({ text: 'This is a sufficiently long sample to pass validation.' });

  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('ai_probability');
  expect(Array.isArray(res.body.explanations)).toBe(true);

  await app.close();
});
