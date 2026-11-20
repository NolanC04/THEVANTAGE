# CLAUDE.md — The Vantage

Read `.github/copilot-instructions.md` (project context), `.github/instructions/design.instructions.md` (approved tokens and copy, which supersede the starting tokens) and `docs/build-phases.md` before any task.

## Standing rules (all four repos)

- Own code, no Base44. Next.js + React, Supabase, Vercel, Claude API where AI is used.
- Preview first. Never merge to main or deploy production without Nolan's approval.
- Admin-judgment gate: nothing ships without approval and a named author of record. Studiolo imports land as drafts.
- No fabrication: no lorem ipsum, invented stats, fake testimonials, prices or dates. Gaps render as `[NOLAN: …]` / `[BRACKETS]`.
- No streaks, points, XP, badges or leaderboards.
- Loud failure: one silent retry, then a visible error with a Retry button. A failed load never shows as empty data.
- Nonpartisan. No military branding or rank; no implied DoD/Air Force endorsement.
- AAPEX is named publicly only on Organizations (licensed program), the military/veteran tier, and its own album (approved canvas). `lib/rules.ts` enforces this on publish.
- No clinical language. Footer keeps the non-clinical disclaimer and the 988 line.
- The Almanac is private to the member (RLS: owner only, no facilitator/admin policy).
- Locked prompts live in NolanC04/SIGNETOPS. GENE's prompt is fetched at runtime (`lib/model-door.ts`); never copy prompt text here.

## Code map

| Path | What |
|---|---|
| `lib/store.ts` | The one data door: Supabase (service role) or the local `.data/store.json` dev store |
| `lib/auth.ts` | Supabase magic link + Google; dev sign-in only when Supabase is unset and not production |
| `lib/access.ts` | Server-side gates for modules and library items |
| `lib/rules.ts` | Public rules re-run on publish |
| `lib/studiolo-package.ts` | `studiolo.vantage/1` schema + HMAC verify (see `docs/contracts/`) |
| `lib/publish.ts` | Draft → published, with author of record |
| `lib/model-door.ts` | The only Claude caller; sealed-lane block; locked prompt fetch |
| `lib/stripe.ts`, `app/api/stripe/webhook` | Tiers come from Stripe webhooks only |
| `lib/idme.ts` | ID.me group verification; stores outcome only |
| `supabase/migrations/` | Schema + RLS |

## Checks before a PR

`npm run typecheck && npm run lint && npm test && npm run build`
