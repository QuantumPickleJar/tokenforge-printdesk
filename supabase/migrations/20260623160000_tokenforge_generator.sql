alter table public.print_requests
  add column if not exists pricing_mode text not null default 'quote',
  add column if not exists tokenforge_payload jsonb not null default '{}'::jsonb;
