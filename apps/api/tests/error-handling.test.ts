import request from 'supertest';
import { afterEach, beforeEach, it, expect } from 'vitest';
import { buildApp } from '../src/app';
import { ApiError } from '../src/errors/api-error';

const ORIGINAL_RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX;
const ORIGINAL_RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS;

beforeEach(() => {
  process.env.RATE_LIMIT_MAX = ORIGINAL_RATE_LIMIT_MAX;
  process.env.RATE_LIMIT_WINDOW_MS = ORIGINAL_RATE_LIMIT_WINDOW_MS;
});

afterEach(() => {
  process.env.RATE_LIMIT_MAX = ORIGINAL_RATE_LIMIT_MAX;
  process.env.RATE_LIMIT_WINDOW_MS = ORIGINAL_RATE_LIMIT_WINDOW_MS;
});

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

it('uses RATE_LIMIT_MAX from env', async () => {
  process.env.RATE_LIMIT_MAX = '1';
  process.env.RATE_LIMIT_WINDOW_MS = '60000';

  const app = buildApp();
  await app.ready();

  const first = await request(app.server)
    .post('/api/detect/text')
    .send({ text: 'This is long enough to pass schema validation for testing.' });

  const second = await request(app.server)
    .post('/api/detect/text')
    .send({ text: 'This is long enough to pass schema validation for testing.' });

  expect(first.status).toBe(200);
  expect(second.status).toBe(429);

  await app.close();
});
