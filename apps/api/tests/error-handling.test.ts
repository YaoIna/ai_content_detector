import request from 'supertest';
import { buildApp } from '../src/app';

it('returns 429 after too many requests', async () => {
  const app = buildApp();
  await app.ready();

  for (let i = 0; i < 15; i++) {
    await request(app.server)
      .post('/api/detect/text')
      .send({ text: 'This is long enough to pass schema validation for testing.' });
  }

  const res = await request(app.server)
    .post('/api/detect/text')
    .send({ text: 'This is long enough to pass schema validation for testing.' });

  expect(res.status).toBe(429);

  await app.close();
});
