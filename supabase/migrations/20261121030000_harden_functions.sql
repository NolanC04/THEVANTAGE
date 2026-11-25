-- Airman Apex migration, carried over unchanged (already applied to the shared project). See 20261124100000_airman_prefix.sql.
-- Security advisor fixes: pin is_staff's search_path; signed-out callers cannot run the role helpers over the API.
-- module_content stays security definer on purpose: it is the class wall (filters by role / open class).
-- Tables with RLS and no policies (invites, settings, feedback_responses, ...) are server-only by design.
create or replace function is_staff() returns boolean language sql stable set search_path = public as $$ select app_role() in ('facilitator','admin') $$;
revoke execute on function app_role() from anon, public;
revoke execute on function app_unit() from anon, public;
revoke execute on function in_open_class(int) from anon, public;
revoke execute on function is_staff() from anon, public;
grant execute on function app_role(), app_unit(), in_open_class(int), is_staff() to authenticated, service_role;
