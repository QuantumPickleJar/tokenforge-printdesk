import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseEnvKey = "VITE_SUPABASE_URL" | "VITE_SUPABASE_ANON_KEY";
type TokenforgeRuntimeConfig = Partial<Record<SupabaseEnvKey, string>>;

declare global {
  interface Window {
    __TOKENFORGE_CONFIG__?: TokenforgeRuntimeConfig;
  }
}

const viteEnv: TokenforgeRuntimeConfig = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
};

function readSupabaseEnvValue(key: SupabaseEnvKey): string | undefined {
  const runtimeValue = typeof window !== "undefined" ? window.__TOKENFORGE_CONFIG__?.[key] : undefined;
  const value = runtimeValue || viteEnv[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

const supabaseUrl = readSupabaseEnvValue("VITE_SUPABASE_URL");
const supabaseAnonKey = readSupabaseEnvValue("VITE_SUPABASE_ANON_KEY");

function createSupabaseClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV) {
      console.warn(
        "[TokenForge PrintDesk] Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
      );
    }
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase: SupabaseClient | null = createSupabaseClient();

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error("Supabase is not configured. Copy .env.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
}
