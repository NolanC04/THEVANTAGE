"use client";
import { useState } from "react";
import { postJSON } from "@/lib/airman/fetchWithRetry";
import type { Measure } from "@/lib/airman/measures";

export function Checkin({ wave, label, measures }: { wave: string; label: string; measures: Measure[] }) {
  const [r, setR] = useState<Record<string, (number | null)[]>>(() => Object.fromEntries(measures.map((m) => [m.id, m.items.map(() => null)])));
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [err, setErr] = useState("");
  const complete = measures.every((m) => r[m.id].every((v) => v != null));
  return (
    <form style={{ display: "grid", gap: 14 }} onSubmit={async (e) => {
      e.preventDefault();
      setState("busy");
      try { await postJSON("/api/airman/checkins", { wave, responses: r }); window.location.href = "/airman/app/checkins"; } catch (x) { setErr((x as Error).message); setState("error"); }
    }}>
      <h1 style={{ fontSize: 22, margin: "8px 0 0" }}>{label}</h1>
      {measures.map((m) => (
        <section key={m.id} className="card" style={{ display: "grid", gap: 12 }}>
          <div><b>{m.name}</b><div className="help">{m.cite} · {m.min} = {m.anchors[0]}, {m.max} = {m.anchors[1]}</div></div>
          {m.items.map((it, i) => (
            <fieldset key={i} style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontSize: 15, marginBottom: 6 }}>{i + 1}. {it}</legend>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Array.from({ length: m.max - m.min + 1 }, (_, k) => m.min + k).map((v) => (
                  <button type="button" key={v} aria-pressed={r[m.id][i] === v} onClick={() => setR({ ...r, [m.id]: r[m.id].map((x, j) => (j === i ? v : x)) })}
                    style={{ minWidth: 44, minHeight: 44, borderRadius: 12, border: "1px solid var(--color-border-input)", background: r[m.id][i] === v ? "var(--color-primary)" : "var(--color-field)", color: r[m.id][i] === v ? "var(--color-on-primary)" : "var(--color-ink)", fontWeight: 600 }}>{v}</button>
                ))}
              </div>
            </fieldset>
          ))}
        </section>
      ))}
      {state === "error" && <p role="alert" className="err">{err}</p>}
      <button className="btn" disabled={!complete || state === "busy"}>{state === "error" ? "Retry" : "Submit check-in"}</button>
    </form>
  );
}
