# The Vantage — Build Phases

Run one phase per request: "Execute Phase N in docs/build-phases.md." Each phase ends with a PR, a Vercel preview link and a short report (built / stubbed / needs Nolan). Never merge without approval. All rules in `.github/copilot-instructions.md` apply.

---

## Phase 0 — Foundation and theme

- Scaffold Next.js (App Router, TypeScript, Tailwind, ESLint). `.env.example`: Supabase, Stripe (secret, publishable, webhook secret, price IDs), verification provider keys, RESEND_API_KEY, VANTAGE_IMPORT_SECRET.
- Theme tokens and fonts from the instructions file; global layout, nav that collapses at ≤768px, footer with non-clinical disclaimer and 988 line.
- `CLAUDE.md`, README with setup.
- **Done when:** a token sample page renders on a phone at 390px with no horizontal scroll.

## Phase 1 — Home

- Hero H1 "Author the life you were built for" [NOLAN: confirm], with the what-this-is line directly beneath; hero no taller than one phone screen.
- Kicker "Turbulence takes away structure. Structure gives back direction." above the founder block; founder quote as [NOLAN] bracket; approved credentials line.
- Proof strip: three [TESTIMONIAL — PENDING MARCH 2027 COHORT] slots.
- "Three ways in" cards: Begin (free) / The Vantage Library ($29/mo) / The Vantage Cohort ($1,200, ten weeks, twenty seats); Library card highlighted in gold.
- Hillel epigraph, cited.
- **Done when:** Home reads clearly on a phone and every missing item shows as a bracket, not invented text.

## Phase 2 — Programs and Library

- `programs` and `modules` tables (album model fields: word, acronym, family, thesis, pain_line, cover_url, tracklist order, status draft | published).
- Programs index grouped by the five families; program page as an album (cover, thesis, tracklist); module page gated by tier.
- Library index: videos, articles, books, newsletters, skill sheets with type filters.
- Seed AAPEX with 24 module stubs (numbers, phases Shield/Sword/Star, no content).
- **Done when:** AAPEX shows its 24-track list and an unpublished item never appears publicly.

## Phase 3 — Accounts

- Supabase auth (magic link + Google). `members` (tier: free | library | cohort | military, verified_military bool, spouse_discount bool).
- Member dashboard: my programs, purchases, Almanac (private, RLS).
- **Done when:** a member sees only their own Almanac, verified by direct API call.

## Phase 4 — Paywalls and military access

- Stripe Checkout for Library (subscription) and Cohort (one-time, inventory 20 seats per cohort); Customer Portal; webhook updates tier.
- Free tier: Module 1 with email only.
- Military/veteran: "Verify with ID.me" (or SheerID) flow; on success set verified_military and unlock AAPEX at $0. Never store documents.
- Spouse discount: verification type "military spouse" applies a Stripe coupon [NOLAN: amount].
- Gate checks server-side on every protected route and API.
- **Done when:** in Stripe test mode, each tier unlocks the right content, a canceled subscription relocks it, and a verified veteran gets AAPEX free.

## Phase 5 — Studiolo import

- `POST /api/import/studiolo`: verify HMAC-SHA256 with VANTAGE_IMPORT_SECRET; accept `studiolo.vantage/1` JSON; upsert as draft; reject bad signatures with 401.
- Admin drafts queue: preview, publish (records author of record + timestamp).
- Re-run public rules on publish: no AAPEX outside allowed places, no military branding, no clinical words.
- **Done when:** a signed sample package lands as a draft, a tampered one is rejected, and publish requires Nolan.

## Phase 6 — Newsletter, email, Organizations, Cohort

- Email capture with double opt-in (Resend); newsletter archive page.
- Organizations page: "Vantage Licensing", AAPEX as licensed program, three [NOLAN] report figures, inquiry form (no auto-sales emails; inquiries route to Nolan).
- Cohort page: dates, info session, attendance standard, refund policy as brackets; seat counter from Stripe inventory.
- **Done when:** sign-up confirms by email and the Organizations inquiry reaches Nolan only.

## Phase 7 — Polish

- Accessibility (Lighthouse ≥ 95), SEO metadata and Open Graph images per program, sitemap, 404, loading and error states everywhere.
- **Done when:** Lighthouse ≥ 95 for accessibility and performance on Home and a program page, mobile.
