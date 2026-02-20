import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import type { DetectProvider } from './providers/types';
import { mapError } from './errors/api-error';
import { registerRateLimit } from './plugins/rate-limit';
import { textDetectSchema } from './schemas/detect';
import { detectImage } from './services/image-detect-service';
import { detectText } from './services/text-detect-service';

type BuildAppOptions = {
  provider?: DetectProvider;
};

export function buildApp(options: BuildAppOptions = {}) {
  const app = Fastify();

  app.setErrorHandler((error, _request, reply) => {
    const mapped = mapError(error);
    return reply.status(mapped.statusCode).send(mapped.payload);
  });

  app.register(multipart);
  registerRateLimit(app);

  app.get('/health', async () => ({ status: 'ok' }));

  app.post('/api/detect/text', async (request, reply) => {
    const parsed = textDetectSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const result = await detectText(parsed.data.text, options.provider);
    return reply.send(result);
  });

  app.post('/api/detect/image', async (request, reply) => {
    const file = await request.file();

    if (!file || file.fieldname !== 'image_file') {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const buffer = await file.toBuffer();
    const result = await detectImage(buffer, options.provider);
    return reply.send(result);
  });

  return app;
}
