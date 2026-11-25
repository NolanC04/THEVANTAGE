---
applyTo: "**"
---

# Airman AAPEX — Approved Design Reference

Source of truth for look and flow. This file SUPERSEDES the "Design" section of `.github/copilot-instructions.md` (navy / Barlow Condensed is wrong; ignore it) and RESOLVES its "Open decision": the unified app replaces the on-device pilot app and absorbs its check-ins, outcomes and facilitator tools (below).

Approved canvases (Nolan's, view-only links):
- App walkthrough (Learner, Facilitator, Admin): https://claude.ai/artifact/RXyqTsa6H7w21Ki8U4PJQc
- Pilot cohort app (check-ins, outcomes, run sheets): https://claude.ai/artifact/NHR35NEZTbxEkWhmp3eV7t
Exported source (19 Nov 2026), match exactly:
- `docs/design/walkthrough/` — the five approved screens (Main = log in, Learner-Modules, Learner-Player, Facilitator, Admin) plus `canvas.json`. The `<x-dc>`, `{{ }}` and `DCLogic` parts are the canvas runtime, not app code.
- `docs/design/pilot-app/` — the pilot app (`index.html`) and its content file `data.js`: all 24 modules with title, arc, DLO, method, materials, field work, prompts, debrief, self-debrief, summary questions, illustration, scene, and a `closing_draft` per module. Use `data.js` as the seed for Phase 5 content import. `closing_draft` is a compendium DRAFT and must never be shown to learners; only Nolan-authored Closing Laws are shown.
- `public/images/modules/AAPEX_M01.png` … `AAPEX_M24.png` — the 24 module paintings (one per module, scene × phase light). Use on module tiles, the slide player hero and Almanac seals.

## Tokens (exact)

| Token | Hex | Use |
|---|---|---|
| ground | #EEE7D8 | page background (parchment) |
| card | #F7F2E8 | cards, sheets |
| field | #FBF8F2 | inputs, menus |
| primary | #1F3A2E | evergreen: buttons, active states, headings |
| primary-hover | #18302A | |
| on-primary | #F7F2E8 | text on evergreen |
| ink | #141413 | body text, admin header bar |
| text-2 | #2B2B27 | labels |
| muted | #4A4A44 | helper text |
| border | #D6CCB8 | card borders |
| border-input | #BFB39C | input borders |
| rule | #E3DACA | table rules |
| segment | #E2D9C6 | segmented control track, locked tiles |
| activity | #E4ECE3 | tint for slides/rows that carry an activity |
| activity-border | #4F7A62 | |
| disabled | #B8B2A4 bg / #4A4A44 text | |

Type: Cinzel 700 (wordmark AAPEX, headings, module codes M01–M24), EB Garamond (italic bylines, module titles, prompts), Inter 400/500/600 (UI). Google Fonts.
Radii: 12px buttons/inputs, 14px cards and tiles, 20px pills. Min touch target 44px (primary buttons 54px). Phone frame 390×844; Facilitator and Admin are fluid pages (desktop 1280).
No byline under the AAPEX wordmark. **AAPEX materials never mention The Vantage** (Nolan, 21 Nov 2026): not in the app, emails, exports, imported content or module art. The exported canvases and pilot app in `docs/design/` still carry Vantage bylines; do not port them. "The Long Ford" is retired and must not appear anywhere.
Icons: inline stroke SVG; no emoji.

## Roles and the View menu

Learner, Assistant, Facilitator, Admin (plus Comparison member = check-ins only). A "View: <role>" pill menu (Facilitator / Learner / Admin) appears ONLY for people with facilitator or admin access; learners never see it. Only an admin grants facilitator or admin. Every access change and every view of learner data writes to an audit log.

## Learner flow (phone)

1. **Log in** — shield-and-peak logo, AAPEX wordmark, byline. Invite code (auto-uppercase) + email + consent checkbox: "my Almanac is mine to export or delete, GENE never sees my name or email, and quick-check answers may show on the room screen with names." Enter disabled until all three. Returning users get a one-tap email link.
2. **Your modules** — Resume card ("TONIGHT · SESSION P1 / Start M01 · slide 1"); Daily rep card (2-min prompt, save to Almanac, once per day); Phase 1/2/3 segmented control; 2-column tiles M01–M24 with states TONIGHT / OPEN / LOCKED (locked until the facilitator opens them for the class). Sign out.
3. **Slide player** — swipe or arrows; slide thumbnail strip, green-tinted where a slide calls an activity; a cue on the slide scrolls to its activity below. "Follow room" toggle hands navigation to the facilitator ("Live · synced").

### The 13-slide module map (default; admin can edit per module)

| # | Screen | Activity below the slide |
|---|---|---|
| 1–2 | Hook | — |
| 3 | Expose | — |
| 4 | Expose | Quick check: 4 options, "Lock my answer" (room can reveal, optionally with names) |
| 5–6 | Verse | — |
| 7 | Verse | Role-play: text-thread scenario, contact persona opens, 3 decision beats, then resolution |
| 8 | Bridge | Written answer; Submit freezes it. Slides 9+ stay LOCKED until submitted. Optional photo. |
| 9 | Unveil | Shows the learner's Bridge answer beside the reveal |
| 10 | Remix | Rework the Bridge answer |
| 11 | GENE Outro | GENE chat: up to 3 questions, then one closing sentence naming what was uncovered |
| 12 | Almanac | Seal this module (requires Bridge submitted) |
| 13 | Interlude | Closing Law (Nolan-authored only), then the daily rep |

## Facilitator view (desktop page)

- **Classes**: "Create class with 8 sessions"; assign a whole session (trio k, k+8, k+16) or open modules one by one; daily reps on/off between sessions.
- **People & roles**: invite by email; roles tap-to-change; nominations to admit. Assistants see run sheets and can open quick checks, never responses, GENE notes or safety flags. Comparison members only do check-ins. Daily reps show as counts, never text.
- **Run sheet · P1–P8**: "You open with" (facilitator's own story, never shown to learners), unit outcome (one of the 5 C's: Character, Competence, Capability, Cohesion, Capacity), focus skill (required to open), module trio, materials, debrief, Closing Law status (AUTHORED / NOT YET AUTHORED), self-debrief fields, fidelity checklist (delivered as written and on time; Closing Laws verbatim; field work done in session; no clinical language; learners reminded writing is private).
- **Room control**: "[n] of 15 phones following", slide control for followers, Bridge clock, open quick check, reveal answer, show answers with names, send scripted or custom disruption, close the session.
- **Projector view**: opens on the room screen with the deck slide.
- **Safety flags**: raised by GENE's keyword pre-check, the model's flag, or a refusal. The learner has already seen the fixed crisis-line message (Military Crisis Line: 988 then 1, text 838255). Facilitator marks human follow-up done under the unit's safety-routing protocol. Facilitator-only.
- **Warm handoff** link for referrals (chaplain, MFLC).

## Admin view (desktop page)

- **Material**: module list M01–M24 with status (Published vN / Edited / Draft). Per module: title, focus skill, unit outcome (5 C's cycle + text), daily rep prompt, facilitator opener (facilitator-only), role-play scenario (persona · hook · 3 beats · resolution), Closing Law ("Nolan writes this; AI may not author it"). Slide map table (# / screen / activity / image), + Add slide. Save draft (admins only) / Publish to classes (assigned classes get the new version next visit; existing learner answers untouched). Source files: `content/phase-N/module-NN.md` and `content/slides/`.
- **Access**: people table, level tap-to-change (Learner → Facilitator → Admin), Nolan's own row locked, audit-logged.

## Absorbed from the pilot app (must ship)

- **Onboarding agreement**: voluntary/off-duty, training not counseling, Almanac ownership, anonymous outcome use, confidentiality of others' stories, optional audio-recording consent; typed full-name signature; agreement version stored. Role: Cohort member or Comparison group.
- **Check-ins T0 Baseline (before session 1), T1 Midpoint (after session 4), T2 Completion (after session 8), T3 Follow-up (60–90 days)**, using free validated scales verbatim: Satisfaction with Life (Diener et al., 1985; 5 items, 1–7, sum), General Self-Efficacy (Schwarzer & Jerusalem, 1995; 10 items, 1–4, sum), Brief Resilience (Smith et al., 2008; 6 items, 1–5, items 2/4/6 reverse-scored, mean). Copy item text exactly from the pilot app.
- **Outcomes (facilitator)**: per-wave group means cohort vs comparison, n shown; diff-in-diff (T0 → latest wave); Cohen's d; CSV export; note "Small samples: report n, attrition and limits next to every number." These feed The Vantage Organizations report.
- **Day 7 / Day 30 retrieval reviews** after a module is sealed (answer from memory first).
- **Almanac export as text**, delete-everything control.

## Additional unit features (from Nolan, keep)

Anonymous feedback campaigns (5-response threshold), growth-session requests (routed only to admin/facilitator email, no content in email), tracks (Hybrid Athletes, Hybrid Intellects, Faith Forward, Social incl. Guardian Gauntlet) with Discord link. Put these under a "Unit" tab for learners and a "Unit" section for facilitators, styled with the tokens above.

## Added build phases (run after docs/build-phases.md Phase 9)

- **Phase 10 — Slide player + module map**: implement the 13-slide map, Bridge gate (server-enforced), activity cues, thumbnails, swipe. Done when slides 9+ cannot load before Bridge submit, verified by API call.
- **Phase 11 — Room control**: realtime (Supabase Realtime) follow-room sync, follower count, quick check open/reveal/with-names, Bridge clock, disruptions, close session, projector route. Done when two phones follow a facilitator's slide changes within 1 second.
- **Phase 12 — Check-ins and outcomes**: onboarding agreement, comparison group, T0–T3 scales, outcomes tables, CSV. Done when diff-in-diff computes on seeded test data and matches a hand calculation.
- **Phase 13 — Admin material editor + access + audit log + safety flags**. Done when publishing a module bumps its version for assigned classes and every access change appears in the audit log.
