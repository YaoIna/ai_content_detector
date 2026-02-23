import path from 'node:path';
import { config } from 'dotenv';
import { buildApp } from './app';
import { setupOutgoingProxy } from './network-proxy';

// pnpm --filter runs this package with cwd at apps/api, so move two levels up to project root.
config({ path: path.resolve(process.cwd(), '../../.env') });

const activeProxy = setupOutgoingProxy();
if (activeProxy) {
  console.log(`[proxy] outgoing requests via ${activeProxy}`);
}

const app = buildApp();

app.listen({ port: 3000, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
