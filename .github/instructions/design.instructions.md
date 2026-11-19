---
applyTo: "**"
---

# The Vantage — Approved Design Reference

Source of truth for look and copy. These exact tokens SUPERSEDE the "starting tokens" in `.github/copilot-instructions.md`. Approved canvas (five pages): https://claude.ai/artifact/9LP6spVPisSLQKFgNpNzBU. If exported HTML or images are added under `docs/design/`, match them exactly.

## Tokens (exact)

| Token | Hex | Use |
|---|---|---|
| ground | #0D0B08 | page background |
| surface | #16130E | alternate band (Library band, Apply, Path) |
| gold | #C8A45D | eyebrow labels, links, primary button fill, numerals |
| text | #EDE5D3 | headings, body on dark; button hover fill |
| body-muted | #B3A993 | paragraph copy |
| dim | #8C8371 | captions, labels, footer |
| rule | #3A3222 | section rules, input underlines |
| rule-faint | #2A2418 | sidebar and footer borders |
| error | #E2A58F | inline error text |
| outline button border | rgba(200,164,93,.55) | |

Type: Cormorant Garamond (300 for display, 400 for titles, italic 300 for quotes) + Jost (300/400/500 UI and body), Google Fonts.
- Display h1: Cormorant 300, clamp(56px, 8vw, 116px), line-height .95, max ~11ch.
- Section h2: Cormorant 300, 44–56px.
- Eyebrow: Jost 13px, letter-spacing .28em, uppercase, gold.
- Body: Jost 15–17px, line-height 1.7–1.8, body-muted.
- Primary button: gold fill, ground text, Jost 500 15px, padding 18×32, square corners; hover = text fill, ground text. Outline button: 1px gold @55%, gold text; hover border gold, text color text.
- Focus: 1px gold outline, offset 4px. Square corners everywhere. No shadows, no gradients except image scrims.
- Layout: max-width 1360px, side padding 48px; vertical rhythm 176–200px between sections (88px on phones). Content images are oil paintings, full-bleed with dark scrims (top 55% → clear → bottom 92%).
- Motion: hero image scale-in 900ms, copy rise 800ms (only with prefers-reduced-motion: no-preference); image frames scale 1.03 on hover over 250ms.
- Inputs: underline only (1px rule), transparent, 18px text, labels 13px dim above.

## Pages and approved copy

**Home** — Nav: The Vantage · Programs · Library · Cohorts · Organizations · [Begin]. Eyebrow "The Vantage by Langford". H1 "Author the life you were built for." Buttons "Begin with the free module" / "See the program". Kicker (italic) "Turbulence takes away structure. Structure gives back direction." then "Programs for people in transition who intend to build. Each one is measured, personal, and leaves you a record that's yours to keep." "AAPEX, in three movements": I · The Shield / Resiliency / Hold steady while everything moves. II · The Sword / Efficacy / Act with intent, under pressure. III · The Star / Polymathy / Build across every part of your life. (3:4 image cards.) Library band: "Inside, the program reads you back." GENE — Reads your reasoning, not your answers. The Almanac — A record that compounds, and stays yours. The Dome — What was given to you, and what you chose to build. "Three ways in": Begin / Free / The first module, whole. · The Library / $29 a month / Every program, your guide, your Almanac. · The Cohort / $1,200 / Ten weeks, live, twenty seats. "The inner circle is by invitation. Organizations, see licensing." Founder quote: "Twice, turbulence took my structure and I drifted. Twice, structure gave me back my direction. Every program here is the system I needed and didn't have." — Nolan Langford · Founder (this is approved; it replaces the [NOLAN] founder bracket).
Footer: "An educational program, not a clinical or counseling service. In crisis, call or text 988; veterans press 1." "© 2026 Langford Signet LLC".

**Library (member view)** — left sidebar: Today, Programs, My Almanac, The Dome, Cohorts. Today hero: current module (eyebrow "II · The Sword · Module 12", title, "Lesson · 14 min · Scenario · Worksheet"). "GENE asks" with a large Cormorant question, underline textarea, "Send to GENE" (empty → "Write an answer first. One honest sentence is enough."); GENE reply with gold left rule and "Sealed into your Almanac". My Almanac: "n of 24 modules sealed", 4:3 tile grid (sealed = image, current = gold-bordered "12 · NOW", open = numbers), GENE pattern line in italic. The Dome: two columns Given / Chosen. Invitation band "An invitation from your Almanac" → "See the next cohort". The sample text in the canvas is placeholder; render member data.

**Cohorts** — H1 "Do the hard work among people." Eyebrow "The Cohort · Twenty seats". $1,200; "Founding members $900 · Starts [date]". "Ten weeks, three movements": Weeks 1–3 Hold steady; 4–7 Act with intent; 8–10 Build across your life (with the canvas copy). Info session line with [next date]. Apply form: Full name, Email, "Where you are now" (Separating from the military within a year / Veteran / Civilian, building something / Between chapters), "What you intend to build"; "Send application"; "An answer within a week, and no sales call." FAQ: Is this therapy or coaching? (Neither…) / What if I miss a session? ([attendance standard]) / Refund policy ([Refund policy]).

**Organizations** — H1 "A program that arrives with its evidence." "Licensed for your people, delivered by your facilitators, measured against a comparison group." Outcome report: Change against a comparison group / Completion rate / Cost per participant, each [ — ] until pilot data ("First pilot data publishes after March 2027"). Path: I Conversation, II Pilot, III Report, IV License. "$5,000 – $15,000 per site, per year · pilot sites receive founding terms". Request form: name, organization, work email, outcome that matters most.

**Programs** — follow the canvas Programs page (album model, AAPEX tracklist).

## Pricing reconciliation

Membership tiers above plus: AAPEX free for verified active duty and veterans; military spouse discount [NOLAN: amount]; Cohort founding price $900; Licensing $5k–$15k per site per year.

## Images

The canvas images are oil paintings hosted inside the canvas. Until Nolan exports them to `public/images/`, render a dark #16130E block with the alt text as a caption. Never substitute stock photos.
