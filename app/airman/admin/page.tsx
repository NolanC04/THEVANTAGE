import { store } from "@/lib/airman/store";
import { modules, settings } from "@/lib/airman/data";
import { code, gap } from "@/lib/airman/program";
import type { FieldChange } from "@/lib/airman/diff";
import { Form, ActionButton } from "@/components/airman/Form";
import { ApproveProposal, BundleUpload } from "./Material";
import { validationSummary, rubricWritten } from "@/lib/airman/validation";
import { env } from "@/lib/airman/env";

export default async function Admin() {
  const db = store();
  const [mods, proposals, laws, s, v] = await Promise.all([
    modules(),
    db.list<{ id: string; module_number: number; source: string; changes: FieldChange[]; status: string; at: string }>("import_proposals", { status: "pending" }, { column: "module_number" }),
    db.list<{ id: string; module_number: number; text: string; approved: boolean }>("closing_laws"),
    settings(),
    validationSummary(),
  ]);
  const pct = (x: number | null) => (x == null ? "—" : `${Math.round(x * 100)}%`);
  const k = (x: number | null) => (x == null ? "—" : x.toFixed(2));
  return (
    <main className="page-wide" style={{ display: "grid", gap: 18 }}>
      <section className="card" style={{ display: "grid", gap: 10 }}>
        <span className="k">MATERIAL · M01–M24</span>
        <table className="table"><thead><tr><th>Module</th><th>Title</th><th>Status</th><th>Closing Law</th></tr></thead><tbody>
          {mods.map((m) => {
            const law = laws.find((l) => l.id === m.closing_law_id);
            return <tr key={m.id}><td>{code(m.number)}</td><td>{m.content.title ?? <span className="gap">{gap("title")}</span>}</td><td>{m.status === "published" ? `Published v${m.version}` : "Draft"}</td><td>{law?.approved ? "Authored" : "Not yet authored"}</td></tr>;
          })}
        </tbody></table>
      </section>
      <section className="card" style={{ display: "grid", gap: 10 }}>
        <span className="k">IMPORT CONTENT</span>
        <p className="help" style={{ margin: 0 }}>Upload a JSON bundle (<code>{"{ modules: [{ n, title, … }] }"}</code>). Each module becomes a proposal with a diff. Nothing saves until you approve it. <code>npm run bundle:pilot</code> builds one from the pilot app&apos;s content.</p>
        <BundleUpload />
      </section>
      {proposals.length > 0 && (
        <section style={{ display: "grid", gap: 12 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Pending proposals ({proposals.length})</h2>
          {proposals.map((p) => (
            <article key={p.id} className="card" style={{ display: "grid", gap: 8 }}>
              <b>{code(p.module_number)} · from {p.source}</b>
              <table className="table"><thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead><tbody>
                {p.changes.map((c) => <tr key={c.field}><td>{c.field}</td><td style={{ color: "var(--color-muted)", maxWidth: 360 }}>{c.before == null ? "—" : JSON.stringify(c.before).slice(0, 300)}</td><td style={{ maxWidth: 420 }}>{JSON.stringify(c.after).slice(0, 400)}</td></tr>)}
              </tbody></table>
              <ApproveProposal id={p.id} />
            </article>
          ))}
        </section>
      )}
      <section className="card" style={{ display: "grid", gap: 10 }}>
        <span className="k">CLOSING LAWS · NOLAN WRITES THESE; AI MAY NOT AUTHOR THEM</span>
        <Form endpoint="/api/airman/laws" reload submit="Save Closing Law" fields={[
          { name: "n", label: "Module", type: "select", options: mods.map((m) => [String(m.number), `${code(m.number)} ${m.content.title ?? ""}`] as [string, string]) },
          { name: "text", label: "Closing Law (verbatim)", type: "textarea", required: true },
          { name: "attest", label: "I, Nolan, wrote this Closing Law myself.", type: "checkbox", required: true },
        ]} />
      </section>
      <section className="card" style={{ display: "grid", gap: 10 }}>
        <span className="k">GENE VALIDATION · EXPERIMENTAL UNTIL THE TARGET IS MET</span>
        <table className="table"><tbody>
          <tr><td>GENE reads filed</td><td>{v.reads} ({v.firstReads} first reads)</td></tr>
          <tr><td>First reads with a human score</td><td>{v.scoredReads} · raters: {v.raters}</td></tr>
          <tr><td>GENE vs human, quadratic weighted kappa</td><td><b>{k(v.qwk)}</b> · exact {pct(v.exact)} · within one {pct(v.adjacent)}</td></tr>
          <tr><td>Human vs human (ceiling)</td><td>{k(v.humanQwk)} on {v.humanPairs} double-scored reads</td></tr>
          <tr><td>Target (set before T-0)</td><td>{s.gene_kappa_target ?? <span className="gap">[NOLAN: set target]</span>}</td></tr>
          <tr><td>Average tokens per read</td><td>{v.avgTokens ? `${Math.round(v.avgTokens.in)} in / ${Math.round(v.avgTokens.out)} out` : "—"} <span className="help">(multiply by current model prices for cost per assessment)</span></td></tr>
          <tr><td>Versions in use</td><td>{v.versions.length ? v.versions.map((x) => <div key={x}>{x}</div>) : "—"}{v.versions.length > 1 && <div className="err">More than one version: scores across versions aren&apos;t comparable.</div>}</td></tr>
          <tr><td>Prompt pinned</td><td>{env.genePromptRef ? env.genePromptRef : <span className="err">No. GENE_PROMPT_REF is unset, so the prompt follows SIGNETOPS main.</span>}</td></tr>
        </tbody></table>
        <Form endpoint="/api/airman/settings" reload submit="Save target" fields={[{ name: "gene_kappa_target", label: "Agreement target (0–1)", type: "number", value: s.gene_kappa_target == null ? "" : String(s.gene_kappa_target) }]} />
        <p style={{ margin: 0 }}>Rater review: <b>{s.rater_review_enabled ? "Open" : "Closed"}</b>{!rubricWritten() && <span className="gap"> [NOLAN: write the rubric anchors first]</span>}</p>
        <p className="help" style={{ margin: 0 }}>Before opening: the onboarding agreement must tell learners that trained raters may read their reflections without names. <span className="gap">[NOLAN: agreement wording]</span></p>
        <ActionButton ghost endpoint="/api/airman/settings" body={{ rater_review_enabled: !s.rater_review_enabled }} label={s.rater_review_enabled ? "Close rater review" : "Open rater review"} />
      </section>
      <section className="card" style={{ display: "grid", gap: 10 }}>
        <span className="k">SETTINGS</span>
        <p style={{ margin: 0 }}>Completed modules stay readable after class: <b>{s.modules_readable_after_completion ? "Yes" : "No"}</b> <span className="gap">[NOLAN: decide]</span></p>
        <ActionButton ghost endpoint="/api/airman/settings" body={{ modules_readable_after_completion: !s.modules_readable_after_completion }} label={s.modules_readable_after_completion ? "Turn off" : "Turn on"} />
        <p style={{ margin: 0 }}>Daily reps between sessions: <b>{s.daily_reps_between_sessions ? "On" : "Off"}</b></p>
        <ActionButton ghost endpoint="/api/airman/settings" body={{ daily_reps_between_sessions: !s.daily_reps_between_sessions }} label={s.daily_reps_between_sessions ? "Turn off" : "Turn on"} />
      </section>
    </main>
  );
}
