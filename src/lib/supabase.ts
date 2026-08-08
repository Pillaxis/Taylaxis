/**
 * Taylaxis Supabase Client Architecture
 * Safe fallback implementation for Cloud Auth & Database sync
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseConfig = {
  url: supabaseUrl,
  hasKey: Boolean(supabaseAnonKey),
};
