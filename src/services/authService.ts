import { requireSupabase } from "./supabaseClient";

function toRelativePath(path: string): string {
  if (!path || !path.startsWith("/")) {
    return "/";
  }
  return path;
}

export async function signInWithMagicLink(email: string, redirectPath = "/"): Promise<void> {
  const client = requireSupabase();
  const relativePath = toRelativePath(redirectPath);
  const redirectTo = new URL(`${import.meta.env.BASE_URL}${relativePath.slice(1)}`, window.location.origin).toString();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}
