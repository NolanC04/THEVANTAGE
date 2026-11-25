import Link from "next/link";
import { currentProfile } from "@/lib/airman/auth";
import { modules, entriesOf, openSessions, settings } from "@/lib/airman/data";
import { store } from "@/lib/airman/store";
import { PHASES, code, sessionOf, gap } from "@/lib/airman/program";
import { Painting } from "@/components/airman/Painting";
import type { Join } from "@/lib/airman/access";
import { DailyRep } from "./DailyRep";
import { Reviews } from "./Reviews";

export default async function Modules({ searchParams }: { searchParams: Promise<{ phase?: string }> }) {
  const p = (await currentProfile())!;
  const sp = await searchParams;
  const phase = PHASES.find((x) => x.key === sp.phase) ?? PHASES[0];
  const [mods, entries, sessions, joins, s, rep] = await Promise.all([
    modules(), entriesOf(p.id), openSessions(), store().list<Join>("class_joins", { user_id: p.id }), settings(),
    store().get<{ id: string }>("daily_reps", { user_id: p.id, day: new Date().toISOString().slice(0, 10) }),
  ]);
  if (p.role === "comparison")
    return (
      <main className="page">
        <h1 style={{ fontSize: 22 }}>Check-ins</h1>
        <p>You&apos;re in the comparison group. Your part is the four short check-ins.</p>
        <Link className="btn" href="/airman/app/checkins">Open check-ins</Link>
      </main>
    );
  const joined = new Set(joins.map((j) => j.class_session_id));
  const tonight = new Set(sessions.filter((x) => joined.has(x.id)).flatMap((x) => x.module_numbers));
  const staff = p.role !== "learner";
  const sealed = new Set(entries.filter((e) => e.sealed_at).map((e) => e.module_number));
  const resume = [...tonight].sort((a, b) => a - b).find((n) => !sealed.has(n));
  const resumeEntry = entries.find((e) => e.module_number === resume);
  return (
    <main className="page" style={{ display: "grid", gap: 14 }}>
      <h1 style={{ fontSize: 22, margin: "8px 0 0" }}>Your modules</h1>
      {resume ? (
        <Link href={`/airman/app/m/${resume}`} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "var(--color-ink)", minHeight: 64 }}>
          <span style={{ display: "grid", gap: 4 }}>
            <span className="k">TONIGHT · SESSION P{sessionOf(resume)}</span>
            <span style={{ fontWeight: 600 }}>{resumeEntry?.bridge_at ? "Continue" : "Start"} {code(resume)} · slide {resumeEntry?.bridge_at ? 9 : 1}</span>
          </span>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
        </Link>
      ) : (
        <Link href="/airman/app/join" className="card" style={{ textDecoration: "none", color: "var(--color-ink)" }}>
          <span className="k">IN CLASS?</span>
          <div style={{ fontWeight: 600, marginTop: 4 }}>Join with the class code</div>
        </Link>
      )}
      {s.daily_reps_between_sessions && <DailyRep prompt={mods.find((m) => m.number === resume)?.content.daily_rep ?? null} done={Boolean(rep)} />}
      <Reviews entries={entries.filter((e) => e.sealed_at).map((e) => ({ n: e.module_number, sealed_at: e.sealed_at!, reviews: e.reviews.map((r) => r.day) }))} />
      <div className="seg" role="tablist" aria-label="Phase">
        {PHASES.map((ph) => (
          <Link key={ph.key} role="tab" aria-selected={ph.key === phase.key} href={`/airman/app?phase=${ph.key}`}>Phase {ph.n}</Link>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {mods.filter((m) => m.phase === phase.key).map((m) => {
          const open = staff || tonight.has(m.number) || (sealed.has(m.number) && s.modules_readable_after_completion);
          const state = sealed.has(m.number) ? "SEALED" : tonight.has(m.number) ? "TONIGHT" : open ? "OPEN" : "LOCKED";
          const inner = (
            <>
              {open && m.image_url && <Painting src={m.image_url} variant="tile" />}
              <span style={{ position: "relative", display: "flex", justifyContent: "space-between", padding: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{code(m.number)}</span>
                <span className="pill" style={open ? { background: "rgba(247,242,232,.9)", color: "var(--color-primary)" } : undefined}>{state}</span>
              </span>
              <span className="serif" style={{ position: "relative", padding: 12, fontSize: 17, lineHeight: 1.2 }}>{m.content.title ?? gap("title")}</span>
            </>
          );
          return open ? (
            <Link key={m.id} href={`/airman/app/m/${m.number}`} className="tile">{inner}</Link>
          ) : (
            <div key={m.id} className="tile tile-locked" aria-disabled="true">{inner}</div>
          );
        })}
      </div>
      <p className="help">Your facilitator opens modules for your class. Everything you write goes into your Almanac, which you can export or delete from the Almanac tab.</p>
    </main>
  );
}
