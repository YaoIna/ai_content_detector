import { ProxyAgent, setGlobalDispatcher } from 'undici';
import { resolveOutgoingProxy } from './proxy-config';

type ProxyEnv = Record<string, string | undefined>;

export { resolveOutgoingProxy };

export function setupOutgoingProxy(env: ProxyEnv = process.env): string | null {
  const proxyUrl = resolveOutgoingProxy(env);
  if (!proxyUrl) return null;

  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  return proxyUrl;
}
