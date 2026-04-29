import { createClient } from '@neondatabase/neon-js';

const neonAuthUrl = import.meta.env.VITE_NEON_AUTH_URL || '';
const neonDataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL || '';

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