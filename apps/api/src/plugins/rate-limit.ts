import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ApiError } from '../errors/api-error';

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;

type Bucket = {
  count: number;
  windowStart: number;
};

const buckets = new Map<string, Bucket>();

function requestKey(request: FastifyRequest) {
  return request.ip || 'global';
}

export function registerRateLimit(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    const now = Date.now();
    const key = requestKey(request);
    const current = buckets.get(key);

    if (!current || now - current.windowStart >= WINDOW_MS) {
      buckets.set(key, { count: 1, windowStart: now });
      return;
    }

    if (current.count >= MAX_REQUESTS) {
      throw new ApiError(429, 'RATE_LIMITED', 'Too many requests');
    }

    current.count += 1;
    buckets.set(key, current);
  });
}
