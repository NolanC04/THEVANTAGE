-- Airman Apex migration, carried over unchanged (already applied to the shared project). See 20261124100000_airman_prefix.sql.
-- Airman Apex schema. RLS on every table. Server code uses the service role and repeats each check;
-- these policies are what any direct API call (anon/authenticated key) runs into.

create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'learner' check (role in ('learner','assistant','facilitator','admin','comparison')),
  unit text, flight text,
  anon_id text not null unique,
  display_name text,
  consented_at timestamptz,
  created_at timestamptz not null default now()
);
create or replace function app_role() returns text language sql stable security definer set search_path = public as $$ select role from profiles where id = auth.uid() $$;
create or replace function app_unit() returns text language sql stable security definer set search_path = public as $$ select unit from profiles where id = auth.uid() $$;
create or replace function is_staff() returns boolean language sql stable as $$ select app_role() in ('facilitator','admin') $$;

create table invites (id uuid primary key default gen_random_uuid(), code text not null unique, role text not null, unit text, flight text, class_id uuid, created_by uuid, active boolean not null default true, used boolean not null default false, created_at timestamptz not null default now());
create table agreements (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id) on delete cascade, version text not null, signature text not null, audio_consent boolean not null default false, "group" text not null, signed_at timestamptz not null default now(), created_at timestamptz not null default now(), unique (user_id, version));
create table audit_log (id uuid primary key default gen_random_uuid(), actor_id uuid, actor_anon text, action text not null, target text, detail jsonb not null default '{}', at timestamptz not null default now(), created_at timestamptz not null default now());
create table settings (id text primary key, modules_readable_after_completion boolean not null default false, daily_reps_between_sessions boolean not null default true, report_threshold int not null default 5 check (report_threshold >= 5));
insert into settings (id) values ('settings');

-- Feedback: responses carry NO user id; receipts stop double submission.
create table feedback_forms (id uuid primary key default gen_random_uuid(), title text not null, questions jsonb not null, created_by uuid, created_at timestamptz not null default now());
create table feedback_campaigns (id uuid primary key default gen_random_uuid(), form_id uuid not null references feedback_forms(id), title text not null, unit text, flight text, sent_at timestamptz not null default now(), closes_at timestamptz, status text not null default 'open' check (status in ('open','closed')), created_at timestamptz not null default now());
create table feedback_responses (id uuid primary key default gen_random_uuid(), campaign_id uuid not null references feedback_campaigns(id), answers jsonb not null, submitted_on date not null default current_date, created_at date not null default current_date);
create table campaign_receipts (id uuid primary key default gen_random_uuid(), campaign_id uuid not null references feedback_campaigns(id), user_id uuid not null references profiles(id) on delete cascade, submitted boolean not null default true, created_at date not null default current_date, unique (campaign_id, user_id));
create table you_said_we_did (id uuid primary key default gen_random_uuid(), campaign_id uuid, said text not null, did text not null, at timestamptz not null default now(), created_at timestamptz not null default now());

create table session_requests (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id) on delete cascade, kind text not null check (kind in ('one_on_one','small_group','flight')), preferred_times text not null, note text, status text not null default 'new' check (status in ('new','scheduled','completed','closed')), completed_at timestamptz, created_at timestamptz not null default now());
create table request_messages (id uuid primary key default gen_random_uuid(), request_id uuid not null references session_requests(id) on delete cascade, author_id uuid not null, author_role text not null, body text not null, at timestamptz not null default now(), created_at timestamptz not null default now());

create table tracks (id text primary key, slug text unique not null, name text not null, line text not null);
insert into tracks values ('track-athletes','hybrid-athletes','Hybrid Athletes','Run club and fitness events.'),('track-intellects','hybrid-intellects','Hybrid Intellects','Extended conversation on relevant, uncommon strategies.'),('track-faith','faith-forward','Faith Forward','Bible study rooted in application.'),('track-social','social','Social','Mentorship and unit events.');
create table events (id text primary key default gen_random_uuid()::text, track_id text references tracks(id), title text not null, starts_at timestamptz, location text, description text, capacity int, created_at timestamptz not null default now());
insert into events (id, track_id, title) values ('event-guardian-gauntlet','track-social','Guardian Gauntlet');
create table rsvps (id uuid primary key default gen_random_uuid(), event_id text not null references events(id) on delete cascade, user_id uuid not null references profiles(id) on delete cascade, created_at timestamptz not null default now(), unique (event_id, user_id));
create table flight_blocks (id uuid primary key default gen_random_uuid(), unit text not null, flight text not null, month text not null, topic text not null, starts_at timestamptz, facilitator_id uuid, source_campaign_id uuid, created_at timestamptz not null default now());

-- Modules: content arrives only through approved imports.
create table modules (id text primary key, number int unique not null check (number between 1 and 24), phase text not null check (phase in ('shield','sword','star')), session int not null check (session between 1 and 8), content jsonb not null default '{}', version int not null default 0, status text not null default 'draft', closing_law_id uuid, updated_at timestamptz not null default now());
insert into modules (id, number, phase, session) select 'module-'||n, n, (array['shield','sword','star'])[((n-1)/8)+1], ((n-1)%8)+1 from generate_series(1,24) n;
create table closing_laws (id uuid primary key default gen_random_uuid(), module_number int not null, text text not null, authored_by text not null, approved boolean not null default false, at timestamptz not null default now(), created_at timestamptz not null default now());
create table import_proposals (id uuid primary key default gen_random_uuid(), module_number int not null, source text not null, changes jsonb not null, proposed jsonb not null, base_version int not null, status text not null default 'pending', proposed_by text, decided_by uuid, decided_at timestamptz, at timestamptz not null default now(), created_at timestamptz not null default now());

create table classes (id uuid primary key default gen_random_uuid(), name text, created_at timestamptz not null default now());
create table class_members (id uuid primary key default gen_random_uuid(), class_id uuid, user_id uuid references profiles(id) on delete cascade, role text, created_at timestamptz not null default now());
create table class_sessions (id uuid primary key default gen_random_uuid(), class_id uuid, code text not null, module_numbers int[] not null, opened_by uuid not null, opened_at timestamptz not null default now(), closed_at timestamptz, created_at timestamptz not null default now());
create unique index one_open_code on class_sessions (code) where closed_at is null;
create table class_joins (id uuid primary key default gen_random_uuid(), class_session_id uuid not null references class_sessions(id) on delete cascade, user_id uuid not null references profiles(id) on delete cascade, joined_at timestamptz not null default now(), created_at timestamptz not null default now(), unique (class_session_id, user_id));

-- The Almanac: owner reads; facilitators only rows the owner shared.
create table module_entries (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id) on delete cascade, module_number int not null, bridge text, bridge_at timestamptz, remix text, quick_check int, gene jsonb not null default '[]', commitment_when text, commitment_will text, shared boolean not null default false, sealed_at timestamptz, reviews jsonb not null default '[]', created_at timestamptz not null default now(), unique (user_id, module_number));
create table observations (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id) on delete cascade, module_number int, text text not null, grade int, rating text check (rating in ('true','partly','not')), rated_at timestamptz, surfaced boolean not null default false, at timestamptz not null default now(), created_at timestamptz not null default now());
create table daily_reps (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id) on delete cascade, day date not null, text text not null, at timestamptz not null default now(), created_at timestamptz not null default now(), unique (user_id, day));
create table checkins (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id) on delete cascade, anon_id text not null, "group" text not null check ("group" in ('cohort','comparison')), wave text not null check (wave in ('T0','T1','T2','T3')), responses jsonb not null, at timestamptz not null default now(), created_at timestamptz not null default now(), unique (user_id, wave));
create table safety_flags (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles(id) on delete cascade, anon_id text not null, module_number int, source text not null, raised_at timestamptz not null default now(), followed_up_at timestamptz, followed_up_by text, created_at timestamptz not null default now());

-- ---------- RLS ----------
do $$ declare t text; begin
  foreach t in array array['profiles','invites','agreements','audit_log','settings','feedback_forms','feedback_campaigns','feedback_responses','campaign_receipts','you_said_we_did','session_requests','request_messages','tracks','events','rsvps','flight_blocks','modules','closing_laws','import_proposals','classes','class_members','class_sessions','class_joins','module_entries','observations','daily_reps','checkins','safety_flags']
  loop execute format('alter table %I enable row level security', t); end loop;
end $$;

create policy "profiles: self" on profiles for select using (id = auth.uid());
create policy "profiles: staff in unit" on profiles for select using (app_role() = 'facilitator' and unit = app_unit());
create policy "profiles: admin" on profiles for select using (app_role() = 'admin');
create policy "profiles: self update" on profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = app_role());

create policy "campaigns: read" on feedback_campaigns for select using (auth.uid() is not null);
create policy "forms: read" on feedback_forms for select using (auth.uid() is not null);
-- Raw responses are never readable by clients; reports come from the server after the 5-response threshold.
create policy "receipts: own" on campaign_receipts for select using (user_id = auth.uid());
create policy "said-did: read" on you_said_we_did for select using (auth.uid() is not null);

create policy "requests: requester or staff" on session_requests for select using (user_id = auth.uid() or is_staff());
create policy "messages: requester or staff" on request_messages for select using (is_staff() or exists (select 1 from session_requests r where r.id = request_id and r.user_id = auth.uid()));

create policy "tracks: read" on tracks for select using (true);
create policy "events: read" on events for select using (auth.uid() is not null);
create policy "rsvps: own" on rsvps for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "blocks: read" on flight_blocks for select using (auth.uid() is not null);

-- Class wall: content column readable only while joined to an open session that includes the module.
create or replace function in_open_class(n int) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from class_joins j join class_sessions s on s.id = j.class_session_id
                 where j.user_id = auth.uid() and s.closed_at is null and n = any (s.module_numbers))
$$;
create policy "modules: metadata" on modules for select using (auth.uid() is not null);
revoke select on modules from anon, authenticated;
grant select (id, number, phase, session, version, status) on modules to authenticated;
create or replace view module_content with (security_invoker = false) as
  select number, content - 'facilitator_opener' - 'closing_draft' as content from modules
  where app_role() in ('admin','facilitator','assistant') or in_open_class(number);
grant select on module_content to authenticated;

create policy "laws: approved only" on closing_laws for select using (approved);
create policy "sessions: staff or joined" on class_sessions for select using (is_staff() or exists (select 1 from class_joins j where j.class_session_id = id and j.user_id = auth.uid()));
create policy "joins: own" on class_joins for select using (user_id = auth.uid() or is_staff());

create policy "almanac: owner" on module_entries for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "almanac: shared to staff" on module_entries for select using (shared and is_staff());
create policy "observations: owner" on observations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "daily reps: owner" on daily_reps for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "checkins: owner" on checkins for select using (user_id = auth.uid());
create policy "checkins: staff aggregate" on checkins for select using (is_staff());
create policy "flags: staff only" on safety_flags for select using (is_staff());
create policy "audit: admin" on audit_log for select using (app_role() = 'admin');
