type ProxyEnv = Record<string, string | undefined>;

function isDisabled(env: ProxyEnv): boolean {
  const raw = env.CHATGPT_PROXY_ENABLED?.trim().toLowerCase();
  return raw === 'false' || raw === '0' || raw === 'off';
}

export function resolveOutgoingProxy(env: ProxyEnv = process.env): string | null {
  if (isDisabled(env)) return null;

  return (
    env.CHATGPT_PROXY_URL?.trim() ?? null
  );
}
