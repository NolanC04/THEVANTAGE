"use client";
import { useState } from "react";
import { postJSON } from "@/lib/airman/fetchWithRetry";

export function ShareToggle({ n, shared }: { n: number; shared: boolean }) {
  const [on, setOn] = useState(shared);
  const [err, setErr] = useState<string | null>(null);
  return (
    <label style={{ display: "flex", gap: 10, fontSize: 14, alignItems: "center" }}>
      <input type="checkbox" checked={on} onChange={async (e) => {
        const next = e.target.checked;
        setOn(next);
        try { await postJSON("/api/airman/almanac/share", { n, shared: next }); setErr(null); } catch (x) { setOn(!next); setErr((x as Error).message); }
      }} /> Shared with my facilitator {err && <span role="alert" className="err">· {err}</span>}
    </label>
  );
}

export function Reflection({ id, text }: { id: string; text: string }) {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (done) return <p className="card help">Noted. GENE will keep that in mind.</p>;
  return (
    <div className="card-activity" style={{ display: "grid", gap: 8 }}>
      <span className="k">GENE NOTICED</span>
      <p className="serif" style={{ fontSize: 18, margin: 0 }}>It looks to me like {text.charAt(0).toLowerCase() + text.slice(1).replace(/\.$/, "")}. Is that right?</p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[["true", "True"], ["partly", "Partly true"], ["not", "Not true"]].map(([v, l]) => (
          <button key={v} className="btn-ghost" onClick={async () => { try { await postJSON("/api/airman/observations", { id, rating: v }); setDone(true); } catch (e) { setErr((e as Error).message); } }}>{l}</button>
        ))}
      </div>
      {err && <p role="alert" className="err">{err} Try again.</p>}
    </div>
  );
}

export function AlmanacTools() {
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="card" style={{ display: "grid", gap: 10 }}>
      <span className="k">YOUR DATA</span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <a className="btn-ghost" href="/api/airman/almanac/export?format=text">Export as text</a>
        <a className="btn-ghost" href="/api/airman/almanac/export?format=json">Export JSON</a>
      </div>
      <label className="label" htmlFor="del">Delete everything: type DELETE</label>
      <input id="del" className="in" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      <button className="btn-ghost" disabled={confirm !== "DELETE"} onClick={async () => {
        try { await postJSON("/api/airman/almanac/delete", { confirm }); window.location.reload(); } catch (e) { setErr((e as Error).message); }
      }}>Delete my Almanac</button>
      {err && <p role="alert" className="err">{err}</p>}
    </div>
  );
}
