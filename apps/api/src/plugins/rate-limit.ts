import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ApiError } from '../errors/api-error';

const DEFAULT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_REQUESTS = 15;

type Bucket = {
  count: number;
  windowStart: number;
};

function requestKey(request: FastifyRequest) {
  return request.ip || 'global';
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function resolveRateLimitConfig(env: NodeJS.ProcessEnv = process.env) {
  return {
    windowMs: parsePositiveInt(env.RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS),
    maxRequests: parsePositiveInt(env.RATE_LIMIT_MAX, DEFAULT_MAX_REQUESTS)
  };
}

export function registerRateLimit(app: FastifyInstance) {
  const buckets = new Map<string, Bucket>();
  const config = resolveRateLimitConfig();

  app.addHook('onRequest', async (request) => {
    const now = Date.now();
    const key = requestKey(request);
    const current = buckets.get(key);

    if (!current || now - current.windowStart >= config.windowMs) {
      buckets.set(key, { count: 1, windowStart: now });
      return;
    }

    if (current.count >= config.maxRequests) {
      throw new ApiError(429, 'RATE_LIMITED', 'Too many requests');
    }

    current.count += 1;
    buckets.set(key, current);
  });
}
