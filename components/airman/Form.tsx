"use client";
import { useState } from "react";
import { postJSON } from "@/lib/airman/fetchWithRetry";

export type Field =
  | { name: string; label: string; type?: "text" | "email" | "datetime-local" | "number" | "date"; required?: boolean; help?: string; value?: string }
  | { name: string; label: string; type: "textarea"; rows?: number; required?: boolean; help?: string; value?: string }
  | { name: string; label: string; type: "select"; options: [string, string][]; required?: boolean; help?: string; value?: string }
  | { name: string; label: string; type: "checkbox"; required?: boolean; help?: string };

/** Token-styled form. Loud failure: one silent retry, then a visible message and Retry. */
export function Form({ endpoint, fields, submit, success, extra, reload = false }: { endpoint: string; fields: Field[]; submit: string; success?: string; extra?: Record<string, unknown>; reload?: boolean }) {
  const [v, setV] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, f.type === "checkbox" ? false : "value" in f && f.value != null ? f.value : f.type === "select" ? f.options[0][0] : ""])),
  );
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [retryable, setRetryable] = useState(false);
  async function go() {
    const missing = fields.find((f) => f.required && !v[f.name]);
    if (missing) {
      setState("error");
      setRetryable(false);
      setMsg(`${missing.label} is needed.`);
      return;
    }
    setState("busy");
    try {
      const r = await postJSON<{ redirect?: string }>(endpoint, { ...v, ...extra });
      if (r?.redirect) return void (window.location.href = r.redirect);
      if (reload) return window.location.reload();
      setState("done");
    } catch (e) {
      const status = (e as { status?: number }).status;
      setRetryable(!status || status >= 500);
      setMsg((e as Error).message);
      setState("error");
    }
  }
  if (state === "done") return <p role="status" style={{ fontWeight: 600, margin: 0 }}>{success ?? "Saved."}</p>;
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); go(); }} style={{ display: "grid", gap: 14 }}>
      {fields.map((f) => (
        <div key={f.name}>
          {f.type === "checkbox" ? (
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, lineHeight: 1.45 }}>
              <input type="checkbox" checked={Boolean(v[f.name])} onChange={(e) => setV({ ...v, [f.name]: e.target.checked })} style={{ width: 22, height: 22, marginTop: 1, accentColor: "var(--color-primary)" }} />
              <span>{f.label}</span>
            </label>
          ) : (
            <>
              <label className="label" htmlFor={f.name}>{f.label}</label>
              {f.type === "textarea" ? (
                <textarea id={f.name} className="in" rows={f.rows ?? 3} value={String(v[f.name])} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />
              ) : f.type === "select" ? (
                <select id={f.name} className="in" value={String(v[f.name])} onChange={(e) => setV({ ...v, [f.name]: e.target.value })}>
                  {f.options.map(([val, l]) => <option key={val} value={val}>{l}</option>)}
                </select>
              ) : (
                <input id={f.name} className="in" type={f.type ?? "text"} value={String(v[f.name])} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} />
              )}
            </>
          )}
          {f.help && <p className="help" style={{ margin: "6px 0 0" }}>{f.help}</p>}
        </div>
      ))}
      {state === "error" && <p role="alert" className="err" style={{ margin: 0 }}>{retryable ? `That didn't save: ${msg}` : msg}</p>}
      <div><button className="btn" type="submit" disabled={state === "busy"}>{state === "busy" ? "Saving…" : state === "error" && retryable ? "Retry" : submit}</button></div>
    </form>
  );
}

/** One-click action (RSVP, end class, status change) with loud failure. */
export function ActionButton({ endpoint, body, label, ghost = false, confirm }: { endpoint: string; body?: unknown; label: string; ghost?: boolean; confirm?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4 }}>
      <button className={ghost ? "btn-ghost" : "btn"} disabled={busy} onClick={async () => {
        if (confirm && !window.confirm(confirm)) return;
        setBusy(true);
        setErr(null);
        try {
          const r = await postJSON<{ redirect?: string }>(endpoint, body ?? {});
          if (r.redirect) window.location.href = r.redirect;
          else window.location.reload();
        } catch (e) {
          setErr((e as Error).message);
          setBusy(false);
        }
      }}>{busy ? "…" : err ? "Retry" : label}</button>
      {err && <span role="alert" className="err">{err}</span>}
    </span>
  );
}
