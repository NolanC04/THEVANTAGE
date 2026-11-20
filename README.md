# The Vantage

The Vantage by Langford: the public ecosystem app and paid home for every program, the library, the cohort and licensing. Next.js (App Router) · Supabase · Stripe · ID.me · Resend · Claude API · Vercel.

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill what you have; everything else degrades loudly
npm run dev                  # http://localhost:3000
```

Without Supabase keys the app runs on a local dev store (`.data/store.json`, seeded with AAPEX's 24-track album) and a development sign-in that needs no email. That mode is refused in production.

Unconfigured services answer with a visible "Not configured: …" message, never a silent empty state.

## Set up the services

1. **Supabase** — create a project, run `supabase/migrations/*.sql` (SQL editor or `supabase db push`), enable Email (magic link) and Google providers, set the site URL and `/auth/callback` redirect. Put the URL, anon key and service-role key in env. Seed AAPEX by inserting the rows from `lib/seed.ts` (or import a Studiolo package per module).
2. **Admin** — set `VANTAGE_ADMIN_EMAIL` to Nolan's sign-in email. Only that account sees `/admin` and can publish.
3. **Stripe (test mode)** — create Products/Prices: Library $29/month (recurring), Cohort $1,200 and Founding $900 (one-time). Paste price IDs. Create a coupon for the military spouse discount once Nolan sets the amount. Add a webhook to `/api/stripe/webhook` for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `charge.refunded`. Enable the Customer Portal.
4. **ID.me** — register an app with the `military` scope, callback `${NEXT_PUBLIC_SITE_URL}/api/verify/idme/callback`. Verify the subgroup labels in `lib/idme.ts` against ID.me's sandbox before launch.
5. **Resend** — verify the sending domain; set `RESEND_API_KEY`, `EMAIL_FROM`, `INQUIRY_TO_EMAIL`.
6. **Studiolo import** — share `VANTAGE_IMPORT_SECRET` with Studiolo. Test with `VANTAGE_IMPORT_SECRET=… node scripts/send-sample-package.mjs http://localhost:3000/api/import/studiolo` (add `--tamper` to see a 401).
7. **GENE** — set `ANTHROPIC_API_KEY`; `GITHUB_TOKEN` (read access to NolanC04/SIGNETOPS) so the locked prompt can be fetched.
8. **Vercel** — import the repo, add the env vars, keep production deploys behind Nolan's approval.

## Checks

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

## Status against `docs/build-phases.md`

| Phase | State |
|---|---|
| 0 Foundation | Built. `/tokens` renders at 390px with no horizontal scroll. |
| 1 Home | Built from the approved canvas; testimonials are brackets; Hillel epigraph cited. |
| 2 Programs + Library | Built. AAPEX album with the 24-track list (titles and paintings from the canvas, no lesson content). Drafts never render publicly. |
| 3 Accounts | Built. Magic link + Google; member dashboard; Almanac owner-only (RLS). Needs a live Supabase to verify the RLS by direct API call. |
| 4 Paywalls + military | Built against Stripe and ID.me APIs; needs test keys to run end to end. |
| 5 Studiolo import | Built and verified locally: signed package → draft, tampered → 401, publish needs admin + checkbox + author, rules block AAPEX/clinical words. |
| 6 Newsletter, Organizations, Cohort | Built. Double opt-in, inquiry routes to Nolan only, seat counter from paid purchases. |
| 7 Polish | Partly: sitemap, robots, 404, error/Retry, metadata. Lighthouse run pending a preview URL. |

## Waiting on Nolan

- `[NOLAN]` items: cohort start and info-session dates, attendance standard, refund policy, OWNERSHIP release date, the three Organizations report figures, spouse discount amount, AAPEX acronym expansion, a GENE question per module.
- Decision: the approved canvas names AAPEX on Home and Programs, while the build brief limits AAPEX to Organizations and the military tier. The build follows the approved canvas and flags the conflict here.
- Sending domain for email; ID.me (or SheerID) account.
