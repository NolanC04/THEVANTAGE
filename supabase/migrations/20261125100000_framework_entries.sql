-- Framework answers saved to the Almanac (25 Nov 2026).
-- One row per person per framework: saving again replaces the last save.
-- Private to the owner, like the rest of the Almanac: no facilitator, staff or admin read policy exists.

create table framework_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  framework_id text not null,
  module_number int,
  data jsonb not null default '{}',
  summary text not null default '',
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (member_id, framework_id)
);
alter table framework_entries enable row level security;
create policy "framework entries: owner only" on framework_entries for all
  using (auth.uid() = member_id) with check (auth.uid() = member_id);

create table airman_framework_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references airman_profiles(id) on delete cascade,
  framework_id text not null,
  module_number int,
  data jsonb not null default '{}',
  summary text not null default '',
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, framework_id)
);
alter table airman_framework_entries enable row level security;
create policy "airman framework entries: owner only" on airman_framework_entries for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

grant all on framework_entries, airman_framework_entries to service_role;
