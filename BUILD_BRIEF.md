# The Vantage — Build Brief

Owner: Nolan Langford · Written 18 Nov 2026 · App 4 of 4 in the Vantage build (Airman Apex, Studiolo, Signet Ops, The Vantage)

Read this whole file and the Standing Rules before writing code. Preview first: nothing deploys until Nolan approves. This repo was empty before this commit.

## What the app is

The full Vantage ecosystem app and the paid home for everything: all developed programs, the post-Airman Apex data and projects, newsletters, emails, books and the rest of the library. Studiolo publishes approved pieces straight into it.

## Aesthetic (use exactly)

The Vantage site theme already developed:
- Cormorant (headings) over Jost (body), from Google Fonts
- Gold on near-black, generous spacing, oil-painting imagery
- Signet Visual Standard palette: evergreen, sepia, black, antique gold
- Thumbnail titles five words or fewer
- Feel: closer to Aesop or a watchmaker than a coaching site; regality and a return to class
- Mobile first: most traffic arrives from YouTube and Instagram on phones. The line saying what this is sits directly under the hero headline.

## Sections

- **Home:** hero, what it is, three ways in, founder block [NOLAN: two turbulence moments, 45 words max], proof strip with three [TESTIMONIAL — PENDING MARCH 2027 COHORT] slots. Epigraph: Hillel the Elder, cited (Pirkei Avot 1:14).
- **Programs:** every program as an album (program = album, modules = tracklist), from Studiolo releases.
- **Library:** videos, articles, books, newsletters, skill sheets.
- **Cohort:** the live cohort, dates [NOLAN], info session [NOLAN], refund policy [NOLAN].
- **Organizations:** "Vantage Licensing", with AAPEX as the licensed program name.
- **Account:** member dashboard, purchases, Almanac (private to the member).

## Paywalls

Stripe, test mode until launch. Draft pricing:
- Begin (free): Module 1, whole, email only, no card
- The Vantage Library: $29/month
- The Vantage Cohort: $1,200, ten weeks, twenty seats

**AAPEX is free for active duty military and veterans**, including once the app is civilian-facing. Verify status with a service such as ID.me or SheerID; never collect or store ID photos. Military spouses get a discount [NOLAN: amount].

## Studiolo import

Accept signed one-way release packages from Studiolo at an import endpoint (VANTAGE_IMPORT_SECRET). Imported pieces land as drafts; Nolan publishes them. The Vantage never reads from Studiolo.

## Public rules

- Nonpartisan. No military branding or rank; service mentioned as plain fact only, with no implied DoD or Air Force endorsement.
- Public pages never name AAPEX except as the licensed program name on Organizations and the free military tier.
- No clinical language (no therapy, counseling, treatment, diagnosis). Footer keeps the non-clinical disclaimer and the 988 line.
- No lorem ipsum, invented stats or fake testimonials; use [BRACKETS].

## Build order

1. Scaffold, theme tokens, layout, mobile nav.
2. Home, Programs, Library as static pages with seed content.
3. Auth and member accounts (Supabase).
4. Stripe tiers and the military/veteran verification flow.
5. Studiolo import endpoint.
6. Newsletter and email capture.

## Standing Rules (all four repos)

- Own code, no Base44. Next.js + React, Supabase, Vercel, Claude API where AI is used.
- Preview first. Deploy on Nolan's approval.
- Admin-judgment gate: nothing ships without approval and a named author of record.
- No fabrication; gaps marked [NOLAN: ...].
- No streaks, points, XP, badges or leaderboards.
- Loud failure: one silent retry, then a visible error with a retry button.
- Keep a CLAUDE.md with these rules and a README with setup.
