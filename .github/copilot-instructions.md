# The Vantage — Project Instructions for the AI coding agent

You are building The Vantage by Langford: Nolan Langford's full ecosystem app and the paid home for everything he makes. Read this file in full before every task. Build phases live in `docs/build-phases.md`; do one phase per request, then stop and report.

## What The Vantage is

The master brand (locked 13 Nov 2026) for Nolan's programs, content and business: YouTube, Instagram, newsletter, books, cohorts and licensing. The app holds all developed programs, post-Airman Apex data and projects, newsletters, emails, books and the full library. Positioning: programs for people in transition who intend to build. Hook: "Hybrid intellects and hybrid athletes." Studiolo (NolanC04/STUDIOLO) is the only author; it pushes approved pieces here through signed one-way packages. The Vantage never reads Studiolo.

## Audience and traffic

Most visitors arrive from YouTube and Instagram on phones. Mobile first, always. The line that says what this is must sit directly under the hero headline, not below a tall hero.

## Offer ladder

- **Free:** long and short video; Module 1 whole, email only, no card.
- **Low:** books, workbooks, skill sheets.
- **Mid:** The Vantage Library, $29/month (self-paced programs).
- **High:** The Vantage Cohort, $1,200, ten weeks, twenty seats (the main product).
- **Premium:** small capped mastermind [NOLAN: price, later].
- **Licensing:** "Vantage Licensing" for units and organizations; AAPEX is the licensed program name.

**AAPEX is free for active duty military and veterans**, including once the app is civilian-facing. Verify status through a third-party service (ID.me or SheerID); never collect, view or store ID images. Military spouses get a discount [NOLAN: amount].

## Programs (album model, from The Art of the Program)

Each program is one word expanded into an acronym. Program = album, module = song (verse = teaching, hook = one repeated principle, bridge = scenario assessment, outro = GENE question), tracklist = module order, liner notes = the member's Almanac, discography = the Almanac across programs. Lead single = free module. Title template: "The [WORD] Program, by The Vantage" [NOLAN: confirm]. AAPEX is the flagship: 24 modules across Shield (Resiliency), Sword (Efficacy), Star (Polymathy). Programs sit in five families: The Self, The Mind, The Engine, The Structure, The Legacy.

## Aesthetic (use exactly)

- Cormorant (headings) over Jost (body), Google Fonts.
- Gold on near-black; generous spacing; oil-painting imagery; feels closer to Aesop or a watchmaker than a coaching site; regality and a return to class.
- Signet Visual Standard palette: evergreen, sepia, black, antique gold. Starting tokens (refine to Nolan's site draft when he supplies exact values): `--ink #0E0D0B` near-black ground, `--gold #D4AF37`, `--gold-lit #E3C766`, `--evergreen #0B2E1F`, `--linen #EDE6D3`, `--muted #B3A993`. Light theme optional later.
- Thumbnails: oil-study, subject in left third, title five words or fewer.
- Section padding: 140px desktop, 88px at ≤768px. No horizontal scroll at 390px.

## Stack (fixed)

Next.js (App Router, TypeScript), Tailwind, Supabase (auth, Postgres, RLS), Stripe (Checkout + Customer Portal + webhooks; test mode until launch), ID.me or SheerID for military/veteran verification, Resend for email, Vercel. No Base44.

## Non-negotiable rules

1. **Nonpartisan.** No political or ideological language.
2. **No military branding.** Service mentioned only as plain fact ("serving in the U.S. Air Force"); no rank, uniform, insignia, or implied DoD/Air Force endorsement.
3. **AAPEX** is named publicly only as the licensed program on Organizations and in the free military/veteran tier.
4. **No clinical or diagnostic language** (therapy, counseling, treatment, diagnosis). Footer keeps a non-clinical disclaimer and the 988 line.
5. **No fabrication.** No lorem ipsum, invented stats, fake testimonials, prices or dates. Use [BRACKETS] Nolan fills.
6. **No engagement mechanics** (streaks, points, XP, badges, leaderboards).
7. **Almanac is private** to the member; enforce with RLS.
8. **Loud failure:** one silent retry, then a visible message with Retry.
9. **Author of record:** nothing publishes without Nolan's approval; Studiolo imports land as drafts.
10. **Preview first.** Never merge to main or deploy production without Nolan's approval.

## Content Nolan still owes (render as brackets)

Founder quote (two turbulence moments and what structure fixed, 45 words max); three testimonials (pending the March 2027 cohort); OWNERSHIP program release date; cohort start date, info session date, attendance standard, refund policy; three Organizations report figures; spouse discount amount.

Credentials line (approved): "Master Resilience Trainer · Resiliency instructor · Builder of 27 programs." Epigraph: "If I am not for myself, who will be for me? If I am only for myself, what am I? And if not now, when?" (Hillel the Elder, Pirkei Avot 1:14). Kicker: "Turbulence takes away structure. Structure gives back direction."

## Related repos

NolanC04/STUDIOLO (author; sends `studiolo.vantage/1` packages), NolanC04/AIRMANAAPEX (unit program app; its results feed Vantage proof later), NolanC04/SIGNETOPS (locked prompts; point, never copy).
