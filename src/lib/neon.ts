import { createClient } from '@neondatabase/neon-js';

function normalizeNeonUrl(url: string) {
  const trimmedUrl = url.trim();
  const extractedUrl = trimmedUrl.match(/https?:\/\/\S+/)?.[0] || trimmedUrl;

  return extractedUrl.replace('.neon.build/', '.neon.tech/');
}

const neonAuthUrl = normalizeNeonUrl(import.meta.env.VITE_NEON_AUTH_URL || '');
const neonDataApiUrl = normalizeNeonUrl(import.meta.env.VITE_NEON_DATA_API_URL || '');

export const supabase = createClient({
  auth: {
    url: neonAuthUrl,
  },
  dataApi: {
    url: neonDataApiUrl,
  },
});

// Helper para verificar auth
export const getCurrentUser = () => supabase.auth.getSession();

// Helper para session
export const getSession = () => supabase.auth.getSession();
