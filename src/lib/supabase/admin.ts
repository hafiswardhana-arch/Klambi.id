import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client (service_role). It bypasses Row Level Security,
 * so it must NEVER be imported from a client component and its key must never
 * be exposed with a NEXT_PUBLIC_ prefix.
 *
 * Returns null when the env vars are missing, so the app can fall back to its
 * built-in demo data instead of crashing.
 */
let cached: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!cached) {
    cached = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
