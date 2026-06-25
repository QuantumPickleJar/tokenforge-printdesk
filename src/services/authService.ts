import { requireSupabase } from "./supabaseClient";

function toRelativePath(path: string): string {
  if (!path || !path.startsWith("/")) {
    return "/";
  }
  return path;
}

function buildHashRouterRedirect(path: string): string {
  const relativePath = toRelativePath(path);
  const appRoot = new URL(import.meta.env.BASE_URL, window.location.origin);
  appRoot.hash = relativePath;
  return appRoot.toString();
}

export async function signInWithMagicLink(email: string, redirectPath = "/"): Promise<void> {
  const client = requireSupabase();
  const redirectTo = buildHashRouterRedirect(redirectPath);
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
