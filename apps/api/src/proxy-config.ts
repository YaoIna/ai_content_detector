type ProxyEnv = Record<string, string | undefined>;

const DEFAULT_CHATGPT_PROXY = 'http://127.0.0.1:7003';

function isDisabled(env: ProxyEnv): boolean {
  const raw = env.CHATGPT_PROXY_ENABLED?.trim().toLowerCase();
  return raw === 'false' || raw === '0' || raw === 'off';
}

export function resolveOutgoingProxy(env: ProxyEnv = process.env): string | null {
  if (isDisabled(env)) return null;

  return (
    env.CHATGPT_PROXY_URL?.trim() ||
    env.HTTPS_PROXY?.trim() ||
    env.HTTP_PROXY?.trim() ||
    DEFAULT_CHATGPT_PROXY
  );
}
