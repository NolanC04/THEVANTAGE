-- Split unit-side tools out of Airman Apex (V3 report, Section 15: official duty training never uses the
-- venture's app). Growth-session kind "flight" becomes "team". The unit tables go: all six were confirmed
-- empty on the live project on 24 Nov 2026, so nothing is lost. Unit Tools (separate repo) has its own database.
alter table session_requests drop constraint if exists session_requests_kind_check;
update session_requests set kind = 'team' where kind = 'flight';
alter table session_requests add constraint session_requests_kind_check check (kind in ('one_on_one','small_group','team'));

drop table if exists you_said_we_did;
drop table if exists campaign_receipts;
drop table if exists feedback_responses;
drop table if exists feedback_campaigns;
drop table if exists feedback_forms;
drop table if exists flight_blocks;
