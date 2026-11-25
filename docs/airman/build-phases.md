# Airman Apex — Build Phases

Run one phase per request: "Execute Phase N in docs/build-phases.md." Each phase ends with a PR, a Vercel preview link, and a short report: what was built, what is stubbed, what needs Nolan. Never merge without approval. All rules in `.github/copilot-instructions.md` apply.

---

## Phase 0 — Foundation

- Delete `.github/workflows/azure-webapps-node.yml`.
- Scaffold Next.js (App Router, TypeScript, Tailwind, ESLint). Add Supabase client (server + browser), env template `.env.example` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, ANTHROPIC_MODEL, RESEND_API_KEY, NOTIFY_FROM, DISCORD_INVITE_URL).
- Design tokens from the instructions file; Barlow Condensed + Inter; base layout with header, mobile bottom nav, footer carrying the Military Crisis Line and the unofficial disclaimer.
- `lib/fetchWithRetry.ts`: one silent retry, then throw a typed error; `<LoudError onRetry>` component in GENE-free plain voice.
- `CLAUDE.md` and README (setup, env, go-live checklist).
- **Done when:** preview loads on a phone at 390px with no horizontal scroll; README explains setup in under 10 steps.

## Phase 1 — Auth and roles

- Supabase auth (email magic link). `profiles` table: id, role (airman | facilitator | admin), unit, flight, anon_id (AX-XXXX##, generated), created_at.
- RLS: users read/update only their own profile; facilitators read profiles in their unit; admin reads all.
- Role-gated routes: `/app` (Airman), `/facilitator`, `/admin`.
- Seed script creates one admin from an env email.
- **Done when:** three test accounts land on three different home screens, and an Airman cannot load `/facilitator`.

## Phase 2 — Feedback loop (MOVED to NolanC04/UNITTOOLS, 23 Nov 2026; do not build here)

- Tables: `feedback_forms` (questions JSON), `feedback_campaigns` (form_id, unit, flight, sent_at, closes_at, status), `feedback_responses` (campaign_id, answers JSON, submitted_at — NO user_id), `campaign_receipts` (campaign_id, user_id, submitted bool) so a person can't submit twice while the response itself stays unlinked.
- Facilitator: build a form (multiple choice, scale 1–5, short text), send to unit or flight, see status.
- Airman: inbox of open campaigns, submit once.
- Report view: aggregates per question; hidden with a clear message until responses ≥ 5.
- End of form: a separate "Want to talk? Request a session" link (not part of the anonymous response).
- "You said / We did" page: facilitator posts what changed from a campaign.
- **Done when:** a test campaign goes sent → received → stored → reported, and the report stays hidden at 4 responses and appears at 5.

## Phase 3 — Growth session requests

- Tables: `session_requests` (user_id, kind: one_on_one | small_group | flight, preferred_times, note, status: new | scheduled | completed | closed, created_at), `request_messages` (request_id, author_id, body, at).
- Airman: request form with kind, times, optional note; thread view.
- Facilitator/Admin: queue, status changes, threaded replies.
- Email notify on new request and on each reply — body contains only "You have a new message on Airman Apex" + link. Never the note.
- RLS: requester + facilitators/admin only.
- Crisis Line shown on the request screen.
- **Done when:** a request travels Airman → admin email → reply in app → Airman email, with no personal content in either email.

## Phase 4 — Tracks, events, Discord (flight blocks MOVED to NolanC04/UNITTOOLS)

- Tables: `tracks` (seed the four), `events` (track_id, title, starts_at, location, description, capacity), `rsvps`, `flight_blocks` (unit, flight, month, topic, starts_at, facilitator_id, source_campaign_id).
- Airman: tracks page, event list, RSVP. Discord button from `DISCORD_INVITE_URL`.
- Facilitator: create events; schedule monthly 45-minute blocks per flight; link a block's topic to the campaign that chose it.
- Seed one event: Guardian Gauntlet with working signup.
- **Done when:** Guardian Gauntlet is listed and an Airman can RSVP and cancel.

## Phase 5 — Module content model and walkthrough UI

- Tables: `modules` (number 1–24, phase: shield | sword | star, title, hook, learn_md, fieldwork JSON, reflect_prompt, closing_law_id nullable), `closing_laws` (text, authored_by, approved bool).
- Seed 24 rows with numbers, phases and session mapping only; every content field is `[NOLAN: ...]` until content is imported. Do NOT write module content.
- Module page tabs: Learn / Field work / Reflect / Review. Session grouping view (session k = modules k, k+8, k+16).
- Content import: admin uploads a JSON or Markdown bundle (and later a `studiolo.apex/1` package) that fills module fields; show a diff and require approval before saving.
- Visual reference: Nolan's existing walkthrough visual — ask Nolan to upload screenshots to `docs/design/` before styling this phase.
- **Done when:** all 24 modules render with placeholders, grouped into 8 sessions, and an import shows a diff before saving.

## Phase 6 — Class-only access wall

- Tables: `class_sessions` (code 6 chars, module_ids int[], opened_by, opened_at, closed_at), `class_joins` (class_session_id, user_id, joined_at).
- Facilitator: "Start class" picks modules (default: the pilot session trio), shows code + QR full screen, "End class" closes it.
- Airman: "Join class" by code or QR.
- Enforcement in RLS / server: module content (learn_md, fieldwork, reflect_prompt) is readable only while the user has a join on an open class session that includes that module. Admin bypass.
- After class: [NOLAN: decide whether completed modules stay readable]. Implement as a setting `modules_readable_after_completion` default false.
- **Done when:** content is unreadable before joining, readable during class, and unreadable again the moment the facilitator ends the class (verified by direct API call, not just UI).

## Phase 7 — GENE reflection and the Almanac

- Server route calling Claude with the GENE behavior from the instructions file. Input: the module's reflect prompt + the Airman's written answer. Output JSON: reasoning_grade 1–5, thinking_pattern (short), follow_up_question. Show only the follow-up question to the Airman; never a grade label that reads as a score.
- Tables: `module_entries` (user_id, module_id, fieldwork JSON, reflection, gene_follow_up, commitment_when, commitment_will, closing_law_id, shared bool, sealed_at), `observations` (user_id, text, rating: true | partly | not | null, rated_at), `reflection_stats`.
- Recognition scoring with the 70% cadence rule; max one reflection per turn.
- Seal: locks the entry; shows the Closing Law only if Nolan-authored and approved.
- Almanac page: sealed entries grouped by phase with Shield/Sword/Star seals; copy as text; export (JSON) by the Airman.
- Day 7 / Day 30 review prompts surface on Home based on sealed_at.
- **Done when:** a written reflection gets one GENE question back, sealing works, the Almanac is invisible to a facilitator unless shared, and a forced API failure shows the loud-failure retry.

## Phase 8 — Interactive layer

- Break games: 12 named games are in Nolan's spec. Build a `BreakGame` interface and one reference game; leave 11 slots as `[NOLAN: game name + rules]`. No scores, timers that shame, or leaderboards.
- Radial transition engine between modules: SHATTER, HELIX and FOLD moves over 32 wedge segments with a particle ignition. Use CSS/Canvas first; WebGL only if performance on a mid-range phone holds 60fps. Respect `prefers-reduced-motion` (fade instead).
- Verification: Airman confirms completion of field work items with a short written proof; facilitator can mark verified.
- **Done when:** transitions run between modules on a phone without jank and are skipped under reduced motion.

## Phase 9 — Polish and briefing

- Accessibility pass (labels, contrast, focus order, screen-reader names).
- PDF briefing export for leadership: anonymous aggregates only (campaign results, blocks delivered, requests by kind and status, event attendance). No names.
- Empty, loading and error states on every screen.
- **Done when:** Lighthouse accessibility ≥ 95 on Home, Module and Report screens, and the PDF contains no personal data.

---

## Open decision for Nolan (blocks Phase 6 scope)

The 15 Nov 2026 pilot app (Claude artifact) keeps all Airman data on-device with no server. This app uses a backend. Decide: this app replaces the pilot app, or the pilot app stays as the March 2027 cohort tool and this app serves the unit side.
