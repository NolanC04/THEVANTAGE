"use client";
import "./frameworks.css";
import { useId, useRef, useState } from "react";
import type { Framework } from "@/lib/frameworks/registry";
import { TOOLS } from "./tools";
import { SavedState, writtenText, type SavedData } from "./saved";

export type SavedEntry = { data: SavedData; saved_at: string };
/** Where a signed-in learner's save goes. Absent when there is no one to save for. */
export type SaveTarget = { endpoint: string; moduleNumber?: number };

const when = (iso: string) => new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

async function post(endpoint: string, body: unknown) {
  const r = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || "The save didn't go through."), { status: r.status });
  return j as { saved_at: string };
}

/** One interactive framework. Signed-in learners save it to their private Almanac; admins see held frameworks with the reason. */
export function FrameworkCard({ fw, admin = false, heading = "h3", saved = null, save }: { fw: Framework; admin?: boolean; heading?: "h1" | "h2" | "h3"; saved?: SavedEntry | null; save?: SaveTarget }) {
  const uid = useId().replace(/:/g, "");
  const Tool = TOOLS[fw.id];
  const H = heading;
  const live = useRef<SavedData>({});
  const root = useRef<HTMLElement>(null);
  const [state, setState] = useState<{ busy: boolean; at: string | null; err: string | null }>({ busy: false, at: saved?.saved_at ?? null, err: null });

  async function onSave() {
    if (!save) return;
    setState((s) => ({ ...s, busy: true, err: null }));
    const read = [...(root.current?.querySelectorAll(".fw-read") ?? [])].map((n) => n.textContent?.trim() ?? "").filter(Boolean).join(" ");
    // The learner's own words first; slider-only tools fall back to their reading.
    const words = writtenText(live.current).map((w) => w.replace(/\s*\n\s*/g, " / ")).join(" · ");
    const summary = (words || read).slice(0, 1000);
    const body = { framework_id: fw.id, module_number: save.moduleNumber ?? null, data: live.current, summary };
    try {
      let res;
      try { res = await post(save.endpoint, body); }
      catch (e) {
        if ((e as { status?: number }).status && (e as { status: number }).status < 500) throw e;
        res = await post(save.endpoint, body); // one silent retry for network and server errors
      }
      setState({ busy: false, at: res.saved_at, err: null });
    } catch (e) {
      setState((s) => ({ ...s, busy: false, err: (e as Error).message || "The save didn't go through." }));
    }
  }

  return (
    <section ref={root} className="fw fw-card" id={fw.id} aria-labelledby={`${uid}-title`}>
      {fw.status === "held" && admin && <p className="fw-held">Held · admins only. {fw.hold}</p>}
      <div className="fw-head">
        <H id={`${uid}-title`} className="fw-title">{fw.title}</H>
        <span className="fw-type">{fw.type}</span>
      </div>
      <p className="fw-concept">{fw.concept}</p>
      <SavedState init={saved?.data ?? {}} live={live}>
        {Tool ? <Tool uid={uid} /> : <p className="fw-flag">[NOLAN: this framework is not built yet]</p>}
      </SavedState>
      {save ? (
        <div className="fw-row" style={{ marginTop: 22 }}>
          <button type="button" className="fw-btn" onClick={onSave} disabled={state.busy}>{state.busy ? "Saving…" : state.at ? "Save again" : "Save to my Almanac"}</button>
          {state.at && !state.err && <span className="fw-private" style={{ margin: 0 }} role="status">Saved to your Almanac · {when(state.at)}</span>}
          {state.err && <span role="alert" className="fw-flag" style={{ fontSize: 14 }}>{state.err} <button type="button" className="fw-btn-line" style={{ minHeight: 36, marginLeft: 8 }} onClick={onSave}>Retry</button></span>}
        </div>
      ) : null}
      <p className="fw-private">{save ? "Your Almanac is private. Only you can read what you save here." : "What you type here stays on this screen. Nothing is sent or saved."}</p>
      {admin && fw.elsewhere.length > 0 && <p className="fw-private">Admin · also proposed for: {fw.elsewhere.join(" · ")}</p>}
    </section>
  );
}

/** The frameworks placed in a module, under one heading. Renders nothing when none are placed. */
export function FrameworkShelf({ frameworks, admin = false, eyebrowClass, title = "Practice", saved = {}, save }: { frameworks: Framework[]; admin?: boolean; eyebrowClass?: string; title?: string; saved?: Record<string, SavedEntry>; save?: SaveTarget }) {
  if (!frameworks.length) return null;
  return (
    <div>
      <p className={eyebrowClass}>{title}</p>
      <div style={{ marginTop: 20 }}>{frameworks.map((f) => <FrameworkCard key={f.id} fw={f} admin={admin} saved={saved[f.id] ?? null} save={save} />)}</div>
    </div>
  );
}
