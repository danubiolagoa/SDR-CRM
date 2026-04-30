export const OPENROUTER_MODEL = 'minimax/minimax-m2.7';

export function getOpenRouterApiKey() {
  const rawKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  const trimmedKey = rawKey.trim();
  const extractedKey = trimmedKey.match(/sk-or-v1-[^\s"'`]+/)?.[0] || trimmedKey;

  return extractedKey.replace(/[;,]+$/, '');
}

export function hasOpenRouterApiKey() {
  return getOpenRouterApiKey().length > 0;
}
