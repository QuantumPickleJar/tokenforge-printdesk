import { requireSupabase } from "./supabaseClient";

export interface OwnerMember {
  id: string;
  userId: string;
  email: string;
  displayName?: string | null;
  role: "owner" | "admin";
  active: boolean;
}

interface OwnerMemberRow {
  id: string;
  user_id: string;
  email: string;
  display_name: string | null;
  role: "owner" | "admin";
  active: boolean;
}

function mapOwner(row: OwnerMemberRow): OwnerMember {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    active: row.active,
  };
}

export async function getCurrentOwnerMember(): Promise<OwnerMember | null> {
  const client = requireSupabase();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData.session?.user;
  if (!user) return null;

  const { data, error } = await client
    .from("owner_members")
    .select("*")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOwner(data as OwnerMemberRow) : null;
}

export async function signInOwnerWithOtp(email: string): Promise<void> {
  const client = requireSupabase();
  const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}owner`;
  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
  if (error) throw error;
}

export async function signOutOwner(): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}
