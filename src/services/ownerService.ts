import { requireSupabase, isSupabaseConfigured } from "./supabaseClient";
import { signOut } from "./authService";
import { isLocalOwnerUnlockConfigured, lockLocalOwner } from "./localOwnerAuthService";

export interface OwnerMember {
  id: string;
  userId: string | null;
  email: string;
  displayName?: string | null;
  role: "owner" | "admin";
  active: boolean;
  source?: "owner_members" | "signed_in_session";
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
    source: "owner_members",
  };
}

function makeSessionOwner(userId: string, email: string): OwnerMember {
  return {
    id: userId,
    userId,
    email,
    displayName: email,
    role: "owner",
    active: true,
    source: "signed_in_session",
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

  if (!error && data) {
    return mapOwner(data as OwnerMemberRow);
  }

  if (error) {
    console.warn("Owner member lookup failed; allowing signed-in session for demo owner access.", error.message);
  } else {
    console.warn("No owner_members row found; allowing signed-in session for demo owner access.");
  }

  return makeSessionOwner(user.id, userEmail);
}

export async function signOutOwner(): Promise<void> {
  if (isSupabaseConfigured()) {
    await signOut();
  }

  if (isLocalOwnerUnlockConfigured()) {
    try {
      await lockLocalOwner();
    } catch (error) {
      console.warn("Could not lock local owner access during sign out.", error);
    }
  }
}
