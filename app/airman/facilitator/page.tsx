import Link from "next/link";
import { store } from "@/lib/airman/store";
import { ActionButton, Form } from "@/components/airman/Form";
import { code } from "@/lib/airman/program";

export default async function Overview() {
  const db = store();
  const [requests, flags, shared, events] = await Promise.all([
    db.list<{ id: string; kind: string; status: string; created_at: string }>("session_requests", undefined, { column: "created_at", ascending: false }),
    db.list<{ id: string; anon_id: string; module_number: number; source: string; raised_at: string; followed_up_at: string | null }>("safety_flags", undefined, { column: "raised_at", ascending: false }),
    db.list<{ id: string; user_id: string; module_number: number; bridge: string; gene: { q: string; a: string | null }[]; commitment_when: string | null; commitment_will: string | null; shared: boolean; sealed_at: string | null }>("module_entries", { shared: true }),
    db.list<{ id: string; title: string; starts_at: string | null }>("events"),
  ]);
  const anon = new Map((await db.list<{ id: string; anon_id: string }>("profiles")).map((x) => [x.id, x.anon_id]));
  const open = flags.filter((f) => !f.followed_up_at);
  return (
    <main className="page-wide" style={{ display: "grid", gap: 18 }}>
      {open.length > 0 && (
        <section className="card" style={{ borderColor: "#8a2d1c", display: "grid", gap: 8 }}>
          <span className="k" style={{ color: "#8a2d1c" }}>SAFETY FLAGS · FACILITATOR ONLY</span>
          <p className="help" style={{ margin: 0 }}>The learner has already seen the crisis-line message. Follow up in person under the safety-routing protocol, then mark it done. Warm handoff: chaplain or MFLC.</p>
          {open.map((f) => (
            <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span>{f.anon_id} · {code(f.module_number)} · {f.source} · {new Date(f.raised_at).toLocaleString()}</span>
              <ActionButton ghost endpoint="/api/airman/flags" body={{ id: f.id }} label="Human follow-up done" />
            </div>
          ))}
        </section>
      )}
      <section className="card" style={{ display: "grid", gap: 8 }}>
        <span className="k">GROWTH SESSION REQUESTS</span>
        {requests.length ? (
          <table className="table"><thead><tr><th>Kind</th><th>Status</th><th>Received</th><th></th></tr></thead><tbody>
            {requests.map((r) => (
              <tr key={r.id}><td>{r.kind.replace("_", " ")}</td><td>{r.status}</td><td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><Link href={`/airman/app/community/requests/${r.id}`}>Open thread</Link>
                  {["scheduled", "completed", "closed"].filter((s) => s !== r.status).map((s) => <ActionButton key={s} ghost endpoint="/api/airman/requests/status" body={{ id: r.id, status: s }} label={s} />)}</td></tr>
            ))}
          </tbody></table>
        ) : <p style={{ margin: 0 }}>No requests.</p>}
      </section>
      <section className="card" style={{ display: "grid", gap: 8 }}>
        <span className="k">SHARED ALMANAC ENTRIES</span>
        <p className="help" style={{ margin: 0 }}>Only entries a learner chose to share. Never repeat them outside the facilitator role.</p>
        {shared.length ? shared.map((e) => (
          <div key={e.id} style={{ borderTop: "1px solid var(--color-rule)", paddingTop: 8 }}>
            <b>{anon.get(e.user_id)} · {code(e.module_number)}</b>
            <p style={{ margin: "4px 0" }}>{e.bridge}</p>
            {e.commitment_when && <p className="help" style={{ margin: 0 }}>When {e.commitment_when}, I will {e.commitment_will}.</p>}
          </div>
        )) : <p style={{ margin: 0 }}>None shared.</p>}
      </section>
      <section className="card" style={{ display: "grid", gap: 10 }}>
        <span className="k">EVENTS</span>
        <ul style={{ margin: 0 }}>{events.map((e) => <li key={e.id}>{e.title} · {e.starts_at ? new Date(e.starts_at).toLocaleString() : "[NOLAN: date]"}</li>)}</ul>
        <NewEvent />
      </section>
    </main>
  );
}

function NewEvent() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(320px,100%),1fr))", gap: 16 }}>
      <div className="card" style={{ background: "var(--color-field)" }}>
        <b>New event</b>
        <Form endpoint="/api/airman/events/create" reload submit="Create event" fields={[
          { name: "track_id", label: "Track", type: "select", options: [["track-athletes", "Hybrid Athletes"], ["track-intellects", "Hybrid Intellects"], ["track-faith", "Faith Forward"], ["track-social", "Social"]] },
          { name: "title", label: "Title", required: true }, { name: "starts_at", label: "Starts", type: "datetime-local", required: true },
          { name: "location", label: "Location", required: true }, { name: "capacity", label: "Capacity (optional)", type: "number" }, { name: "description", label: "Description", type: "textarea" },
        ]} />
      </div>
    </div>
  );
}
