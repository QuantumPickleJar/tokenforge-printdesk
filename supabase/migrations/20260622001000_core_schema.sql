-- TokenForge PrintDesk v0.1 core schema, RLS, storage policies, and RPC boundaries.
-- If `supabase db push` fails with `relation "supabase_migrations.schema_migrations" does not exist`,
-- verify `supabase link --project-ref <ref>` first, then repair/initialize the Supabase CLI migration metadata.
-- Keep schema changes version-controlled here; do not patch production tables by hand in the dashboard.

create extension if not exists pgcrypto;

create table public.owner_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  role text not null default 'owner' check (role in ('owner', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  material_type text not null check (material_type in ('PLA', 'PETG')),
  density_g_cm3 numeric(8,4) not null,
  cost_per_kg numeric(10,2) not null,
  active boolean not null default true,
  print_notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (name, material_type)
);

create table public.material_colors (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  color_name text not null,
  brand text,
  hex_color text,
  active boolean not null default true,
  print_notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  material_summary text,
  color_summary text,
  category text,
  tags text[] not null default '{}',
  source_type text not null default 'printed_model',
  model_source_url text,
  designed_by_me boolean not null default false,
  remixed_by_me boolean not null default false,
  printed_by_me boolean not null default true,
  notes text,
  what_i_learned text,
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  published_at timestamptz
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery_item_id uuid not null references public.gallery_items(id) on delete cascade,
  bucket text not null default 'gallery-images',
  storage_path text not null,
  public_url text,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.family_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.family_groups(id) on delete set null,
  name text not null,
  email text not null,
  active boolean not null default true,
  notes text,
  payment_required_override boolean not null default false,
  verification_status text not null default 'unverified' check (verification_status in ('unverified', 'pending', 'verified')),
  verification_todo text default 'Future: require magic-link verification before trusting typed email alone.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index family_members_email_lower_idx on public.family_members (lower(email));

create table public.print_requests (
  id uuid primary key default gen_random_uuid(),
  requester_name text not null,
  requester_email text not null,
  request_title text not null,
  request_description text not null,
  request_type text not null default 'public_quote' check (request_type in ('public_quote', 'family_free', 'owner_internal')),
  status text not null default 'submitted' check (status in ('submitted','reviewing','needs_more_info','accepted','accepted_for_quote','quote_draft','quoted','quote_viewed','quote_accepted','payment_pending','paid','printing','ready_for_pickup','shipped','completed','declined','canceled','archived')),
  payment_required boolean not null default true,
  payment_status text not null default 'not_started' check (payment_status in ('not_required','not_started','pending','paid','waived','failed','refunded')),
  reply_requested boolean not null default false,
  licensing_confirmed boolean not null default false,
  personal_design boolean not null default false,
  model_source_url text,
  shipping_requested boolean not null default false,
  shipping_notes text,
  material_color_id uuid references public.material_colors(id) on delete set null,
  material_request_notes text,
  advanced_mode_used boolean not null default false,
  layer_height numeric(5,2),
  infill_type text,
  infill_percent integer,
  wall_count integer,
  rough_estimated_volume_cm3 numeric(12,4),
  rough_estimated_grams numeric(12,4),
  rough_estimated_material_cost numeric(10,2),
  rough_estimate_version text,
  rough_estimate_generated_at timestamptz,
  owner_notes text,
  family_group_id uuid references public.family_groups(id) on delete set null,
  family_member_id uuid references public.family_members(id) on delete set null,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.request_files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.print_requests(id) on delete cascade,
  bucket text not null default 'request-models',
  storage_path text not null,
  original_filename text not null,
  content_type text,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 41943040),
  uploaded_at timestamptz not null default now(),
  expires_at timestamptz default (now() + interval '30 days'),
  checksum text,
  validation_status text not null default 'client_validated',
  owner_download_supported boolean not null default true,
  created_at timestamptz not null default now(),
  unique (request_id, storage_path)
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.print_requests(id) on delete cascade,
  material_cost numeric(10,2) not null default 0,
  labor_cost numeric(10,2) not null default 0,
  shipping_cost numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  final_asking_price numeric(10,2) not null default 0,
  quote_notes text,
  payment_provider text not null default 'manual',
  payment_url text,
  quote_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  expires_at timestamptz,
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  declined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.print_requests(id) on delete cascade,
  event_type text not null,
  message text,
  actor text not null default 'system',
  created_at timestamptz not null default now()
);

create table public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.print_requests(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  notification_type text not null,
  recipient_email text,
  recipient_role text,
  status text not null default 'queued',
  provider_message_id text,
  payload jsonb not null default '{}',
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table public.processing_jobs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.print_requests(id) on delete cascade,
  job_type text not null default 'stl_analysis',
  status text not null default 'pending' check (status in ('pending','claimed','processing','completed','failed')),
  claimed_by text,
  input jsonb not null default '{}',
  output jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.submission_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.print_requests(id) on delete set null,
  requester_email text,
  event_type text not null,
  user_agent text,
  hashed_ip text,
  turnstile_status text,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger owner_members_touch before update on public.owner_members for each row execute function public.touch_updated_at();
create trigger materials_touch before update on public.materials for each row execute function public.touch_updated_at();
create trigger material_colors_touch before update on public.material_colors for each row execute function public.touch_updated_at();
create trigger gallery_items_touch before update on public.gallery_items for each row execute function public.touch_updated_at();
create trigger family_groups_touch before update on public.family_groups for each row execute function public.touch_updated_at();
create trigger family_members_touch before update on public.family_members for each row execute function public.touch_updated_at();
create trigger print_requests_touch before update on public.print_requests for each row execute function public.touch_updated_at();
create trigger quotes_touch before update on public.quotes for each row execute function public.touch_updated_at();
create trigger processing_jobs_touch before update on public.processing_jobs for each row execute function public.touch_updated_at();

create or replace function public.is_owner_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.owner_members where user_id = auth.uid() and active = true and role in ('owner','admin'));
$$;

create or replace function public.request_exists_for_upload(p_request_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.print_requests where id = p_request_id and deleted_at is null);
$$;

create or replace function public.submit_print_request(request_payload jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid := gen_random_uuid();
  v_email text := lower(trim(coalesce(request_payload->>'requester_email','')));
  v_member_id uuid;
  v_group_id uuid;
  v_type text := 'public_quote';
  v_payment_required boolean := true;
  v_payment_status text := 'not_started';
begin
  if length(trim(coalesce(request_payload->>'requester_name',''))) = 0 then raise exception 'requester_name is required'; end if;
  if length(v_email) = 0 or position('@' in v_email) = 0 then raise exception 'valid requester_email is required'; end if;
  if length(trim(coalesce(request_payload->>'request_title',''))) = 0 then raise exception 'request_title is required'; end if;
  if length(trim(coalesce(request_payload->>'request_description',''))) = 0 then raise exception 'request_description is required'; end if;
  if coalesce((request_payload->>'licensing_confirmed')::boolean, false) is not true then raise exception 'licensing confirmation is required'; end if;

  select fm.id, fm.group_id into v_member_id, v_group_id
  from public.family_members fm left join public.family_groups fg on fg.id = fm.group_id
  where lower(fm.email) = v_email and fm.active = true and coalesce(fg.active, true) = true
  limit 1;

  if v_member_id is not null then
    v_type := 'family_free'; v_payment_required := false; v_payment_status := 'not_required';
  end if;

  insert into public.print_requests (
    id, requester_name, requester_email, request_title, request_description,
    request_type, status, payment_required, payment_status, reply_requested, licensing_confirmed,
    personal_design, model_source_url, shipping_requested, shipping_notes, material_color_id,
    material_request_notes, advanced_mode_used, layer_height, infill_type, infill_percent, wall_count,
    rough_estimated_volume_cm3, rough_estimated_grams, rough_estimated_material_cost,
    rough_estimate_version, rough_estimate_generated_at, family_group_id, family_member_id
  ) values (
    v_id, trim(request_payload->>'requester_name'), v_email, trim(request_payload->>'request_title'), trim(request_payload->>'request_description'),
    v_type, 'submitted', v_payment_required, v_payment_status,
    coalesce((request_payload->>'reply_requested')::boolean, false), true,
    coalesce((request_payload->>'personal_design')::boolean, false), nullif(trim(coalesce(request_payload->>'model_source_url','')), ''),
    coalesce((request_payload->>'shipping_requested')::boolean, false), nullif(trim(coalesce(request_payload->>'shipping_notes','')), ''),
    nullif(request_payload->>'material_color_id','')::uuid, nullif(trim(coalesce(request_payload->>'material_request_notes','')), ''),
    coalesce((request_payload->>'advanced_mode_used')::boolean, false), nullif(request_payload->>'layer_height','')::numeric,
    nullif(request_payload->>'infill_type',''), nullif(request_payload->>'infill_percent','')::integer, nullif(request_payload->>'wall_count','')::integer,
    nullif(request_payload->>'rough_estimated_volume_cm3','')::numeric, nullif(request_payload->>'rough_estimated_grams','')::numeric,
    nullif(request_payload->>'rough_estimated_material_cost','')::numeric, nullif(request_payload->>'rough_estimate_version',''),
    case when request_payload ? 'rough_estimate_generated_at' then (request_payload->>'rough_estimate_generated_at')::timestamptz else null end,
    v_group_id, v_member_id
  );

  insert into public.request_events (request_id, event_type, message, actor) values (v_id, 'submitted', 'Request submitted by public form.', 'requester');
  insert into public.submission_events (request_id, requester_email, event_type) values (v_id, v_email, 'request_submitted');
  insert into public.notification_logs (request_id, notification_type, recipient_role, status, payload)
  values (v_id, case when v_member_id is null then 'owner_new_public_quote_request' else 'owner_new_family_request' end, 'owner', 'queued', jsonb_build_object('request_id', v_id, 'request_type', v_type));
  return v_id;
end;
$$;
grant execute on function public.submit_print_request(jsonb) to anon, authenticated;

create or replace function public.record_request_file(p_request_id uuid, p_storage_path text, p_original_filename text, p_content_type text, p_size_bytes bigint)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_file_id uuid;
begin
  if p_size_bytes <= 0 or p_size_bytes > 41943040 then raise exception 'STL must be non-empty and 40 MB or less'; end if;
  if lower(p_original_filename) not like '%.stl' or lower(p_storage_path) not like '%.stl' then raise exception 'Only STL files are accepted'; end if;
  if p_storage_path <> format('requests/%s/model.stl', p_request_id) then raise exception 'Invalid request model storage path'; end if;
  insert into public.request_files (request_id, bucket, storage_path, original_filename, content_type, size_bytes)
  values (p_request_id, 'request-models', p_storage_path, p_original_filename, p_content_type, p_size_bytes)
  returning id into v_file_id;
  insert into public.request_events (request_id, event_type, message, actor) values (p_request_id, 'file_uploaded', 'Requester uploaded STL metadata.', 'requester');
  return v_file_id;
end;
$$;
grant execute on function public.record_request_file(uuid, text, text, text, bigint) to anon, authenticated;

create or replace function public.get_public_quote_by_token(p_quote_token text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_result jsonb; v_quote_id uuid; v_request_id uuid;
begin
  select q.id, q.request_id, jsonb_build_object(
    'id', q.id, 'requestId', q.request_id, 'requestTitle', pr.request_title, 'token', q.quote_token,
    'materialCost', q.material_cost, 'laborCost', q.labor_cost, 'shippingCost', q.shipping_cost, 'discount', q.discount,
    'finalAskingPrice', q.final_asking_price, 'quoteNotes', q.quote_notes, 'paymentProvider', q.payment_provider,
    'paymentUrl', q.payment_url, 'expiresAt', q.expires_at, 'sentAt', q.sent_at, 'viewedAt', q.viewed_at,
    'acceptedAt', q.accepted_at, 'declinedAt', q.declined_at, 'paymentStatus', pr.payment_status)
  into v_quote_id, v_request_id, v_result
  from public.quotes q join public.print_requests pr on pr.id = q.request_id
  where q.quote_token = p_quote_token and q.sent_at is not null and (q.expires_at is null or q.expires_at > now()) and pr.deleted_at is null;
  if v_quote_id is not null then
    update public.quotes set viewed_at = coalesce(viewed_at, now()) where id = v_quote_id;
    update public.print_requests set status = 'quote_viewed' where id = v_request_id and status = 'quoted';
  end if;
  return v_result;
end;
$$;
grant execute on function public.get_public_quote_by_token(text) to anon, authenticated;

create or replace function public.respond_to_quote(p_quote_token text, p_response text) returns boolean
language plpgsql security definer set search_path = public as $$
declare v_quote public.quotes%rowtype;
begin
  select * into v_quote from public.quotes where quote_token = p_quote_token and sent_at is not null and (expires_at is null or expires_at > now()) limit 1;
  if v_quote.id is null then return false; end if;
  if p_response = 'accepted' then
    update public.quotes set accepted_at = coalesce(accepted_at, now()), declined_at = null where id = v_quote.id;
    update public.print_requests set status = case when v_quote.payment_url is null then 'quote_accepted' else 'payment_pending' end, payment_status = case when v_quote.payment_url is null then payment_status else 'pending' end where id = v_quote.request_id;
    insert into public.notification_logs (request_id, quote_id, notification_type, recipient_role, status) values (v_quote.request_id, v_quote.id, 'owner_quote_accepted', 'owner', 'queued');
    return true;
  elsif p_response = 'declined' then
    update public.quotes set declined_at = coalesce(declined_at, now()) where id = v_quote.id;
    update public.print_requests set status = 'declined' where id = v_quote.request_id;
    insert into public.notification_logs (request_id, quote_id, notification_type, recipient_role, status) values (v_quote.request_id, v_quote.id, 'owner_quote_declined', 'owner', 'queued');
    return true;
  end if;
  raise exception 'Unsupported quote response';
end;
$$;
grant execute on function public.respond_to_quote(text, text) to anon, authenticated;

alter table public.owner_members enable row level security;
alter table public.materials enable row level security;
alter table public.material_colors enable row level security;
alter table public.gallery_items enable row level security;
alter table public.gallery_images enable row level security;
alter table public.family_groups enable row level security;
alter table public.family_members enable row level security;
alter table public.print_requests enable row level security;
alter table public.request_files enable row level security;
alter table public.quotes enable row level security;
alter table public.request_events enable row level security;
alter table public.notification_logs enable row level security;
alter table public.processing_jobs enable row level security;
alter table public.submission_events enable row level security;

create policy "Owner members owner read" on public.owner_members for select to authenticated using (public.is_owner_admin());
create policy "Owner members owner manage" on public.owner_members for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Public active materials" on public.materials for select to anon, authenticated using (active);
create policy "Owners manage materials" on public.materials for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Public active material colors" on public.material_colors for select to anon, authenticated using (active and exists (select 1 from public.materials m where m.id = material_id and m.active));
create policy "Owners manage material colors" on public.material_colors for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Public published gallery items" on public.gallery_items for select to anon, authenticated using (published and deleted_at is null);
create policy "Owners manage gallery items" on public.gallery_items for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Public published gallery images" on public.gallery_images for select to anon, authenticated using (exists (select 1 from public.gallery_items gi where gi.id = gallery_item_id and gi.published and gi.deleted_at is null));
create policy "Owners manage gallery images" on public.gallery_images for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Owners manage family groups" on public.family_groups for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Owners manage family members" on public.family_members for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Owners manage print requests" on public.print_requests for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Owners manage request files" on public.request_files for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Owners manage quotes" on public.quotes for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Owners read request events" on public.request_events for select to authenticated using (public.is_owner_admin());
create policy "Owners insert request events" on public.request_events for insert to authenticated with check (public.is_owner_admin());
create policy "Owners manage notification logs" on public.notification_logs for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Owners manage processing jobs" on public.processing_jobs for all to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());
create policy "Owners read submission events" on public.submission_events for select to authenticated using (public.is_owner_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('request-models', 'request-models', false, 41943040, null),
  ('gallery-images', 'gallery-images', true, 10485760, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "Public upload exact request STL path" on storage.objects for insert to anon, authenticated
with check (bucket_id = 'request-models' and storage.filename(name) = 'model.stl' and lower(storage.extension(name)) = 'stl' and (storage.foldername(name))[1] = 'requests' and public.request_exists_for_upload(((storage.foldername(name))[2])::uuid));
create policy "Owners manage request model objects" on storage.objects for all to authenticated
using (bucket_id = 'request-models' and public.is_owner_admin()) with check (bucket_id = 'request-models' and public.is_owner_admin());
create policy "Public read gallery image objects" on storage.objects for select to anon, authenticated using (bucket_id = 'gallery-images');
create policy "Owners manage gallery image objects" on storage.objects for all to authenticated
using (bucket_id = 'gallery-images' and public.is_owner_admin()) with check (bucket_id = 'gallery-images' and public.is_owner_admin());

insert into public.materials (id, name, material_type, density_g_cm3, cost_per_kg, active, print_notes, sort_order) values
  ('00000000-0000-0000-0000-000000000101', 'Generic PLA', 'PLA', 1.2400, 22.00, true, 'Editable placeholder for common PLA spools.', 10),
  ('00000000-0000-0000-0000-000000000102', 'Generic PETG', 'PETG', 1.2700, 26.00, true, 'Editable placeholder for common PETG spools.', 20)
on conflict (id) do nothing;
insert into public.material_colors (id, material_id, color_name, brand, hex_color, active, sort_order) values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'Black', null, '#1f1f1f', true, 10),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000101', 'White', null, '#f3f3f3', true, 20),
  ('00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000102', 'Translucent Blue', null, '#5b8de0', true, 30)
on conflict (id) do nothing;
