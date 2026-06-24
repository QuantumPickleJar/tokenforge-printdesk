import { requireSupabase } from "./supabaseClient";
import { signOut } from "./authService";

export interface OwnerMember {
  id: string;
  userId: string | null;
  email: string;
  displayName?: string | null;
  role: "owner" | "admin";
  active: boolean;
}

interface OwnerMemberRow {
  id: string;
  user_id: string | null;
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
  const userEmail = user?.email?.trim();
  if (!user || !userEmail) return null;

  const { data, error } = await client
    .from("owner_members")
    .select("*")
    .ilike("email", userEmail)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOwner(data as OwnerMemberRow) : null;
}

export async function signOutOwner(): Promise<void> {
  await signOut();
}
