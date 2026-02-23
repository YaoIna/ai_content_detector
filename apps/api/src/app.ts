import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { createProviderFromConfig, type ProviderKind } from './providers';
import { mapError } from './errors/api-error';
import { registerRateLimit } from './plugins/rate-limit';
import { textDetectSchema } from './schemas/detect';
import { detectImage } from './services/image-detect-service';
import { detectText } from './services/text-detect-service';
import type { DetectProvider } from './providers/types';

type BuildAppOptions = {
  provider?: DetectProvider;
};

function envProviderKind(value: string | undefined): ProviderKind {
  if (value === 'hive') return 'hive';
  if (value === 'chatgpt') return 'chatgpt';
  return 'fake';
}

function providerFromEnv() {
  return createProviderFromConfig({
    textProvider: envProviderKind(process.env.TEXT_PROVIDER),
    imageProvider: envProviderKind(process.env.IMAGE_PROVIDER),
    hiveApiKey: process.env.HIVE_API_KEY,
    chatgptApiKey: process.env.CHATGPT_API_KEY,
    chatgptBaseUrl: process.env.CHATGPT_BASE_URL,
    chatgptModel: process.env.CHATGPT_MODEL
  });
}

export function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify({ logger: true });
  const provider = options.provider ?? providerFromEnv();

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    const mapped = mapError(error);
    return reply.status(mapped.statusCode).send(mapped.payload);
  });

  app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024
    }
  });
  registerRateLimit(app);

  app.get('/health', async () => ({ status: 'ok' }));

  app.post('/api/detect/text', async (request, reply) => {
    const parsed = textDetectSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const result = await detectText(parsed.data.text, provider);
    return reply.send(result);
  });

  app.post('/api/detect/image', async (request, reply) => {
    const file = await request.file();

    if (!file || file.fieldname !== 'image_file') {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const buffer = await file.toBuffer();
    const result = await detectImage(buffer, provider);
    return reply.send(result);
  });

  return app;
}
