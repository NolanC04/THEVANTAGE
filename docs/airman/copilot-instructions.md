> **Merged 24 Nov 2026:** this program now runs inside The Vantage as its military segment (internal name: The Airman Vantage, public label: Military and veterans). Routes live under `/airman`, APIs under `/api/airman`, tables are prefixed `airman_`. Where this file says "separate repo" or "never mention The Vantage", the root `CLAUDE.md` now governs.

# Airman Apex — Project Instructions for the AI coding agent

You are building Airman Apex for Nolan Langford, an active-duty Air Force Senior Airman (Security Forces, Malmstrom AFB), Master Resilience Trainer (MRT) and resiliency instructor. Read this file in full before every task. Build phases live in `docs/build-phases.md`; do exactly one phase per request unless told otherwise, then stop and report.

## What Airman Apex is

A free, voluntary, off-duty formation program for Air Force members. Offer line: "Hybrid intellects and hybrid athletes." It is the pilot program, military cohorts first. Its results later feed a separate civilian app (a separate repo). **AAPEX materials never mention The Vantage** — no byline, footer, email, export or module text.

**Not unit tooling.** Official resiliency training delivered as part of Nolan's duties never uses this app, its branding or its data (V3 report, Section 15). Unit feedback campaigns, flight blocks, "you said / we did" and leadership briefings were split out on 23 Nov 2026 into the separate NolanC04/UNITTOOLS repo. Do not add unit- or duty-scoped features here.

One app, two halves:

1. **Facilitation** — growth-session requests (one-on-one, small group, team), tracks and events, Discord link.
2. **Module walkthrough** — the 24-module AAPEX program, viewed one module at a time, unlocked only during class.

## Stack (fixed)

- Next.js (App Router, TypeScript), React, Tailwind
- Supabase: auth, Postgres, row-level security (RLS) on every table
- Vercel hosting with preview deployments per branch
- Claude API (Anthropic) for GENE, server-side only, key in env
- Email: Resend (or equivalent) from a non-.mil sender domain
- Delete `.github/workflows/azure-webapps-node.yml` (an unused Azure template that conflicts with Vercel).
- No Base44. Nolan owns this code.

## Roles

- **Airman** — joins classes, submits anonymous feedback, requests sessions, RSVPs to events, works modules, keeps an Almanac.
- **Facilitator (MRT)** — sends feedback campaigns, reads aggregates, answers requests, runs class sessions, schedules blocks.
- **Admin (Nolan)** — everything a facilitator can do, plus settings, users, content, Closing Laws.

## Domain glossary

- **Feedback campaign** — a form pushed to a unit or flight. Loop: sent → received → stored → reported.
- **Growth session request** — an Airman asks for one-on-one, small-group or whole-flight coaching.
- **Tracks** — Hybrid Athletes (run club and fitness events), Hybrid Intellects (extended conversation on relevant uncommon strategies), Faith Forward (Bible study rooted in application), Social (mentorship and unit events, e.g. the Guardian Gauntlet).
- **Phases** — Phase 1 Resiliency = the Shield; Phase 2 Efficacy = the Sword; Phase 3 Polymathy = the Star. 8 modules each, 24 total, numbered continuously 1–24.
- **Session (pilot cadence)** — 8 sessions; session k covers modules k, k+8, k+16 (one module from each phase).
- **Class session** — a live class opened by a facilitator with a code/QR that unlocks modules.
- **GENE** — the Socratic reader. Grades the reasoning behind a written answer, never the answer itself, and asks the one question that exposes the thinking behind the thinking.
- **Almanac** — the Airman's private record of sealed module entries.
- **Closing Law** — a one-line principle that closes a module. Only Nolan-authored laws are ever shown. AI never writes them.

## Non-negotiable rules

1. **Privacy first.** Feedback responses carry no user link. Flight-level reports stay hidden until at least 5 responses. Notification emails never contain a request's reason or any personal detail; they say a request exists and link into the app.
2. **Almanac is private.** Only the Airman reads their own entries. Facilitators see an entry only if the Airman toggled "share with facilitator" on it. Enforce with RLS, not just UI.
3. **No clinical or diagnostic language** anywhere: no therapy, counseling, treatment, diagnosis, disorder, depression (as a label), symptoms. This is resiliency training, not mental health care.
4. **No engagement mechanics.** No streaks, points, XP, badges, leaderboards, or progress-shaming.
5. **No fabrication.** Never invent module content, Closing Laws, quotes, statistics or testimonials. Where content is missing, render a visible placeholder like `[NOLAN: module 7 field work]`.
6. **Loud failure.** Every save or load: retry silently exactly once; if it fails again, show a visible in-voice message with a Retry button. A failed load must never display as empty data.
7. **Admin-judgment gate.** Any AI output that would change stored content is shown as a proposal (what changes, why, source) and needs an explicit checkbox plus click to approve.
8. **Military Crisis Line** visible in the footer and on request screens: dial 988 then press 1, or text 838255.
9. **Unofficial.** Show: "Unofficial program resource. Not an activity of the U.S. Air Force or DoD; no federal endorsement implied." No USAF logos or insignia.
10. **Preview first.** Never merge to main or deploy to production without Nolan's explicit approval. Work on a branch, open a PR, and post the Vercel preview link.

## GENE behavior (from the locked prompt in NolanC04/SIGNETOPS `cowork-prompts/gene.md`)

- Persona: an older, blunt, dry-humored man. Questions first; never opens with conclusions. Blunt, never cruel. Humor never undercuts a serious moment.
- Reads for what is true underneath the surface; never hands back a generic assessment; never fabricates a detail; admits insufficient signal instead of inventing insight.
- Recognition scoring: about every third filed observation, GENE surfaces one back as a reflection (not a fact) with three controls: True / Partly true / Not true. Store rating + timestamp. A miss makes GENE's next reply a brief curious follow-up, never a defense. Max one reflection per turn. If a user's running true-or-partly-true rate falls below 70%, halve reflection frequency.
- Loud failure on observation saves and dossier load, exactly as rule 6.
- GENE never plans actions ("That's SILAS's desk") and never builds courses ("That's FORGE's line").
- Keep a pointer to the SIGNETOPS prompt file in code comments; do not fork the prompt text.

## Design

Airman AAPEX look (from the approved flyer): navy `#14213D` as primary ink, dark brass accent, cream ground, white cards with 2px navy borders and square corners. Type: Barlow Condensed (headings, caps) + Inter (body), from Google Fonts. Mobile first: Airmen will use this on phones. Phase emblems: Shield, Sword, Star.

## Before go-live (not code, but keep a checklist in README)

Unit privacy office / JA sign-off on data handling; Privacy Act statement decision for the request form; referral language coordinated with the Chaplain and MFLC; retention policy (purge request threads 90 days after completion, keep anonymous aggregates); test that .mil inboxes accept the sender domain.

## Related repos

- NolanC04/SIGNETOPS — locked prompts (single source of truth). Point to it; never copy.
- NolanC04/STUDIOLO — the authoring engine. It pushes approved content into this app one way via a signed `studiolo.apex/1` package. This app never reads Studiolo.
- NolanC04/THEVANTAGE — the public ecosystem app.
