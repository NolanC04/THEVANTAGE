"use client";
import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { postJSON } from "@/lib/airman/fetchWithRetry";
import type { Slide } from "@/lib/airman/slides";
import type { ModuleContent } from "@/lib/airman/program";
import { CRISIS } from "@/lib/airman/privacy";
import { Painting } from "@/components/airman/Painting";

type Entry = { bridge: string | null; bridge_at: string | null; remix: string | null; quick_check: number | null; gene: { q: string; a: string | null }[]; sealed_at: string | null; shared: boolean };

function useAction() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const run = async <T,>(url: string, body: unknown, after?: (r: T) => void) => {
    setBusy(true);
    setErr(null);
    try {
      const r = await postJSON<T>(url, body);
      if (after) after(r);
      else window.location.reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return { busy, err, run };
}

export function Player(props: { n: number; code: string; image: string | null; phase: string; session: number; slides: Slide[]; content: ModuleContent; entry: Entry; closingLaw: string | null; practice?: ReactNode }) {
  const { n, slides, content, entry } = props;
  const [i, setI] = useState(entry.bridge_at && slides.length > 8 ? 8 : 0);
  const s = slides[i];
  const touch = useRef<number | null>(null);
  const total = 13;
  const go = (d: number) => setI((x) => Math.min(slides.length - 1, Math.max(0, x + d)));
  const act = useAction();
  const [text, setText] = useState("");
  const [geneQ, setGeneQ] = useState(entry.gene);
  const [crisis, setCrisis] = useState(false);
  const [when, setWhen] = useState("");
  const [will, setWill] = useState("");
  const [share, setShare] = useState(entry.shared);
  const [qc, setQc] = useState<number | null>(entry.quick_check);
  const sealed = Boolean(entry.sealed_at);

  return (
    <main className="page" style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/airman/app" className="help">‹ Modules</Link>
        <span className="k">{props.code} · {props.phase} · P{props.session}</span>
      </div>
      <section
        aria-roledescription="slide"
        aria-label={`Slide ${s.n} of ${total}: ${s.screen}`}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touch.current = null;
        }}
        style={{ position: "relative", borderRadius: 14, overflow: "hidden", aspectRatio: "4 / 5", background: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        {props.image && <Painting src={props.image} variant="hero" dim={s.n > 2} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,20,19,0) 45%, rgba(20,20,19,.85) 100%)" }} />
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 18 }}>
          <div className="k" style={{ color: "rgba(247,242,232,.8)" }}>{s.screen} · {s.n}/{total}</div>
          <h2 style={{ color: "var(--color-on-primary)", fontSize: 24, margin: "6px 0 8px" }}>{s.heading}</h2>
          {s.body.map((b, k) => <p key={k} className="serif" style={{ fontSize: 18, lineHeight: 1.35, margin: "6px 0" }}>{b}</p>)}
          {s.activity && <a href="#activity" className="pill" style={{ marginTop: 8, background: "var(--color-activity)", color: "var(--color-primary)", textDecoration: "none" }}>Activity below ↓</a>}
        </div>
      </section>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button className="btn-ghost" onClick={() => go(-1)} disabled={i === 0} aria-label="Previous slide">‹</button>
        <div role="tablist" aria-label="Slides" style={{ display: "flex", gap: 4, overflowX: "auto", flex: 1, minWidth: 0 }}>
          {Array.from({ length: total }, (_, k) => {
            const sl = slides[k];
            const locked = !sl;
            return (
              <button key={k} role="tab" aria-selected={k === i} disabled={locked} onClick={() => setI(k)} aria-label={locked ? `Slide ${k + 1} locked until the Bridge is submitted` : `Slide ${k + 1}`}
                style={{ flex: "none", width: 30, height: 40, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: locked ? "not-allowed" : "pointer", border: k === i ? "2px solid var(--color-primary)" : "1px solid var(--color-border)", background: locked ? "var(--color-segment)" : sl.activity ? "var(--color-activity)" : "var(--color-card)", color: locked ? "var(--color-disabled)" : "var(--color-ink)" }}>
                {k + 1}
              </button>
            );
          })}
        </div>
        <button className="btn-ghost" onClick={() => go(1)} disabled={i === slides.length - 1} aria-label="Next slide">›</button>
      </div>
      {slides.length <= 8 && i === 7 && <p className="help" style={{ margin: 0 }}>Slides 9–13 open after you submit your Bridge answer.</p>}

      <div id="activity">
        {s.activity === "quick_check" && (
          <div className="card-activity">
            <span className="k">QUICK CHECK</span>
            {content.quick_check ? (
              <>
                <p className="serif" style={{ fontSize: 18 }}>{content.quick_check.question}</p>
                <div style={{ display: "grid", gap: 8 }}>
                  {content.quick_check.options.map((o, k) => (
                    <label key={k} className="card" style={{ display: "flex", gap: 10, padding: 12, alignItems: "center" }}>
                      <input type="radio" name="qc" checked={qc === k} disabled={entry.quick_check != null} onChange={() => setQc(k)} /> {o}
                    </label>
                  ))}
                </div>
                <button className="btn" style={{ marginTop: 10 }} disabled={qc == null || entry.quick_check != null || act.busy} onClick={() => act.run(`/api/airman/modules/${n}/quick-check`, { choice: qc })}>{entry.quick_check != null ? "Locked" : "Lock my answer"}</button>
              </>
            ) : <p className="gap">[NOLAN: quick-check question and four options]</p>}
          </div>
        )}
        {s.activity === "roleplay" && (
          <div className="card-activity">
            <span className="k">ROLE-PLAY</span>
            {content.roleplay ? (
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                <div className="card" style={{ padding: 10 }}><b>{content.roleplay.persona}</b><br />{content.roleplay.hook}</div>
                {content.roleplay.beats.map((b, k) => <div key={k} className="card" style={{ padding: 10, marginLeft: k % 2 ? 24 : 0 }}>{b}</div>)}
                <div className="card" style={{ padding: 10 }}><i>{content.roleplay.resolution}</i></div>
              </div>
            ) : <p className="gap">[NOLAN: role-play scenario: persona, hook, 3 decision beats, resolution]</p>}
          </div>
        )}
        {s.activity === "bridge" && (
          <div className="card-activity">
            <span className="k">BRIDGE · WRITTEN ANSWER</span>
            {entry.bridge_at ? (
              <p className="serif" style={{ fontSize: 18 }}>{entry.bridge}</p>
            ) : (
              <>
                <textarea className="in" rows={5} value={text} onChange={(e) => setText(e.target.value)} disabled={!content.reflect_prompt} placeholder="Write it as you'd say it." />
                <p className="help">Submit freezes your answer. It goes into your Almanac, which only you can read.</p>
                <button className="btn" disabled={!text.trim() || act.busy || !content.reflect_prompt} onClick={() => act.run(`/api/airman/modules/${n}/bridge`, { answer: text })}>{act.err ? "Retry" : "Submit"}</button>
              </>
            )}
          </div>
        )}
        {s.activity === "unveil" && (
          <div className="card-activity"><span className="k">YOUR BRIDGE ANSWER</span><p className="serif" style={{ fontSize: 18 }}>{entry.bridge}</p></div>
        )}
        {s.activity === "remix" && (
          <div className="card-activity">
            <span className="k">REMIX</span>
            {entry.remix ? <p className="serif" style={{ fontSize: 18 }}>{entry.remix}</p> : (
              <>
                <textarea className="in" rows={4} defaultValue={entry.bridge ?? ""} onChange={(e) => setText(e.target.value)} />
                <button className="btn" style={{ marginTop: 8 }} disabled={act.busy || sealed} onClick={() => act.run(`/api/airman/modules/${n}/remix`, { text: text || entry.bridge })}>{act.err ? "Retry" : "Save remix"}</button>
              </>
            )}
          </div>
        )}
        {s.activity === "gene" && (
          <div className="card-activity" style={{ display: "grid", gap: 10 }}>
            <span className="k">GENE</span>
            {crisis && <p role="alert" style={{ fontWeight: 600 }}>{CRISIS} Your facilitator will follow up in person.</p>}
            {geneQ.map((g, k) => (
              <div key={k} style={{ display: "grid", gap: 6 }}>
                <p className="serif" style={{ fontSize: 18, margin: 0, borderLeft: "3px solid var(--color-primary)", paddingLeft: 10 }}>{g.q}</p>
                {g.a && <p style={{ margin: 0, paddingLeft: 13 }}>{g.a}</p>}
              </div>
            ))}
            {!sealed && (geneQ.length === 0 ? (
              <button className="btn" disabled={act.busy} onClick={() => act.run<{ gene: Entry["gene"]; crisis?: boolean }>(`/api/airman/modules/${n}/gene`, {}, (r) => { setGeneQ(r.gene); setCrisis(Boolean(r.crisis)); })}>{act.busy ? "GENE is reading…" : act.err ? "Retry" : "Ask GENE"}</button>
            ) : geneQ[geneQ.length - 1].a == null && geneQ.length < 4 ? (
              <>
                <textarea className="in" rows={3} value={text} onChange={(e) => setText(e.target.value)} />
                <button className="btn" disabled={!text.trim() || act.busy} onClick={() => act.run<{ gene: Entry["gene"]; crisis?: boolean }>(`/api/airman/modules/${n}/gene`, { answer: text }, (r) => { setGeneQ(r.gene); setCrisis(Boolean(r.crisis)); setText(""); })}>{act.busy ? "GENE is reading…" : act.err ? "Retry" : "Answer"}</button>
              </>
            ) : null)}
          </div>
        )}
        {s.activity === "seal" && (
          <div className="card-activity" style={{ display: "grid", gap: 10 }}>
            <span className="k">ALMANAC · SEAL</span>
            {sealed ? <p style={{ margin: 0 }}>Sealed {new Date(entry.sealed_at!).toLocaleDateString()}. It&apos;s in your Almanac.</p> : (
              <>
                <label className="label" htmlFor="when">When ___ happens,</label>
                <input id="when" className="in" value={when} onChange={(e) => setWhen(e.target.value)} />
                <label className="label" htmlFor="will">I will ___.</label>
                <input id="will" className="in" value={will} onChange={(e) => setWill(e.target.value)} />
                <label style={{ display: "flex", gap: 10, fontSize: 14 }}><input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} /> Share this entry with my facilitator</label>
                <button className="btn" disabled={act.busy || !entry.bridge_at} onClick={() => act.run(`/api/airman/modules/${n}/seal`, { when, will, shared: share })}>{act.err ? "Retry" : "Seal this module"}</button>
              </>
            )}
          </div>
        )}
        {s.activity === "interlude" && (
          <div className="card-activity">
            <span className="k">CLOSING LAW</span>
            <p className="serif" style={{ fontSize: 20 }}>{props.closingLaw ?? "Your facilitator will read this module's Closing Law in the room."}</p>
          </div>
        )}
        {act.err && <p role="alert" className="err">{act.err}</p>}
      </div>
      {props.practice && <div style={{ marginTop: 20 }}>{props.practice}</div>}
    </main>
  );
}
