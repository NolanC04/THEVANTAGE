"use client";
import { useState } from "react";
import { postJSON } from "@/lib/airman/fetchWithRetry";

export function BundleUpload() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <input type="file" accept="application/json,.json" disabled={busy} onChange={async (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setBusy(true);
        try {
          const bundle = JSON.parse(await f.text());
          const r = await postJSON<{ proposals: number }>("/api/airman/import/bundle", bundle);
          setMsg(`${r.proposals} proposals ready to review.`);
          window.location.reload();
        } catch (x) { setMsg(`Import failed: ${(x as Error).message}`); setBusy(false); }
      }} />
      {msg && <p role="status" className={msg.startsWith("Import failed") ? "err" : "help"}>{msg}</p>}
    </div>
  );
}

/** Admin-judgment gate: explicit checkbox plus click. */
export function ApproveProposal({ id }: { id: string }) {
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const act = async (decision: "approve" | "reject") => {
    setBusy(true);
    try { await postJSON("/api/airman/import/approve", { id, decision, confirm: ok }); window.location.reload(); } catch (x) { setErr((x as Error).message); setBusy(false); }
  };
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      <label style={{ display: "flex", gap: 8, fontSize: 14 }}><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /> I reviewed every change above.</label>
      <button className="btn" disabled={!ok || busy} onClick={() => act("approve")}>Approve and publish</button>
      <button className="btn-ghost" disabled={busy} onClick={() => act("reject")}>Reject</button>
      {err && <span role="alert" className="err">{err}</span>}
    </div>
  );
}
