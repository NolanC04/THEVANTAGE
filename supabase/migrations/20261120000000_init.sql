-- The Vantage: initial schema. RLS on every table.
-- Server code uses the service role; these policies govern any direct client/API access.

create extension if not exists pgcrypto;

create type tier as enum ('free', 'library', 'cohort', 'military');
create type content_status as enum ('draft', 'published');

create table members (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  tier tier not null default 'free',
  verified_military boolean not null default false,
  verification_type text check (verification_type in ('service_member','veteran','military_spouse')),
  verified_at timestamptz,
  spouse_discount boolean not null default false,
  stripe_customer_id text unique,
  subscription_status text,
  created_at timestamptz not null default now()
);

create table programs (
  id text primary key default gen_random_uuid()::text,
  slug text not null unique,
  word text not null,
  acronym text,
  family text check (family in ('The Self','The Mind','The Engine','The Structure','The Legacy')),
  thesis text,
  pain_line text,
  tagline text,
  cover_url text,
  cover_alt text,
  release_no int,
  release_label text,
  status content_status not null default 'draft',
  military_free boolean not null default false,
  author_of_record text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  constraint published_needs_author check (status = 'draft' or author_of_record is not null)
);

create table modules (
  id text primary key default gen_random_uuid()::text,
  program_id text not null references programs(id) on delete cascade,
  number int not null,
  title text not null,
  phase text,
  cover_url text,
  cover_alt text,
  body_md text,
  gene_question text,
  minutes int,
  status content_status not null default 'draft',
  author_of_record text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (program_id, number)
);

create table library_items (
  id text primary key default gen_random_uuid()::text,
  kind text not null check (kind in ('video','article','book','newsletter','skill_sheet')),
  slug text not null unique,
  title text not null,
  summary text,
  body_md text,
  url text,
  cover_url text,
  cover_alt text,
  tier_required text not null default 'library' check (tier_required in ('public','free','library')),
  status content_status not null default 'draft',
  author_of_record text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- The Almanac: private to the member. No facilitator or admin read policy exists.
create table almanac_entries (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  program_slug text not null,
  module_number int not null,
  question text not null,
  answer text not null,
  gene_reply text not null,
  sealed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (member_id, program_slug, module_number)
);

create table dome (
  member_id uuid primary key references members(id) on delete cascade,
  given text[] not null default '{}',
  chosen text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table cohorts (
  id text primary key,
  name text not null,
  starts_on date,
  info_session_on date,
  seats int not null default 20,
  open boolean not null default true,
  created_at timestamptz not null default now()
);

create table purchases (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  kind text not null check (kind in ('library','cohort')),
  stripe_session_id text not null unique,
  cohort_id text references cohorts(id),
  amount_cents int,
  status text not null default 'paid' check (status in ('paid','refunded')),
  created_at timestamptz not null default now()
);

create table cohort_applications (
  id uuid primary key default gen_random_uuid(),
  cohort_id text references cohorts(id),
  full_name text not null,
  email text not null,
  where_now text not null,
  intends_to_build text not null,
  created_at timestamptz not null default now()
);

create table org_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text not null,
  work_email text not null,
  outcome text not null,
  created_at timestamptz not null default now()
);

create table subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'pending' check (status in ('pending','confirmed','unsubscribed')),
  token text not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Studiolo releases land here as drafts. Publishing records the author of record.
create table import_drafts (
  id uuid primary key default gen_random_uuid(),
  package_id text not null,
  version int not null,
  schema text not null,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  status text not null default 'draft' check (status in ('draft','published','rejected')),
  published_by text,
  published_at timestamptz,
  target text,
  created_at timestamptz not null default now(),
  unique (package_id, version)
);

create table publish_log (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references import_drafts(id),
  author_of_record text not null,
  approved_by text not null,
  findings jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table members enable row level security;
alter table programs enable row level security;
alter table modules enable row level security;
alter table library_items enable row level security;
alter table almanac_entries enable row level security;
alter table dome enable row level security;
alter table cohorts enable row level security;
alter table purchases enable row level security;
alter table cohort_applications enable row level security;
alter table org_inquiries enable row level security;
alter table subscribers enable row level security;
alter table import_drafts enable row level security;
alter table publish_log enable row level security;

create policy "member reads self" on members for select using (auth.uid() = id);

-- Public catalogue: only published rows. Module bodies are served by the server after the gate check,
-- so anon/auth roles may read metadata but not body_md (column privileges below).
create policy "published programs" on programs for select using (status = 'published');
create policy "published modules" on modules for select using (status = 'published');
create policy "published library" on library_items for select using (status = 'published');
revoke select on modules from anon, authenticated;
grant select (id, program_id, number, title, phase, cover_url, cover_alt, status, published_at) on modules to anon, authenticated;
revoke select on library_items from anon, authenticated;
grant select (id, kind, slug, title, summary, cover_url, cover_alt, tier_required, status, published_at) on library_items to anon, authenticated;

create policy "almanac: owner only" on almanac_entries for all
  using (auth.uid() = member_id) with check (auth.uid() = member_id);
create policy "dome: owner only" on dome for all
  using (auth.uid() = member_id) with check (auth.uid() = member_id);
create policy "purchases: owner reads" on purchases for select using (auth.uid() = member_id);
create policy "cohorts public" on cohorts for select using (true);
-- applications, inquiries, subscribers, import_drafts, publish_log: no client policies (service role only).
