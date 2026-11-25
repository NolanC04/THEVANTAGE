-- The server (service role) reads and writes every table; RLS still governs browser roles.
-- This Supabase project does not grant table privileges to service_role by default, so without this
-- every server query fails with "permission denied". Applied to the live project on 24 Nov 2026.
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
alter default privileges for role postgres in schema public grant all on tables to service_role;
alter default privileges for role postgres in schema public grant all on sequences to service_role;
alter default privileges for role postgres in schema public grant execute on functions to service_role;
grant usage on type tier, content_status to service_role;
