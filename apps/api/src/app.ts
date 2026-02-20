import Fastify from 'fastify';
import { textDetectSchema } from './schemas/detect';
import { detectText } from './services/text-detect-service';

export function buildApp() {
  const app = Fastify();

  app.get('/health', async () => ({ status: 'ok' }));

  app.post('/api/detect/text', async (request, reply) => {
    const parsed = textDetectSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid input' });
    }

    const result = await detectText(parsed.data.text);
    return reply.send(result);
  });

  return app;
}
