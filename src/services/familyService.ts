import { requireSupabase } from "./supabaseClient";
import type { FamilyGroup, FamilyGroupInput, FamilyMember, FamilyMemberInput } from "../types/family";

interface FamilyGroupRow {
  id: string;
  name: string;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface FamilyMemberRow {
  id: string;
  group_id: string | null;
  name: string;
  email: string;
  active: boolean;
  notes: string | null;
  payment_required_override: boolean;
  verification_status: FamilyMember["verificationStatus"];
  verification_todo: string | null;
  created_at: string;
  updated_at: string;
}

function mapGroup(row: FamilyGroupRow): FamilyGroup {
  return {
    id: row.id,
    name: row.name,
    active: row.active,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMember(row: FamilyMemberRow): FamilyMember {
  return {
    id: row.id,
    groupId: row.group_id,
    name: row.name,
    email: row.email,
    active: row.active,
    notes: row.notes,
    paymentRequiredOverride: row.payment_required_override,
    verificationStatus: row.verification_status,
    verificationTodo: row.verification_todo,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchFamilyGroups(): Promise<FamilyGroup[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("family_groups").select("*").order("name", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as FamilyGroupRow[]).map(mapGroup);
}

export async function fetchFamilyMembers(): Promise<FamilyMember[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("family_members").select("*").order("name", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as FamilyMemberRow[]).map(mapMember);
}

export async function upsertFamilyGroup(input: FamilyGroupInput, id?: string): Promise<void> {
  const client = requireSupabase();
  const payload = { name: input.name.trim(), active: input.active, notes: input.notes || null };
  const query = id ? client.from("family_groups").update(payload).eq("id", id) : client.from("family_groups").insert(payload);
  const { error } = await query;
  if (error) throw error;
}

export async function upsertFamilyMember(input: FamilyMemberInput, id?: string): Promise<void> {
  const client = requireSupabase();
  const payload = {
    group_id: input.groupId || null,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    active: input.active,
    notes: input.notes || null,
    payment_required_override: input.paymentRequiredOverride,
    verification_status: input.verificationStatus ?? "unverified",
  };
  const query = id ? client.from("family_members").update(payload).eq("id", id) : client.from("family_members").insert(payload);
  const { error } = await query;
  if (error) throw error;
}

export async function setFamilyMemberActive(id: string, active: boolean): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from("family_members").update({ active }).eq("id", id);
  if (error) throw error;
}
