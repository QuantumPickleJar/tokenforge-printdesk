import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────
// Supabase Client
// ─────────────────────────────────────────────
// Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from environment.
// Both variables must be set in .env (copied from .env.example).
//
// If either value is missing, the client is not created and a clear
// development warning is shown instead of allowing an obscure runtime crash.
//
// TODO (implementation pass):
//   - Enable Row Level Security (RLS) on all Supabase tables.
//   - Never use the service-role key on the frontend.
//   - Validate that the anon key has only the expected scopes.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV) {
      console.warn(
        "[TokenForge PrintDesk] Supabase is not configured.\n" +
          "Copy .env.example to .env and set VITE_SUPABASE_URL and " +
          "VITE_SUPABASE_ANON_KEY to enable Supabase features."
      );
    }
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Supabase client instance.
 * May be null if environment variables are not configured.
 * Always check for null before using — fall back to mock data in scaffold.
 */
export const supabase: SupabaseClient | null = createSupabaseClient();

/** Returns true if Supabase is configured and available. */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
