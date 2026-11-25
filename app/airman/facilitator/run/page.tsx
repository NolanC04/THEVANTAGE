import { modules } from "@/lib/airman/data";
import { store } from "@/lib/airman/store";
import { trio, code, SCENES, PHASES, FIVE_CS, gap } from "@/lib/airman/program";

// Run sheet P1–P8. "You open with" is facilitator-only and never reaches learners.
export default async function RunSheets({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const k = Math.min(8, Math.max(1, Number((await searchParams).s) || 1));
  const mods = await modules();
  const laws = await store().list<{ id: string; approved: boolean }>("closing_laws");
  return (
    <main className="page-wide" style={{ display: "grid", gap: 16 }}>
      <div className="seg" style={{ maxWidth: 720 }}>{SCENES.map((_, i) => <a key={i} href={`?s=${i + 1}`} aria-current={i + 1 === k ? "page" : undefined}>P{i + 1}</a>)}</div>
      <h1 style={{ fontSize: 24, margin: 0 }}>Session P{k} · {SCENES[k - 1]}</h1>
      <p className="help" style={{ margin: 0 }}>Three modules, about 66 minutes each, with breaks inside a 4-hour block.</p>
      {trio(k).map((n, i) => {
        const m = mods.find((x) => x.number === n)!;
        const c = m.content;
        const law = laws.find((l) => l.id === m.closing_law_id);
        return (
          <section key={n} className="card" style={{ display: "grid", gap: 8 }}>
            <span className="k">{PHASES[i].emblem} · {PHASES[i].name}</span>
            <h2 style={{ fontSize: 20, margin: 0 }}>{code(n)} · {c.title ?? gap("title")}</h2>
            <p style={{ margin: 0 }}><b>You open with</b> (facilitator only): {c.facilitator_opener ?? <span className="gap">{gap("your own story")}</span>}</p>
            <p style={{ margin: 0 }}><b>Unit outcome:</b> {c.unit_outcome ?? <span className="gap">{gap(`one of ${FIVE_CS.join(", ")}`)}</span>} · <b>Focus skill:</b> {c.focus_skill ?? <span className="gap">{gap("focus skill (required to open)")}</span>}</p>
            <p style={{ margin: 0 }}><b>DLO:</b> {c.dlo ?? <span className="gap">{gap("DLO")}</span>}</p>
            <p style={{ margin: 0 }}><b>Materials:</b> {c.materials ?? <span className="gap">{gap("materials")}</span>}</p>
            <p style={{ margin: 0 }}><b>Field work:</b> {c.fieldwork ?? <span className="gap">{gap("field work")}</span>}{c.prompts ? ` (${c.prompts.length} prompts)` : ""}</p>
            {c.debrief?.length ? <><b>Debrief</b><ul style={{ margin: 0 }}>{c.debrief.map((q) => <li key={q}>{q}</li>)}</ul></> : null}
            <p style={{ margin: 0 }}><b>Closing Law:</b> <span className="pill" style={law?.approved ? { background: "var(--color-primary)", color: "var(--color-on-primary)" } : undefined}>{law?.approved ? "AUTHORED" : "NOT YET AUTHORED"}</span></p>
            {c.selfdebrief?.length ? <><b>Self-debrief</b><ul style={{ margin: 0 }}>{c.selfdebrief.map((q) => <li key={q}>{q}</li>)}</ul></> : null}
          </section>
        );
      })}
      <section className="card">
        <span className="k">FIDELITY CHECKLIST</span>
        <ul style={{ margin: "8px 0 0", lineHeight: 1.7 }}>
          {["Delivered as written and on time", "Closing Laws read verbatim", "Field work done in session", "No clinical language", "Learners reminded their writing is private"].map((x) => <li key={x}><label><input type="checkbox" /> {x}</label></li>)}
        </ul>
      </section>
    </main>
  );
}
