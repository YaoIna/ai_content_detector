import path from 'node:path';
import request from 'supertest';
import { buildApp } from '../src/app';

it('returns probability and explanations for image upload', async () => {
  const app = buildApp();
  await app.ready();

  const res = await request(app.server)
    .post('/api/detect/image')
    .attach('image_file', path.resolve(__dirname, 'fixtures/sample.jpg'));

  expect(res.status).toBe(200);
  expect(res.body.type).toBe('image');
  expect(res.body).toHaveProperty('ai_probability');
  expect(Array.isArray(res.body.explanations)).toBe(true);

  await app.close();
});
