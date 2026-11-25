import { currentProfile } from "@/lib/airman/auth";
import { nextForRater, RUBRIC_ANCHORS } from "@/lib/airman/validation";
import { code } from "@/lib/airman/program";
import { Form } from "@/components/airman/Form";

/** Blind scoring: the rater sees the prompt and the written reflection only. No name, anon id, or GENE grade. */
export default async function Rate() {
  const p = (await currentProfile())!;
  const q = await nextForRater(p);
  return (
    <main className="page" style={{ display: "grid", gap: 16 }}>
      <section className="card" style={{ display: "grid", gap: 8 }}>
        <span className="k">GENE VALIDATION · BLIND SCORING</span>
        <p className="help" style={{ margin: 0 }}>Score the quality of the reasoning, not whether the answer is right. You won&apos;t see GENE&apos;s score or anyone else&apos;s.</p>
        <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 4 }}>
          {RUBRIC_ANCHORS.map(([n, t]) => <li key={n} value={n} className={t.startsWith("[NOLAN") ? "gap" : undefined}>{t}</li>)}
        </ol>
      </section>
      {q.closed ? (
        <p className="card" style={{ margin: 0 }}>Rater review is closed. It opens once the rubric is written and the consent wording covers human raters.</p>
      ) : !q.item ? (
        <p className="card" style={{ margin: 0 }}>Nothing left to score. You&apos;ve scored {q.scored}.</p>
      ) : (
        <section className="card" style={{ display: "grid", gap: 10 }}>
          <span className="k">{code(q.item.module_number)} · {q.remaining} LEFT · {q.scored} SCORED</span>
          <p style={{ margin: 0 }}><b>Prompt:</b> {q.item.reflect_prompt || <span className="gap">[NOLAN: reflect prompt]</span>}</p>
          <blockquote style={{ margin: 0, padding: "10px 14px", borderLeft: "3px solid var(--color-border)", whiteSpace: "pre-wrap" }}>{q.item.answer}</blockquote>
          <Form endpoint="/api/airman/rate" reload submit="Save score" fields={[
            { name: "read_id", label: "Item", type: "select", options: [[q.item.id, "This reflection"]] },
            { name: "grade", label: "Reasoning score", type: "select", required: true, options: [["", "Choose 1–5"], ...RUBRIC_ANCHORS.map(([n]) => [String(n), String(n)] as [string, string])] },
            { name: "note", label: "Note (optional)", type: "textarea", rows: 2 },
          ]} />
        </section>
      )}
    </main>
  );
}
