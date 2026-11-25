import { notFound } from "next/navigation";
import { currentProfile, canFacilitate } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import { CRISIS } from "@/lib/airman/privacy";
import { Form } from "@/components/airman/Form";

export default async function Thread({ params }: { params: Promise<{ id: string }> }) {
  const p = (await currentProfile())!;
  const r = await store().get<{ id: string; user_id: string; kind: string; preferred_times: string; note: string | null; status: string }>("session_requests", { id: (await params).id });
  if (!r || (r.user_id !== p.id && !canFacilitate(p))) notFound();
  const msgs = await store().list<{ id: string; author_id: string; author_role: string; body: string; at: string }>("request_messages", { request_id: r.id }, { column: "at" });
  return (
    <main className="page" style={{ display: "grid", gap: 12 }}>
      <h1 style={{ fontSize: 20, margin: "8px 0 0" }}>{r.kind.replace("_", " ")} · {r.status}</h1>
      <p className="help" style={{ margin: 0 }}>Times: {r.preferred_times}</p>
      {r.note && <p className="card" style={{ margin: 0 }}>{r.note}</p>}
      {msgs.map((m) => (
        <div key={m.id} className="card" style={{ marginLeft: m.author_id === p.id ? 32 : 0, background: m.author_id === p.id ? "var(--color-field)" : "var(--color-card)" }}>
          <div className="k">{m.author_role === "learner" ? "You" : "Facilitator"} · {new Date(m.at).toLocaleString()}</div>
          <p style={{ margin: "6px 0 0" }}>{m.body}</p>
        </div>
      ))}
      <div className="card"><Form endpoint="/api/airman/requests/reply" extra={{ request_id: r.id }} reload submit="Send" fields={[{ name: "body", label: "Reply", type: "textarea", required: true }]} /></div>
      <p className="help">{CRISIS}</p>
    </main>
  );
}
