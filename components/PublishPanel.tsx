"use client";
import { useState } from "react";
import { postJSON } from "@/lib/client-fetch";

/** Admin-judgment gate: checkbox + named author of record + click. */
export function PublishPanel({ id, blocked, expectedAuthor }: { id: string; blocked: boolean; expectedAuthor: string }) {
  const [confirm, setConfirm] = useState(false);
  const [author, setAuthor] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function act(action: "publish" | "reject") {
    setBusy(true);
    setErr(null);
    try {
      await postJSON("/api/admin/publish", { id, action, confirm, author_of_record: author });
      window.location.reload();
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <div className="mt-12 rule-top pt-8 grid gap-6">
      <div className="field max-w-[420px]">
        <label htmlFor="aor">Author of record</label>
        <input id="aor" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={expectedAuthor} />
      </div>
      <label className="flex gap-3 items-start text-[15px]" style={{ color: "var(--color-muted)" }}>
        <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1" />
        I have read this piece and approve its public release.
      </label>
      {blocked && <p className="error m-0">Publishing is blocked until the findings above are fixed in Studiolo and re-sent.</p>}
      {err && <p role="alert" className="error m-0">{err}</p>}
      <div className="flex flex-wrap gap-6">
        <button className="btn-gold" disabled={busy || blocked || !confirm || !author.trim()} onClick={() => act("publish")}>{err ? "Retry publish" : "Publish"}</button>
        <button className="btn-line" disabled={busy} onClick={() => act("reject")}>Reject</button>
      </div>
    </div>
  );
}
