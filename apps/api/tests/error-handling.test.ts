import request from 'supertest';
import { buildApp } from '../src/app';
import { ApiError } from '../src/errors/api-error';

it('passes through api error payload to client', async () => {
  const upstreamPayload = {
    error: {
      message: 'You exceeded your current quota.',
      type: 'insufficient_quota',
      code: 'insufficient_quota'
    }
  };

  const app = buildApp({
    provider: {
      async detectText() {
        throw new ApiError(502, 'UPSTREAM_ERROR', 'Upstream provider request failed', upstreamPayload);
      },
      async detectImage() {
        return { aiProbability: 50, signals: ['n/a'] };
      }
    }
  });

  await app.ready();

  const res = await request(app.server)
    .post('/api/detect/text')
    .send({ text: 'This is long enough to pass schema validation for testing.' });

  expect(res.status).toBe(502);
  expect(res.body).toEqual(upstreamPayload);

  await app.close();
});

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
