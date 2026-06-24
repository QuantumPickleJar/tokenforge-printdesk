-- Owner access is granted when the signed-in Supabase Auth email matches
-- an active owner_members row. user_id remains supported as an optional stronger link.

create index if not exists owner_members_email_lower_lookup_idx
  on public.owner_members (lower(email));

create or replace function public.is_owner_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.owner_members
    where active = true
      and role in ('owner','admin')
      and (
        user_id = auth.uid()
        or lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
      )
  );
$$;
