-- GENE validation (V3 report, Section 9). Every GENE call is filed with the exact model, prompt hash,
-- rubric version and token counts, so a score can be reproduced and priced. Human raters score a sample
-- blind (they never see GENE's grade or another rater's grade). Agreement is computed server-side.

alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('learner','assistant','facilitator','admin','comparison','rater'));

create table gene_reads (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references module_entries(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  module_number int not null,
  turn int not null,                        -- 0 = first read of the written reflection; raters score turn 0 only
  reflect_prompt text not null,
  answer text not null,                     -- snapshot of exactly what GENE read
  reasoning_grade int not null check (reasoning_grade between 1 and 5),
  thinking_pattern text,
  follow_up_question text not null,
  model text not null,
  prompt_ref text not null,                 -- SIGNETOPS git ref the prompt came from
  prompt_sha256 text not null,              -- hash of the prompt text actually used
  rubric_version text not null,
  input_tokens int,
  output_tokens int,
  latency_ms int,
  at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index gene_reads_turn0 on gene_reads (turn, at);

create table rater_scores (
  id uuid primary key default gen_random_uuid(),
  read_id uuid not null references gene_reads(id) on delete cascade,
  rater_id uuid not null references profiles(id) on delete cascade,
  grade int not null check (grade between 1 and 5),
  rubric_version text not null,
  note text,
  at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (read_id, rater_id)
);

alter table settings add column if not exists rater_review_enabled boolean not null default false;
alter table settings add column if not exists gene_kappa_target numeric check (gene_kappa_target is null or (gene_kappa_target > 0 and gene_kappa_target <= 1));

-- Server-only by design: RLS on, no client policies. Raters read through /api/rate, which strips identity.
alter table gene_reads enable row level security;
alter table rater_scores enable row level security;
