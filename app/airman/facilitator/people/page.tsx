import { store } from "@/lib/airman/store";
import { currentProfile, isAdmin, type Profile } from "@/lib/airman/auth";
import { env } from "@/lib/airman/env";
import { Form, ActionButton } from "@/components/airman/Form";

const ROLES = ["learner", "assistant", "comparison", "facilitator", "admin"] as const;

export default async function People() {
  const me = (await currentProfile())!;
  const db = store();
  const [people, invites, log] = await Promise.all([
    db.list<Profile>("profiles", undefined, { column: "created_at" }),
    db.list<{ id: string; code: string; role: string; unit: string | null; flight: string | null; active: boolean }>("invites"),
    db.list<{ id: string; actor_anon: string; action: string; target: string; at: string }>("audit_log", undefined, { column: "at", ascending: false }),
  ]);
  const admin = isAdmin(me);
  return (
    <main className="page-wide" style={{ display: "grid", gap: 16 }}>
      <section className="card"><span className="k">INVITE CODES</span>
        <table className="table"><thead><tr><th>Code</th><th>Role</th><th>Unit / flight</th><th></th></tr></thead><tbody>
          {invites.map((i) => <tr key={i.id}><td style={{ fontWeight: 600, letterSpacing: ".15em" }}>{i.code}</td><td>{i.role}</td><td>{i.unit ?? "—"} / {i.flight ?? "—"}</td><td>{i.active ? <ActionButton ghost endpoint="/api/airman/invites" body={{ id: i.id, active: false }} label="Deactivate" /> : "inactive"}</td></tr>)}
        </tbody></table>
        <Form endpoint="/api/airman/invites" reload submit="Create invite code" fields={[
          { name: "role", label: "Role", type: "select", options: (admin ? ROLES : (["learner", "comparison"] as const)).filter((r) => r !== "admin").map((r) => [r, r] as [string, string]) },
          { name: "unit", label: "Unit" }, { name: "flight", label: "Flight" },
        ]} />
      </section>
      <section className="card"><span className="k">PEOPLE</span>
        <p className="help" style={{ margin: 0 }}>Anonymous ids only. {admin ? "Only an admin grants facilitator or admin; every change is audit-logged." : "Ask an admin to change roles."}</p>
        <table className="table"><thead><tr><th>Id</th><th>Role</th><th>Unit / flight</th>{admin && <th>Change</th>}</tr></thead><tbody>
          {people.map((p) => (
            <tr key={p.id}><td>{p.anon_id}</td><td>{p.role}</td><td>{p.unit ?? "—"} / {p.flight ?? "—"}</td>
              {admin && <td style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{p.email === env.adminEmail ? <span className="help">locked</span> : ROLES.filter((r) => r !== p.role).map((r) => <ActionButton key={r} ghost endpoint="/api/airman/roles" body={{ id: p.id, role: r }} label={r} />)}</td>}
            </tr>
          ))}
        </tbody></table>
      </section>
      {admin && <section className="card"><span className="k">AUDIT LOG</span>
        <table className="table"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Target</th></tr></thead><tbody>
          {log.slice(0, 200).map((l) => <tr key={l.id}><td>{new Date(l.at).toLocaleString()}</td><td>{l.actor_anon}</td><td>{l.action}</td><td style={{ fontSize: 12 }}>{l.target}</td></tr>)}
        </tbody></table>
      </section>}
    </main>
  );
}
