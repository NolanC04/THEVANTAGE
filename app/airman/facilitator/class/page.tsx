import QRCode from "qrcode";
import { store } from "@/lib/airman/store";
import { env } from "@/lib/airman/env";
import { code as mcode, trio, SCENES } from "@/lib/airman/program";
import type { ClassSession } from "@/lib/airman/access";
import { Form, ActionButton } from "@/components/airman/Form";

export default async function ClassRoom() {
  const db = store();
  const sessions = await db.list<ClassSession>("class_sessions", undefined, { column: "opened_at", ascending: false });
  const live = sessions.filter((s) => !s.closed_at);
  const joins = await db.list<{ class_session_id: string }>("class_joins");
  const qr = await Promise.all(live.map((s) => QRCode.toString(`${env.siteUrl}/airman/app/join?code=${s.code}`, { type: "svg", margin: 1, color: { dark: "#1F3A2E", light: "#F7F2E8" } })));
  return (
    <main className="page-wide" style={{ display: "grid", gap: 18 }}>
      {live.map((s, i) => (
        <section key={s.id} className="card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(280px,100%),1fr))", gap: 20, alignItems: "center" }}>
          <div>
            <span className="k">LIVE · {s.module_numbers.map(mcode).join(" · ")}</span>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px,8vw,96px)", letterSpacing: ".18em", color: "var(--color-primary)" }}>{s.code}</div>
            <p style={{ margin: "0 0 12px" }}><b>{joins.filter((j) => j.class_session_id === s.id).length}</b> phones joined</p>
            <ActionButton endpoint="/api/airman/class/end" body={{ id: s.id }} label="End class" confirm="End the class? Module content locks for learners immediately." />
          </div>
          <div style={{ maxWidth: 280 }} dangerouslySetInnerHTML={{ __html: qr[i] }} aria-label={`QR code to join class ${s.code}`} />
        </section>
      ))}
      <section className="card" style={{ display: "grid", gap: 10 }}>
        <span className="k">START CLASS</span>
        <p className="help" style={{ margin: 0 }}>Pick a pilot session (its trio: k, k+8, k+16) or list modules. Learners join with the code or QR; content opens only while the class is open.</p>
        <Form endpoint="/api/airman/class/start" reload submit="Start class" fields={[
          { name: "session", label: "Pilot session", type: "select", options: [["", "Custom modules below"], ...SCENES.map((sc, k) => [String(k + 1), `P${k + 1} · ${sc} · ${trio(k + 1).map(mcode).join(", ")}`] as [string, string])], value: "1" },
          { name: "modules", label: "Custom modules (numbers, comma-separated)", help: "Used only when Pilot session is set to custom." },
        ]} />
      </section>
      <section className="card">
        <span className="k">PAST CLASSES</span>
        <table className="table"><thead><tr><th>Code</th><th>Modules</th><th>Opened</th><th>Closed</th><th>Joined</th></tr></thead><tbody>
          {sessions.filter((s) => s.closed_at).map((s) => <tr key={s.id}><td>{s.code}</td><td>{s.module_numbers.map(mcode).join(", ")}</td><td>{new Date(s.opened_at).toLocaleString()}</td><td>{new Date(s.closed_at!).toLocaleString()}</td><td>{joins.filter((j) => j.class_session_id === s.id).length}</td></tr>)}
        </tbody></table>
      </section>
    </main>
  );
}
