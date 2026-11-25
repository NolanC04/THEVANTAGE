import { store } from "@/lib/airman/store";
import { MEASURES, WAVES, stat, effect, type CheckinRow } from "@/lib/airman/measures";

const f = (x: number | null | undefined) => (x == null ? "—" : x.toFixed(2));

export default async function Outcomes() {
  const rows = await store().list<CheckinRow>("checkins");
  return (
    <main className="page-wide" style={{ display: "grid", gap: 16 }}>
      <h1 style={{ fontSize: 24, margin: 0 }}>Outcomes</h1>
      <p className="help" style={{ margin: 0 }}>Group numbers only, by anonymous id. Small samples: report n, attrition and limits next to every number. d ≈ 0.2 small, 0.5 medium, 0.8 large.</p>
      <section className="card"><span className="k">GROUP MEANS</span>
        <table className="table"><thead><tr><th>Measure</th><th>Wave</th><th>Cohort</th><th>Comparison</th></tr></thead><tbody>
          {MEASURES.flatMap((m) => WAVES.map(([w]) => {
            const a = stat(rows, "cohort", w, m), b = stat(rows, "comparison", w, m);
            return a || b ? <tr key={m.id + w}><td>{m.name}</td><td>{w}</td><td>{a ? `${f(a.mean)} (n=${a.n})` : "—"}</td><td>{b ? `${f(b.mean)} (n=${b.n})` : "—"}</td></tr> : null;
          }))}
        </tbody></table>
        {rows.length === 0 && <p>No check-ins yet.</p>}
      </section>
      <section className="card"><span className="k">EFFECT (T0 → LATEST WAVE)</span>
        <table className="table"><thead><tr><th>Measure</th><th>Diff-in-diff</th><th>Cohen&apos;s d (cohort change)</th></tr></thead><tbody>
          {MEASURES.map((m) => {
            const e = effect(rows, m);
            return <tr key={m.id}><td>{m.name}{e.latest ? ` (${e.latest})` : ""}</td>{e.latest ? <><td>{e.did == null ? "needs comparison data" : f(e.did)}</td><td>{f(e.d)}</td></> : <td colSpan={2} className="help">Needs T0 and a later wave</td>}</tr>;
          })}
        </tbody></table>
      </section>
      <a className="btn-ghost" href="/api/airman/outcomes/csv" style={{ justifySelf: "start" }}>Download CSV</a>
    </main>
  );
}
