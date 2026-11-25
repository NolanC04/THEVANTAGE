-- The Airman Vantage moves into The Vantage's database (24 Nov 2026).
-- Every Airman Apex table, index, view and helper function gets the airman_ prefix, keeping its data
-- (24 modules, tracks, events, settings). This clears the way for The Vantage's own tables, starting
-- with its own `modules`, in the next migration. Policies and the view follow the renamed objects.

do $$
declare t text;
begin
  foreach t in array array[
    'agreements','audit_log','checkins','class_joins','class_members','class_sessions','classes',
    'closing_laws','daily_reps','events','gene_reads','import_proposals','invites','module_entries',
    'modules','observations','profiles','rater_scores','request_messages','rsvps','safety_flags',
    'session_requests','settings','tracks'
  ] loop
    execute format('alter table public.%I rename to %I', t, 'airman_' || t);
  end loop;
end $$;

-- Index names (and the primary-key / unique constraints they back) share one namespace per schema,
-- so `modules_pkey` would collide with The Vantage's `modules`. Rename every index on an airman_ table.
do $$
declare r record;
begin
  for r in
    select i.relname as idx
    from pg_index x
    join pg_class i on i.oid = x.indexrelid
    join pg_class t on t.oid = x.indrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public' and t.relname like 'airman\_%' and i.relname not like 'airman\_%'
  loop
    execute format('alter index public.%I rename to %I', r.idx, left('airman_' || r.idx, 63));
  end loop;
end $$;

alter view module_content rename to airman_module_content;

-- Helper functions: rename (policies and the view keep pointing at them), then rewrite their bodies,
-- which name tables as text.
alter function app_role() rename to airman_role;
alter function app_unit() rename to airman_unit;
alter function is_staff() rename to airman_is_staff;
alter function in_open_class(int) rename to airman_in_open_class;

create or replace function airman_role() returns text language sql stable security definer set search_path = public as $$
  select role from airman_profiles where id = auth.uid()
$$;
create or replace function airman_unit() returns text language sql stable security definer set search_path = public as $$
  select unit from airman_profiles where id = auth.uid()
$$;
create or replace function airman_is_staff() returns boolean language sql stable set search_path = public as $$
  select airman_role() in ('facilitator','admin')
$$;
create or replace function airman_in_open_class(n int) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from airman_class_joins j join airman_class_sessions s on s.id = j.class_session_id
                 where j.user_id = auth.uid() and s.closed_at is null and n = any (s.module_numbers))
$$;
revoke execute on function airman_role() from anon, public;
revoke execute on function airman_unit() from anon, public;
revoke execute on function airman_in_open_class(int) from anon, public;
revoke execute on function airman_is_staff() from anon, public;
grant execute on function airman_role(), airman_unit(), airman_in_open_class(int), airman_is_staff() to authenticated, service_role;
