"use client";
// The 23 working frameworks, as React components. Ported from the Graphics & Frameworks library (22 Nov 2026).
// State lives in the component only: nothing a learner types is sent anywhere or kept after they leave the page.
import { useState, type ReactNode, type ChangeEvent } from "react";

const pad = (n: number) => String(n).padStart(2, "0");
const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const onKey = (f: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    f();
  }
};
const hit = (label: string, f: () => void) => ({ className: "fw-hit", tabIndex: 0, role: "button", "aria-label": label, onClick: f, onKeyDown: onKey(f) });

function Read({ children }: { children?: ReactNode }) {
  return <div className="fw-read" aria-live="polite">{children}</div>;
}
function Field({ label, id, children }: { label: string; id: string; children: (id: string) => ReactNode }) {
  return (
    <div>
      <label className="fw-label" htmlFor={id}>{label}</label>
      {children(id)}
    </div>
  );
}
function useFields<T extends Record<string, string>>(init: T) {
  const [v, setV] = useState(init);
  const bind = (k: keyof T) => ({ value: v[k], onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV((o) => ({ ...o, [k]: e.target.value })) });
  return [v, bind, setV] as const;
}
function Range({ id, min, max, value, onChange, label, step }: { id: string; min: number; max: number; value: number; onChange: (n: number) => void; label: string; step?: number }) {
  return <input id={id} className="fw-range" type="range" min={min} max={max} step={step ?? 1} value={value} aria-label={label} onChange={(e) => onChange(Number(e.target.value))} />;
}

/* 01 Dome and Citadel */
function DomeCitadel({ uid }: { uid: string }) {
  const steps: [string, string][] = [
    ["The Dome", "The given. What is true about you that won't change, and your worldview. The protected space you build under."],
    ["Cornerstones", "Laid first. Four fundamentals everything else is squared to."],
    ["Keystone", "Your meaning, purpose and why. Pull it and the arch falls."],
    ["Capstone", "Set last. It seals the build into one coherent philosophy."],
  ];
  const [n, setN] = useState(0);
  const op = (i: number) => (i < n ? 1 : 0.15);
  return (
    <div className="fw-stage">
      <div>
        <svg viewBox="0 0 360 300" role="img" aria-label="Dome over a square citadel with cornerstones, keystone and capstone">
          <g opacity={op(0)}><path d="M70 170 A110 110 0 0 1 290 170" className="f-gs s-g" strokeWidth="2" /><path d="M110 170 A70 70 0 0 1 250 170" className="f-none s-g" strokeDasharray="3 4" /></g>
          <rect x="80" y="170" width="200" height="100" className="f-w s-ln" strokeWidth="2" />
          <path d="M150 270 V225 A30 30 0 0 1 210 225 V270" className="f-pp s-ln" strokeWidth="2" />
          <g opacity={op(1)}>{[[80, 170], [256, 170], [80, 246], [256, 246]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="24" height="24" className="f-g" />)}</g>
          <g opacity={op(2)}><path d="M172 191 L188 191 L185 205 L175 205 Z" className="f-au" /></g>
          <g opacity={op(3)}><rect x="170" y="52" width="20" height="14" className="f-au" /><path d="M168 52 L192 52 L180 40 Z" className="f-au" /></g>
          <text x="180" y="292" textAnchor="middle" fontSize="11" className="t-mu">SQUARE BELOW · CIRCLE ABOVE</text>
        </svg>
        <div className="fw-row">
          <button type="button" className="fw-btn" disabled={n >= 4} onClick={() => setN((x) => Math.min(4, x + 1))}>{n >= 4 ? "Citadel complete" : "Lay the next stone"}</button>
          <button type="button" className="fw-btn-line" onClick={() => setN(0)}>Reset</button>
          <span className="fw-chip">{n} / 4</span>
        </div>
        <Read>{n > 0 && <><b>{steps[n - 1][0]}.</b> {steps[n - 1][1]}</>}</Read>
      </div>
      <div>
        <Field label="The Dome · what is given" id={`${uid}-dome`}>{(id) => <textarea id={id} className="fw-ta" placeholder="What is true about you that won't change?" />}</Field>
        <span className="fw-label">Cornerstones · four fundamentals</span>
        {[1, 2, 3, 4].map((i) => <input key={i} className="fw-in" aria-label={`Cornerstone ${i}`} placeholder={`Cornerstone ${i}`} style={{ marginBottom: 6 }} />)}
        <Field label="Keystone · your why" id={`${uid}-key`}>{(id) => <input id={id} className="fw-in" placeholder="Pull this and the arch falls" />}</Field>
        <Field label="Capstone · your philosophy in one line" id={`${uid}-cap`}>{(id) => <input id={id} className="fw-in" placeholder="The line that seals it" />}</Field>
      </div>
    </div>
  );
}

/* 02 CODE */
function CreativeProcess({ uid }: { uid: string }) {
  const st: [string, string, string][] = [
    ["Capture", "A raw thought or an exposure sparks an idea. Write the note down.", "The raw note"],
    ["Organize", "Expand it into a full concept. Frame it as a question, a statement and a request.", "Question, statement, request"],
    ["Distill", "Keep your truth sensors on; the good material sticks. Rewrite the note with full context.", "The note, rewritten"],
    ["Express", "The ultimate reason. Make the thing and put it into the world.", "Where will it be expressed, and by when?"],
  ];
  const [k, setK] = useState(0);
  return (
    <div>
      <svg viewBox="0 0 640 150" role="img" aria-label="Four stages leading to Express">
        <path d="M60 75 H560" className="s-ln" strokeWidth="3" />
        {st.map((s, i) => {
          const x = 70 + i * 160, big = i === 3, on = i === k;
          return (
            <g key={s[0]} {...hit(s[0], () => setK(i))}>
              <circle cx={x} cy="75" r={big ? 44 : 32} className={big ? "f-au s-au" : on ? "f-gs s-g" : "f-w s-g"} strokeWidth="2" />
              <text x={x} y="80" textAnchor="middle" fontSize={big ? 15 : 13} fontWeight="600" className={big ? "t-on-au" : "t-g"}>{s[0]}</text>
              <text x={x} y={big ? 140 : 128} textAnchor="middle" fontSize="11" className="t-mu">{pad(i + 1)}</text>
            </g>
          );
        })}
      </svg>
      <Read><b>{st[k][0]}.</b> {st[k][1]}</Read>
      <div className="fw-auto" style={{ marginTop: 12 }}>
        {st.map((s, i) => <Field key={s[0]} label={s[0]} id={`${uid}-c${i}`}>{(id) => <textarea id={id} className="fw-ta" placeholder={s[2]} onFocus={() => setK(i)} />}</Field>)}
      </div>
    </div>
  );
}

/* 03 HCOS */
function Hcos({ uid }: { uid: string }) {
  const ax = ["Thinks", "Acts", "Trains", "Recovers", "Decides", "Leads"];
  const [v, setV] = useState(ax.map(() => 5));
  const cx = 170, cy = 160, R = 120;
  const pt = (i: number, r: number) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const lo = Math.min(...v), hi = Math.max(...v);
  return (
    <div className="fw-stage">
      <svg viewBox="0 0 340 320" role="img" aria-label="Six-axis radar">
        {[0.2, 0.4, 0.6, 0.8, 1].map((k) => <polygon key={k} points={ax.map((_, i) => pt(i, R * k).join(",")).join(" ")} className="f-none s-ln" />)}
        {ax.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="s-ln" />; })}
        <polygon points={v.map((x, i) => pt(i, (R * x) / 10).join(",")).join(" ")} className="f-g s-g" fillOpacity=".25" strokeWidth="2" />
        {ax.map((a, i) => { const [x, y] = pt(i, R + 20); return <text key={a} x={x} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="600">{a}</text>; })}
      </svg>
      <div>
        {ax.map((a, i) => (
          <div key={a}>
            <label className="fw-label" htmlFor={`${uid}-h${i}`}>{a} · {v[i]}</label>
            <Range id={`${uid}-h${i}`} min={1} max={10} value={v[i]} label={a} onChange={(x) => setV((o) => o.map((y, j) => (j === i ? x : y)))} />
          </div>
        ))}
        <Read>{lo === hi ? "Even across all six. Retake this after the program to see what moved." : <>Thinnest: <b>{ax.filter((_, i) => v[i] === lo).join(", ")}</b> ({lo}/10). The system runs only as well as its weakest function.</>}</Read>
      </div>
    </div>
  );
}

/* 04 Optimization stack (reworded 25 Nov 2026: the middle layer is applied psychology only) */
function OptimizationStack() {
  const L: [string, string, string][] = [
    ["Anthropology", "The study of human behavior across cultures, time and environments.", "Design rituals, shape identity, build commitment, prevent entropy in groups. Status, hierarchy, ritual and meaning all drive performance."],
    ["Applied psychology (boundary-aware)", "How patterns of thought and behavior form, and how they start working against a person.", "Understand the patterns that hold people back, notice early when something is off, design preventive habits. You do not fix people: you optimize function and know when to refer someone to a qualified professional."],
    ["Behavioral psychology", "How environment, reinforcement and conditioning shape behavior.", "Habit formation, incentive alignment, stress-response conditioning, performance reinforcement loops. You engineer behavior instead of discussing feelings."],
  ];
  const [k, setK] = useState<number | null>(null);
  const fills = ["f-aus", "f-gs", "f-g"];
  return (
    <div className="fw-stage">
      <svg viewBox="0 0 340 250" role="img" aria-label="Three-layer stack">
        <text x="170" y="18" textAnchor="middle" fontSize="11" className="t-mu">GROUP · CULTURE</text>
        {L.map((l, i) => { const y = 30 + i * 70, w = 220 + i * 50, x = 170 - w / 2; return (
          <g key={l[0]} {...hit(l[0], () => setK(i))}>
            <rect x={x} y={y} width={w} height="58" className={`${fills[i]} s-g`} strokeWidth={k === i ? 3 : 1} />
            <text x="170" y={y + 34} textAnchor="middle" fontSize="13" fontWeight="600" className={i === 2 ? "t-on-g" : ""}>{l[0].split(" (")[0]}</text>
          </g>
        ); })}
        <text x="170" y="246" textAnchor="middle" fontSize="11" className="t-mu">INDIVIDUAL · BEHAVIOR</text>
      </svg>
      <Read>{k === null ? "Tap a layer to open it." : <><b>{L[k][0]}</b><div>{L[k][1]}</div><p style={{ margin: "10px 0 0" }}><b>Applied:</b> {L[k][2]}</p></>}</Read>
    </div>
  );
}

/* 05 Career types */
function CareerTypes() {
  const T: [string, string, string][] = [
    ["Specialist", "Depth, precision, expertise", "Builds deep, narrow expertise in one skill or domain. You monetize scarcity."],
    ["Generalist", "Breadth, adaptability, systems thinking", "Operates across multiple domains and connects disciplines. You monetize adaptability and integration."],
    ["Operator", "Execution, reliability, process mastery", "Excels at turning plans into results."],
    ["Innovator", "Creation, disruption, new value", "Creates new solutions, systems or products."],
    ["Entrepreneur", "Ownership, leverage, systems", "Builds structures that generate value beyond personal labor."],
    ["Investor", "Capital, patience, long-term thinking", "Allocates resources to multiply value over time."],
  ];
  const [sel, setSel] = useState<number[]>([]);
  const toggle = (i: number) => setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...(s.length >= 3 ? s.slice(1) : s), i]));
  return (
    <div>
      <div className="fw-tiles">
        {T.map((t, i) => <button type="button" key={t[0]} className="fw-tile" aria-pressed={sel.includes(i)} onClick={() => toggle(i)}><b>{t[0]}</b><small>{t[1]}</small></button>)}
      </div>
      <Read>{sel.length > 0 && <>
        <b>Your stack: {sel.map((i) => T[i][0]).join(" + ")}</b>
        {sel.map((i) => <div key={i}><b>{T[i][0]}:</b> {T[i][2]}</div>)}
        {sel.includes(0) && <p style={{ margin: "10px 0 0" }}><i>Specialist self-audit: if my main skill vanished tomorrow, how quickly could I pivot?</i></p>}
      </>}</Read>
    </div>
  );
}

/* 06 Magnetic brand ladder */
function BrandLadder({ uid }: { uid: string }) {
  const R: [string, string][] = [["Visibility", "Create contact points: posts, videos, interactions."], ["Credibility", "Demonstrate competence: results, testimonials."], ["Connection", "Engage with your audience personally: comments, stories."], ["Trust", "Show reliability and shared values."], ["Conversion", "Align offers with expressed needs."]];
  const [v, setV] = useState(R.map(() => 3));
  const b = v.findIndex((x) => x < 3);
  return (
    <div className="fw-stage">
      <svg viewBox="0 0 300 330" role="img" aria-label="Five-rung ladder">
        <line x1="70" y1="10" x2="70" y2="320" className="s-g" strokeWidth="4" /><line x1="230" y1="10" x2="230" y2="320" className="s-g" strokeWidth="4" />
        {R.map((r, i) => { const y = 295 - i * 62; return (
          <g key={r[0]}><rect x="70" y={y - 7} width="160" height="14" className="f-pp s-ln" /><rect x="70" y={y - 7} width={(160 * v[i]) / 5} height="14" className={v[i] < 3 ? "f-au" : "f-g"} /><text x="150" y={y - 14} textAnchor="middle" fontSize="12" fontWeight="600">{r[0]}</text></g>
        ); })}
      </svg>
      <div>
        {R.map((r, i) => <div key={r[0]}><label className="fw-label" htmlFor={`${uid}-r${i}`}>{pad(i + 1)} {r[0]} · {v[i]}/5</label><Range id={`${uid}-r${i}`} min={1} max={5} value={v[i]} label={r[0]} onChange={(x) => setV((o) => o.map((y, j) => (j === i ? x : y)))} /></div>)}
        <Read>{b < 0 ? "No weak rung. Keep measuring outcomes (engaged audience, open and click rates, conversion), not reach." : <><b>The ladder breaks at {R[b][0]}.</b> Everything above it is resting on air. Work: {R[b][1]}</>}</Read>
      </div>
    </div>
  );
}

/* 07 Content GPS */
function ContentGps({ uid }: { uid: string }) {
  const W = ["Attraction", "Trust", "Conversion", "Retention"];
  const P = [[80, 88], [250, 112], [420, 68], [590, 104]];
  const [log, setLog] = useState<{ t: string; c: string; w: number }[]>([]);
  const [f, bind, setF] = useFields({ t: "", c: "", w: "0" });
  const count = (i: number) => log.filter((p) => p.w === i).length;
  const empty = W.filter((_, i) => !count(i));
  return (
    <div>
      <svg viewBox="0 0 640 170" role="img" aria-label="Route with four waypoints">
        <path d="M40 120 C150 20, 250 160, 330 90 S 520 30, 600 110" className="f-none s-ln" strokeWidth="4" strokeDasharray="2 8" strokeLinecap="round" />
        {W.map((w, i) => { const [x, y] = P[i]; const n = count(i); return (
          <g key={w}><path d={`M${x} ${y} c-14 -18 -14 -36 0 -36 c14 0 14 18 0 36z`} className={i === 3 ? "f-au" : "f-g"} /><circle cx={x} cy={y - 24} r="5" className="f-pp" /><text x={x} y={y + 20} textAnchor="middle" fontSize="13" fontWeight="600">{w}</text><text x={x} y={y + 36} textAnchor="middle" fontSize="11" className="t-mu">{n} piece{n === 1 ? "" : "s"}</text></g>
        ); })}
      </svg>
      <form className="fw-row" style={{ alignItems: "end" }} onSubmit={(e) => {
        e.preventDefault();
        if (!f.t.trim()) return;
        setLog((l) => [...l, { t: f.t.trim(), c: f.c.trim(), w: Number(f.w) }]);
        setF((o) => ({ ...o, t: "", c: "" }));
      }}>
        <div style={{ flex: 2, minWidth: 180 }}><Field label="Piece" id={`${uid}-t`}>{(id) => <input id={id} className="fw-in" placeholder="e.g. The Oak video" {...bind("t")} />}</Field></div>
        <div style={{ flex: 1, minWidth: 130 }}><Field label="Serves" id={`${uid}-w`}>{(id) => <select id={id} className="fw-sel" {...bind("w")}>{W.map((w, i) => <option key={w} value={i}>{w}</option>)}</select>}</Field></div>
        <div style={{ flex: 2, minWidth: 160 }}><Field label="Next step" id={`${uid}-c`}>{(id) => <input id={id} className="fw-in" placeholder="Subscribe, join list..." {...bind("c")} />}</Field></div>
        <button type="submit" className="fw-btn">Route it</button>
      </form>
      <Read>{log.length > 0 && <>
        {log.map((p, i) => <div key={i}><b>{W[p.w]}:</b> {p.t}{p.c ? ` → ${p.c}` : <span className="fw-flag"> (no next step)</span>}</div>)}
        {empty.length > 0 && <p style={{ margin: "10px 0 0" }}>Empty on the map: <b>{empty.join(", ")}</b>.</p>}
      </>}</Read>
    </div>
  );
}

/* 08 Founder identity */
function FounderIdentity({ uid }: { uid: string }) {
  const M = ["Who you were", "What you learned", "How you solve the problem", "Why it matters to them"];
  const [v, setV] = useState(M.map(() => ""));
  return (
    <div>
      <div className="fw-stage">
        <svg viewBox="0 0 320 260" role="img" aria-label="Three overlapping circles: identity, personal brand, company brand">
          <circle cx="120" cy="100" r="75" className="f-g s-g" fillOpacity=".18" /><circle cx="200" cy="100" r="75" className="f-au s-au" fillOpacity=".2" /><circle cx="160" cy="165" r="75" className="f-g s-ink" fillOpacity=".08" />
          <text x="92" y="80" textAnchor="middle" fontSize="12" fontWeight="600">Identity</text><text x="230" y="80" textAnchor="middle" fontSize="12" fontWeight="600">Personal brand</text><text x="160" y="215" textAnchor="middle" fontSize="12" fontWeight="600">Company brand</text><text x="160" y="128" textAnchor="middle" fontSize="11" fontWeight="600" className="t-g">one story</text>
        </svg>
        <div>{M.map((m, i) => <Field key={m} label={`${pad(i + 1)} ${m}`} id={`${uid}-m${i}`}>{(id) => <input id={id} className="fw-in" value={v[i]} onChange={(e) => setV((o) => o.map((x, j) => (j === i ? e.target.value : x)))} />}</Field>)}</div>
      </div>
      <Read>{v.some((x) => x.trim()) && v.map((t, i) => <span key={i}>{i > 0 && " → "}{t.trim() || <span className="fw-flag">[{M[i]}]</span>}</span>)}</Read>
    </div>
  );
}

/* 09 Life-awareness equation */
function LifeAwareness() {
  const T = ["Life awareness", "+", "Self awareness", "=", "Comprehension", "=", "Narrative + Engagement", "=", "Resilience", "…", "?", "=", "Polymathy", "…", "?", "=", "Sovereignty"];
  const [n, setN] = useState(1);
  return (
    <div>
      <div className="fw-eq">
        {T.slice(0, n).map((t, i) => /^[+=…]$/.test(t) ? <span key={i} className="fw-op">{t}</span> : t === "?" ? <span key={i} className="fw-chip fw-flag">[NOLAN: the step here]</span> : <span key={i} className="fw-chip fw-chip-on fw-fade" style={{ fontSize: 14, padding: "8px 12px" }}>{t}</span>)}
      </div>
      <div className="fw-row">
        <button type="button" className="fw-btn" disabled={n >= T.length} onClick={() => setN((x) => Math.min(T.length, x + 2))}>Reveal next</button>
        <button type="button" className="fw-btn-line" onClick={() => setN(T.length)}>Show all</button>
        <button type="button" className="fw-btn-line" onClick={() => setN(1)}>Reset</button>
      </div>
    </div>
  );
}

/* 10 Four domains */
function FourDomains({ uid }: { uid: string }) {
  const D = ["Influence", "Innovation", "Invention", "Intuition"];
  const [side, setSide] = useState(D.map(() => "p"));
  const [pull, setPull] = useState(D.map(() => 3));
  return (
    <div className="fw-tiles" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
      {D.map((d, i) => (
        <div key={d} className="fw-box">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <b style={{ fontFamily: "var(--fw-display)", fontWeight: 400, fontSize: 24 }}>{d}</b>
            <div className="fw-seg" role="group" aria-label={`${d} side`}>
              {[["p", "Pursuit"], ["c", "Caution"]].map(([k, l]) => <button key={k} type="button" aria-pressed={side[i] === k} onClick={() => setSide((o) => o.map((x, j) => (j === i ? k : x)))}>{l}</button>)}
            </div>
          </div>
          {side[i] === "p" ? (
            <>
              <label className="fw-label" htmlFor={`${uid}-p${i}`}>How strongly is this part of your purpose? {pull[i]}/5</label>
              <Range id={`${uid}-p${i}`} min={1} max={5} value={pull[i]} label={`${d} pull`} onChange={(x) => setPull((o) => o.map((y, j) => (j === i ? x : y)))} />
              <textarea className="fw-ta" aria-label={`Where you pursue ${d.toLowerCase()} now`} placeholder={`Where you pursue ${d.toLowerCase()} now`} style={{ marginTop: 8 }} />
            </>
          ) : (
            <>
              <label className="fw-label fw-flag" htmlFor={`${uid}-c${i}`}>Where could {d.toLowerCase()} sweep you away?</label>
              <textarea id={`${uid}-c${i}`} className="fw-ta" placeholder="The way this domain gets used against you" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/* 11 Focus funnel */
function FocusFunnel({ uid }: { uid: string }) {
  const L: [string, string][] = [["Involvements", "Everything you are part of"], ["Subjects", "What those involvements are about"], ["Concepts", "The ideas underneath the subjects"], ["Values", "What the concepts serve"]];
  const [v, setV] = useState(L.map(() => ""));
  const c = v.map(lines);
  const fills = ["f-aus", "f-gs", "f-gs", "f-au"];
  return (
    <div>
      <div className="fw-stage">
        <svg viewBox="0 0 320 300" role="img" aria-label="Four-tier funnel">
          {L.map((l, i) => { const t = 30 + i * 65, top = 280 - i * 60, bot = 280 - (i + 1) * 60; return (
            <g key={l[0]}><path d={`M${160 - top / 2} ${t} L${160 + top / 2} ${t} L${160 + bot / 2} ${t + 58} L${160 - bot / 2} ${t + 58} Z`} className={`${fills[i]} s-g`} /><text x="160" y={t + 28} textAnchor="middle" fontSize="13" fontWeight="600" className={i === 3 ? "t-on-au" : ""}>{l[0]}</text><text x="160" y={t + 44} textAnchor="middle" fontSize="11" className={i === 3 ? "t-on-au" : "t-mu"}>{c[i].length} item{c[i].length === 1 ? "" : "s"}</text></g>
          ); })}
        </svg>
        <div>{L.map((l, i) => <Field key={l[0]} label={l[0]} id={`${uid}-f${i}`}>{(id) => <textarea id={id} className="fw-ta" placeholder={l[1]} value={v[i]} onChange={(e) => setV((o) => o.map((x, j) => (j === i ? e.target.value : x)))} />}</Field>)}</div>
      </div>
      <Read>{c[3].length > 0 && <><b>What your focus is for:</b> {c[3].join(" · ")}{c[0].length > 0 && c[0].length <= c[3].length && <div className="fw-flag">The funnel isn&apos;t narrowing; press harder at each level.</div>}</>}</Read>
    </div>
  );
}

/* 12 Voyage path */
function VoyagePath({ uid }: { uid: string }) {
  const S = ["Aim", "Launch", "Arrive", "Establish", "Conquer", "Analyze", "Impact", "Create", "Refine", "Repeat"];
  const P = S.map((_, i) => [50 + i * 60, i % 2 ? 70 : 120]);
  const [at, setAt] = useState<number | null>(null);
  const [p, setP] = useState("");
  return (
    <div>
      <div style={{ maxWidth: 420 }}><Field label="Current pursuit" id={`${uid}-p`}>{(id) => <input id={id} className="fw-in" placeholder="What are you going after?" value={p} onChange={(e) => setP(e.target.value)} />}</Field></div>
      <svg viewBox="0 0 640 200" role="img" aria-label="Ten-stage voyage" style={{ marginTop: 12 }}>
        <path d={`M${P.map((q) => q.join(" ")).join(" L")}`} className="f-none s-ln" strokeWidth="3" />
        <path d="M590 70 C 640 180, 40 200, 50 128" className="f-none s-au" strokeWidth="1.5" strokeDasharray="4 5" />
        <text x="320" y="192" textAnchor="middle" fontSize="11" className="t-au">REPEAT</text>
        {S.map((s, i) => (
          <g key={s} {...hit(s, () => setAt(i))}>
            <circle cx={P[i][0]} cy={P[i][1]} r="12" className={`${at === null || i > at ? "f-w" : i === at ? "f-au" : "f-gs"} s-g`} strokeWidth="2" />
            <text x={P[i][0]} y={P[i][1] + 4} textAnchor="middle" fontSize="10" className={at === i ? "t-on-au" : "t-g"}>{i + 1}</text>
            <text x={P[i][0]} y={P[i][1] + (i % 2 ? -20 : 30)} textAnchor="middle" fontSize="12" fontWeight="600">{s}</text>
          </g>
        ))}
      </svg>
      <Read>{at !== null && <>{p.trim() && <><b>{p.trim()}</b>: </>}you are at <b>{S[at]}</b> (stage {at + 1} of 10). {at < 9 ? <>Next: <b>{S[at + 1]}</b>.</> : <>Back to <b>Aim</b> with what you learned.</>}</>}</Read>
    </div>
  );
}

/* 13 Goal tree */
function GoalTree({ uid }: { uid: string }) {
  const [f, bind] = useFields({ goal: "", ms: "", sys: "", val: "", inc: "" });
  const [forget, setForget] = useState(false);
  return (
    <div>
      <div className="fw-stage">
        <svg viewBox="0 0 320 340" role="img" aria-label="Tree: values roots, system trunk, milestone branches, goal crown">
          <g opacity={forget ? 0.18 : 1} style={{ transition: "opacity .3s ease-out" }}><ellipse cx="160" cy="70" rx="110" ry="55" className="f-gs s-g" /><text x="160" y="66" textAnchor="middle" fontSize="13" fontWeight="600">Goal</text><text x="160" y="84" textAnchor="middle" fontSize="11" className="t-mu">{f.goal.slice(0, 34)}</text></g>
          <path d="M160 125 L110 95 M160 145 L215 100 M160 165 L100 125" className="s-g" strokeWidth="5" strokeLinecap="round" />
          {[[110, 95], [215, 100], [100, 125]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="7" className="f-au" />)}
          <rect x="146" y="120" width="28" height="140" className="f-g" /><text x="160" y="200" textAnchor="middle" fontSize="12" fontWeight="600" className="t-on-g" transform="rotate(-90 160 200)">SYSTEM</text>
          <path d="M260 290 H60" className="s-ln" strokeWidth="2" />
          <path d="M160 260 C140 290 90 300 70 325 M160 260 C165 295 160 310 160 332 M160 260 C185 290 230 300 255 322" className="f-none s-au" strokeWidth="3" />
          <text x="250" y="284" textAnchor="middle" fontSize="11" fontWeight="600" className="t-au">ROOT VALUES</text>
          <text x="236" y="140" fontSize="10" className="t-au">● incentive /</text><text x="236" y="152" fontSize="10" className="t-au">fast track</text>
        </svg>
        <div>
          <Field label="The goal" id={`${uid}-g`}>{(id) => <input id={id} className="fw-in" {...bind("goal")} />}</Field>
          <Field label="Milestones (one per line)" id={`${uid}-m`}>{(id) => <textarea id={id} className="fw-ta" {...bind("ms")} />}</Field>
          <Field label="The system · what you do every week" id={`${uid}-s`}>{(id) => <textarea id={id} className="fw-ta" {...bind("sys")} />}</Field>
          <Field label="Root values" id={`${uid}-v`}>{(id) => <input id={id} className="fw-in" {...bind("val")} />}</Field>
          <Field label="Incentives and fast tracks" id={`${uid}-i`}>{(id) => <input id={id} className="fw-in" {...bind("inc")} />}</Field>
          <div className="fw-row"><button type="button" className="fw-btn-line" aria-pressed={forget} onClick={() => setForget((x) => !x)}>{forget ? "Bring the goal back" : "Forget the goal"}</button></div>
        </div>
      </div>
      <Read>{forget && (f.sys.trim() ? <><b>Your focus now:</b> {f.sys.trim()}{f.val.trim() ? <div><b>Rooted in:</b> {f.val.trim()}</div> : <div className="fw-flag">No root values yet. A system without roots gets pulled out at the first storm.</div>}</> : "Write the system. With the goal set aside, that is all that is left to do.")}</Read>
    </div>
  );
}

/* 14 Personal operating system */
function PersonalOs({ uid }: { uid: string }) {
  const [h, setH] = useState(["", "", ""]);
  const [f, bind] = useFields({ smart: "", ms: "", str: "", tac: "" });
  const names = ["20", "10", "5"];
  const miss = names.filter((_, i) => !h[i].trim());
  const any = h.some((x) => x.trim()) || f.tac.trim();
  return (
    <div>
      <svg viewBox="0 0 640 120" role="img" aria-label="Timeline from now to 20 years, reverse-engineered">
        <defs><marker id={`${uid}-ar`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M8 0 L0 4 L8 8" className="f-none s-au" /></marker></defs>
        <line x1="40" y1="60" x2="610" y2="60" className="s-g" strokeWidth="3" />
        {([[40, "NOW"], [230, "5 YR"], [410, "10 YR"], [610, "20 YR"]] as [number, string][]).map(([x, t], i) => <g key={t}><circle cx={x} cy="60" r={i ? 9 : 6} className={i ? "f-au" : "f-g"} /><text x={x} y="40" textAnchor="middle" fontSize="11" fontWeight="600">{t}</text></g>)}
        {[90, 140, 185, 290, 350, 480, 545].map((x) => <line key={x} x1={x} y1="52" x2={x} y2="68" className="s-g" strokeWidth="2" />)}
        <text x="135" y="92" textAnchor="middle" fontSize="10" className="t-mu">milestones · strategy between them</text>
        <path d="M560 95 H90" className="s-au" strokeDasharray="3 4" markerEnd={`url(#${uid}-ar)`} />
        <text x="430" y="112" textAnchor="middle" fontSize="10" className="t-au">REVERSE-ENGINEERED</text>
      </svg>
      <div className="fw-cols3">{names.map((n, i) => <Field key={n} label={`${n} years · outcome`} id={`${uid}-h${i}`}>{(id) => <textarea id={id} className="fw-ta" value={h[i]} onChange={(e) => setH((o) => o.map((x, j) => (j === i ? e.target.value : x)))} />}</Field>)}</div>
      <div className="fw-stage">
        <div>
          <Field label="Next SMART goal" id={`${uid}-sm`}>{(id) => <input id={id} className="fw-in" placeholder="Specific, measurable, achievable, relevant, time-bound" {...bind("smart")} />}</Field>
          <Field label="Milestones to audit trajectory" id={`${uid}-ms`}>{(id) => <textarea id={id} className="fw-ta" {...bind("ms")} />}</Field>
        </div>
        <div>
          <Field label="Strategy between milestones" id={`${uid}-st`}>{(id) => <textarea id={id} className="fw-ta" {...bind("str")} />}</Field>
          <Field label="Tactics · this month" id={`${uid}-ta`}>{(id) => <textarea id={id} className="fw-ta" {...bind("tac")} />}</Field>
        </div>
      </div>
      <Read>{any && (miss.length ? <>Still open: the <b>{miss.join(", ")}-year</b> outcome{miss.length > 1 ? "s" : ""}. Tactics can&apos;t be audited against an end you haven&apos;t named.</> : <>All three horizons named. {f.tac.trim() ? "Check each tactic: does it serve the strategy, the milestone, and the 5-year outcome?" : "Work back down to this month's tactics."}</>)}</Read>
    </div>
  );
}

/* 15 Type B day / Type A life */
function TypeBTypeA() {
  const Q: Record<string, string> = { "0,0": "Rigid day, drifting life: tight schedules with no ruthless vision behind them.", "1,0": "Flexible day, drifting life: adaptive, but nothing is being built.", "0,1": "Rigid day, ruthless life: the vision is right, but the day is brittle and breaks under friction.", "1,1": "Flexible day, ruthless life. This is the target." };
  const [dot, setDot] = useState<[number, number] | null>(null);
  const place = (x: number, y: number) => setDot([Math.max(40, Math.min(300, x)), Math.max(20, Math.min(280, y))]);
  const cells: [number, number, string][] = [[105, 85, "Rigid day, ruthless life"], [235, 85, "Flexible day, ruthless life"], [105, 215, "Rigid day, drifting life"], [235, 215, "Flexible day, drifting life"]];
  return (
    <div className="fw-stage">
      <svg viewBox="0 0 320 320" role="img" aria-label="Two-by-two grid: your day against your life" className="fw-hit" onClick={(e) => {
        const svg = e.currentTarget, p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
        const q = p.matrixTransform(svg.getScreenCTM()!.inverse()); place(q.x, q.y);
      }}>
        <rect x="40" y="20" width="260" height="260" className="f-w s-ln" /><rect x="170" y="20" width="130" height="130" className="f-aus" />
        <line x1="170" y1="20" x2="170" y2="280" className="s-ln" /><line x1="40" y1="150" x2="300" y2="150" className="s-ln" />
        {cells.map(([x, y, l]) => <rect key={l} x={x - 65} y={y - 65} width="130" height="130" fill="transparent" tabIndex={0} role="button" aria-label={l} onKeyDown={onKey(() => place(x, y))} />)}
        <text x="235" y="80" textAnchor="middle" fontSize="11" fontWeight="600" className="t-au">TARGET</text>
        <text x="170" y="305" textAnchor="middle" fontSize="11" className="t-mu">YOUR DAY: rigid (A) → flexible (B)</text>
        <text x="20" y="150" textAnchor="middle" fontSize="11" className="t-mu" transform="rotate(-90 20 150)">YOUR LIFE: drifting (B) → ruthless (A)</text>
        {dot && <circle r="9" cx={dot[0]} cy={dot[1]} className="f-g" />}
      </svg>
      <Read>{dot ? Q[`${dot[0] > 170 ? 1 : 0},${dot[1] < 150 ? 1 : 0}`] : "Tap the grid."}</Read>
    </div>
  );
}

/* 16 Funding chain */
function FundingChain({ uid }: { uid: string }) {
  const S = ["Earn money", "Fund the work", "Develop the assets", "Fuel the purpose and passion", "Build the vision"];
  const [v, setV] = useState(S.map(() => ""));
  const b = v.findIndex((t) => !t.trim());
  const split = (s: string) => (s.length > 18 ? [s.split(" the ")[0] + " the", s.split(" the ")[1]] : [s]);
  return (
    <div>
      <svg viewBox="0 0 640 210" role="img" aria-label="Five-step staircase">
        {S.map((s, i) => { const x = 20 + i * 122, y = 160 - i * 34, t = split(s); return (
          <g key={s}><rect x={x} y={y} width="118" height={200 - y} className={`${i === 4 ? "f-au" : i % 2 ? "f-gs" : "f-w"} s-g`} />
            {t.map((ln, k) => <text key={k} x={x + 59} y={y + 20 + k * 15} textAnchor="middle" fontSize="11.5" fontWeight="600" className={i === 4 ? "t-on-au" : ""}>{ln}</text>)}
            <text x={x + 59} y={y + 55} textAnchor="middle" fontSize="10.5" className={i === 4 ? "t-on-au" : "t-g"}>{v[i].slice(0, 18)}</text></g>
        ); })}
      </svg>
      <div className="fw-auto">{S.map((s, i) => <Field key={s} label={`${pad(i + 1)} yours`} id={`${uid}-s${i}`}>{(id) => <input id={id} className="fw-in" placeholder={s} value={v[i]} onChange={(e) => setV((o) => o.map((x, j) => (j === i ? e.target.value : x)))} />}</Field>)}</div>
      <Read>{v.some((x) => x.trim()) && (b < 0 ? "The chain is complete. Every step pays for the next." : <>The chain is unnamed at <b>{S[b]}</b>. Everything above it is unfunded.</>)}</Read>
    </div>
  );
}

/* 17 Management 3C */
function Management3c({ uid }: { uid: string }) {
  const Q: [string, string, string][] = [["Competence", "Do they have the skill?", "Train it."], ["Context", "Do they have the information?", "Deliver it."], ["Conscientiousness", "Do they care about the outcome?", "You will always need management here."]];
  const [a, setA] = useState<(boolean | null)[]>([null, null, null]);
  const [who, setWho] = useState("");
  const w = who.trim() || "They";
  const s = w === "They" ? "" : "s";
  const miss = Q.filter((_, i) => a[i] === false);
  return (
    <div>
      <div style={{ maxWidth: 640 }}><Field label="Who or what team" id={`${uid}-w`}>{(id) => <input id={id} className="fw-in" placeholder="Name the person or team" value={who} onChange={(e) => setWho(e.target.value)} />}</Field></div>
      <ul className="fw-tests">
        {Q.map((q, i) => (
          <li key={q[0]}><div><b>{q[0]}</b><small>{q[1]}</small></div>
            <div className="fw-seg" role="group" aria-label={q[0]}>{[true, false].map((v) => <button key={String(v)} type="button" aria-pressed={a[i] === v} onClick={() => setA((o) => o.map((x, j) => (j === i ? v : x)))}>{v ? "Yes" : "No"}</button>)}</div></li>
        ))}
      </ul>
      <Read>{!a.includes(null) && (miss.length ? <><b>{w}</b> need{s} management for: {miss.map((m, k) => <span key={m[0]}>{k > 0 && "; "}<b>{m[0]}</b> → {m[2]}</span>)}</> : <><b>{w}</b> need{s} no management, only structured synthesis: set the order of the conversation and step back.</>)}</Read>
    </div>
  );
}

/* 18 Velocity */
function Velocity({ uid }: { uid: string }) {
  const [p, setP] = useState(5);
  const [t, setT] = useState(5);
  return (
    <div>
      <div className="fw-stage">
        <div>
          <p style={{ font: "300 clamp(20px,3.2vw,28px)/1.3 var(--fw-display)", margin: "0 0 12px" }}>Radical prioritization <span className="fw-op">+</span> Extreme transparency <span className="fw-op">=</span> <i>Velocity</i></p>
          <svg viewBox="0 0 340 60" role="img" aria-label={`Velocity ${p + t} of 20`}>
            <rect x="0" y="14" width="340" height="26" className="f-w s-ln" /><rect x="0" y="14" width={p * 17} height="26" className="f-g" /><rect x={p * 17} y="14" width={t * 17} height="26" className="f-au" />
            <text x="170" y="56" textAnchor="middle" fontSize="11" className="t-mu">VELOCITY {p + t} / 20</text>
          </svg>
        </div>
        <div>
          <label className="fw-label" htmlFor={`${uid}-p`}>Radical prioritization · {p}/10</label>
          <Range id={`${uid}-p`} min={0} max={10} value={p} label="Radical prioritization" onChange={setP} />
          <p className="fw-private" style={{ marginTop: 4 }}>One thing first; everything else waits.</p>
          <label className="fw-label" htmlFor={`${uid}-t`}>Extreme transparency · {t}/10</label>
          <Range id={`${uid}-t`} min={0} max={10} value={t} label="Extreme transparency" onChange={setT} />
          <p className="fw-private" style={{ marginTop: 4 }}>Everyone sees the priorities, the status and the problems.</p>
        </div>
      </div>
      <Read>{p === t ? "Both terms are even. Raise either one." : <>The weaker term is <b>{p < t ? "prioritization" : "transparency"}</b>; that&apos;s where speed is leaking.</>}</Read>
    </div>
  );
}

/* 19 Versatilist */
function Versatilist({ uid }: { uid: string }) {
  const [d, setD] = useState<[string, number][]>([["", 60], ["", 60], ["", 60]]);
  const w = 300 / d.length;
  const at = d.filter((x) => x[1] >= 60).length;
  const set = (i: number, x: [string, number]) => setD((o) => o.map((y, j) => (j === i ? x : y)));
  return (
    <div>
      <div className="fw-stage">
        <svg viewBox="0 0 340 240" role="img" aria-label="Competence by domain against a 60 percent line">
          <line x1="20" y1="200" x2="330" y2="200" className="s-ln" />
          {d.map((x, i) => { const h = x[1] * 1.8; return <g key={i}><rect x={25 + i * w + 4} y={200 - h} width={w - 8} height={h} className={x[1] >= 60 ? "f-g" : "f-gs"} /><text x={25 + i * w + w / 2} y="216" textAnchor="middle" fontSize="10">{(x[0] || `Domain ${i + 1}`).slice(0, 12)}</text></g>; })}
          <line x1="20" y1="92" x2="330" y2="92" className="s-au" strokeWidth="2" strokeDasharray="5 4" /><text x="330" y="88" textAnchor="end" fontSize="11" fontWeight="600" className="t-au">60%</text>
        </svg>
        <div>{d.map((x, i) => (
          <div key={i}>
            <label className="fw-label" htmlFor={`${uid}-d${i}`}>Domain {i + 1} · {x[1]}%</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input id={`${uid}-d${i}`} className="fw-in" style={{ flex: 1, minWidth: 120 }} placeholder="e.g. Construction" value={x[0]} onChange={(e) => set(i, [e.target.value, x[1]])} />
              <div style={{ flex: 1, minWidth: 100 }}><Range id={`${uid}-v${i}`} min={0} max={100} step={5} value={x[1]} label={`Competence, domain ${i + 1}`} onChange={(v) => set(i, [x[0], v])} /></div>
            </div>
          </div>
        ))}</div>
      </div>
      <div className="fw-row"><button type="button" className="fw-btn-line" disabled={d.length >= 8} onClick={() => setD((o) => [...o, ["", 60]])}>Add domain</button></div>
      <Read><b>{at} of {d.length}</b> domains at or above 60%.{at >= 3 ? " That is versatilist range." : ""}</Read>
    </div>
  );
}

/* 20 Efficacy standard */
function EfficacyStandard({ uid }: { uid: string }) {
  const T: [string, string][] = [["Output", "Did the target outcome improve, measurably?"], ["Cost", "What did it cost: money, time, freedom, cohesion?"], ["Externalities", "Who paid the hidden bill? What harm landed downstream?"], ["Resilience", "Does it keep working under stress and variance?"], ["Reversibility", "Can we roll it back if it fails, or is it sticky?"]];
  const V = ["Passes", "Fails", "Unknown"];
  const [a, setA] = useState<(string | null)[]>(T.map(() => null));
  const [dec, setDec] = useState("");
  const d = dec.trim() || "This";
  const f = T.filter((_, i) => a[i] === "Fails").map((t) => t[0]);
  const u = T.filter((_, i) => a[i] === "Unknown").map((t) => t[0]);
  return (
    <div>
      <div style={{ maxWidth: 680 }}><Field label="The decision, plan or policy" id={`${uid}-d`}>{(id) => <input id={id} className="fw-in" placeholder="What are you putting on trial?" value={dec} onChange={(e) => setDec(e.target.value)} />}</Field></div>
      <ul className="fw-tests">
        {T.map((t, i) => <li key={t[0]}><div><b>{i + 1}. {t[0]}</b><small>{t[1]}</small></div><div className="fw-seg" role="group" aria-label={t[0]}>{V.map((v) => <button key={v} type="button" aria-pressed={a[i] === v} onClick={() => setA((o) => o.map((x, j) => (j === i ? v : x)))}>{v}</button>)}</div></li>)}
      </ul>
      <Read>{!a.includes(null) && (f.length ? <><b>{d}</b> fails on {f.join(", ")}. It doesn&apos;t meet the standard yet.</> : u.length ? <><b>{d}</b> passes what you can see, but {u.join(", ")} {u.length > 1 ? "are" : "is"} unaccounted for. No accounting without sunlight.</> : <><b>{d}</b> survives all five tests.</>)}</Read>
    </div>
  );
}

/* 21 Paired contrasts */
function PairedContrasts({ uid }: { uid: string }) {
  const P = [["Human doing", "Human being"], ["Accomplishment", "Success"], ["Wealth", "Wisdom"]];
  const [v, setV] = useState([0, 0, 0]);
  const lean = P.map((p, i) => (v[i] < 0 ? p[0] : v[i] > 0 ? p[1] : null)).filter(Boolean);
  return (
    <div>
      {P.map((p, i) => (
        <div key={p[0]} style={{ marginBottom: 14 }}>
          <svg viewBox="0 0 640 80" role="img" aria-label={`${p[0]} versus ${p[1]}`}>
            <polygon points="320,70 306,78 334,78" className="f-g" />
            <g style={{ transform: `rotate(${v[i] * 3}deg)`, transformOrigin: "320px 62px", transition: "transform .2s ease-out" }}>
              <line x1="80" y1="62" x2="560" y2="62" className="s-g" strokeWidth="4" />
              <rect x="40" y="36" width="140" height="22" className="f-aus" /><rect x="460" y="36" width="140" height="22" className="f-gs" />
              <text x="110" y="52" textAnchor="middle" fontSize="12" fontWeight="600">{p[0]}</text><text x="530" y="52" textAnchor="middle" fontSize="12" fontWeight="600">{p[1]}</text>
            </g>
          </svg>
          <Range id={`${uid}-p${i}`} min={-5} max={5} value={v[i]} label={`${p[0]} to ${p[1]}`} onChange={(x) => setV((o) => o.map((y, j) => (j === i ? x : y)))} />
        </div>
      ))}
      <Read>{lean.length > 0 && <>Your life leans toward: <b>{lean.join(" · ")}</b></>}</Read>
    </div>
  );
}

/* 22 House of rooms */
function IdentityHouse({ uid }: { uid: string }) {
  const [R, setR] = useState<{ n: string; w: number; burn: boolean }[]>([]);
  const [name, setName] = useState("");
  const [wt, setWt] = useState("2");
  const [msg, setMsg] = useState<ReactNode>(null);
  const tot = R.reduce((s, r) => s + r.w, 0) || 1;
  let x = 30;
  return (
    <div className="fw-stage">
      <svg viewBox="0 0 320 280" role="img" aria-label="House with identity rooms">
        <path d="M20 110 L160 20 L300 110 Z" className="f-g" /><rect x="30" y="110" width="260" height="160" className="f-w s-g" strokeWidth="2" />
        {!R.length && <text x="160" y="195" textAnchor="middle" fontSize="12" className="t-mu">Add your first room</text>}
        {R.map((r, i) => { const w = (260 * r.w) / tot, x0 = x; x += w; return (
          <g key={i}><rect x={x0} y="110" width={w} height="160" className={`${r.burn ? "f-warn" : "f-gs"} s-g`} fillOpacity={r.burn ? 0.25 : 1} /><text x={x0 + w / 2} y="195" textAnchor="middle" fontSize={w < 50 ? 9 : 12} fontWeight="600" className={r.burn ? "t-mu" : ""}>{r.n.slice(0, w < 50 ? 6 : 16)}</text></g>
        ); })}
      </svg>
      <div>
        <label className="fw-label" htmlFor={`${uid}-n`}>Add a room</label>
        <form style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }} onSubmit={(e) => { e.preventDefault(); const n = name.trim(); if (!n || R.length >= 8) return; setR((o) => [...o.map((r) => ({ ...r, burn: false })), { n, w: Number(wt), burn: false }]); setName(""); setMsg(null); }}>
          <input id={`${uid}-n`} className="fw-in" style={{ flex: 2, minWidth: 140 }} placeholder="e.g. Husband, Builder, Athlete" value={name} onChange={(e) => setName(e.target.value)} />
          <select className="fw-sel" style={{ flex: 1, minWidth: 110 }} aria-label="Size of the room" value={wt} onChange={(e) => setWt(e.target.value)}><option value="1">Small</option><option value="2">Medium</option><option value="3">Large</option></select>
          <button type="submit" className="fw-btn">Add</button>
        </form>
        <div className="fw-row">
          <button type="button" className="fw-btn" disabled={!R.length} onClick={() => {
            const big = R.reduce((a, b) => (b.w > a.w ? b : a));
            const all = R.reduce((s, r) => s + r.w, 0), left = Math.round((100 * (all - big.w)) / all);
            setR((o) => o.map((r) => ({ ...r, burn: r === big })));
            setMsg(<><b>{big.n}</b> burns. {left}% of the house still stands.{R.length === 1 ? " A single-room identity is lost." : left < 50 ? " Most of the self lived in one room; build the others." : ""} If that disappeared, would you no longer be?</>);
          }}>Fire test</button>
          <button type="button" className="fw-btn-line" onClick={() => { setR((o) => o.map((r) => ({ ...r, burn: false }))); setMsg(null); }}>Rebuild</button>
        </div>
        <Read>{msg}</Read>
      </div>
    </div>
  );
}

/* 23 Humor bridge */
function HumorBridge({ uid }: { uid: string }) {
  const [f, bind] = useFields({ a: "", c: "", b: "" });
  return (
    <div>
      <svg viewBox="0 0 640 170" role="img" aria-label="Two islands joined by a bridge">
        <ellipse cx="120" cy="110" rx="100" ry="40" className="f-gs s-g" /><ellipse cx="520" cy="110" rx="100" ry="40" className="f-aus s-au" />
        <path d="M200 100 Q320 20 440 100" className={`f-none ${f.c ? "s-g" : "s-ln"}`} strokeWidth="4" strokeDasharray={f.c ? undefined : "6 6"} />
        <text x="120" y="115" textAnchor="middle" fontSize="13" fontWeight="600">{(f.a || "Framework A").slice(0, 22)}</text>
        <text x="520" y="115" textAnchor="middle" fontSize="13" fontWeight="600">{(f.b || "Framework B").slice(0, 22)}</text>
        <text x="320" y="42" textAnchor="middle" fontSize="12" fontStyle="italic" className="t-g">{f.c.slice(0, 60)}</text>
      </svg>
      <div className="fw-cols3">
        <Field label="Framework A" id={`${uid}-a`}>{(id) => <input id={id} className="fw-in" placeholder="e.g. Roman aqueducts" {...bind("a")} />}</Field>
        <Field label="The connection" id={`${uid}-c`}>{(id) => <input id={id} className="fw-in" placeholder="What do they share?" {...bind("c")} />}</Field>
        <Field label="Framework B" id={`${uid}-b`}>{(id) => <input id={id} className="fw-in" placeholder="e.g. Your inbox" {...bind("b")} />}</Field>
      </div>
    </div>
  );
}

/* 24 Evidence ladder */
function EvidenceLadder({ uid }: { uid: string }) {
  const V = ["proves", "demonstrates", "shows", "indicates", "suggests", "may"];
  const rules = [
    "Limit scope: “in this sample,” “under these conditions,” “in the short run.”",
    "Be cautious with causation: observational data is “associated with” or “predicts”; only causal designs earn “caused” or “led to.”",
    "Make predictions conditional: “if current trends continue,” “is projected to.”",
    "Separate “is” from “ought”: empirical claims say “evidence suggests”; normative claims say “arguably” or “this implies.”",
    "Hedge once, then commit. Stacked hedges read as evasion.",
  ];
  const [k, setK] = useState(4);
  const [f, bind] = useFields({ s: "The data", o: "that structure beats willpower" });
  return (
    <div className="fw-stage">
      <svg viewBox="0 0 280 300" role="img" aria-label="Six-rung evidence ladder">
        <line x1="60" y1="10" x2="60" y2="290" className="s-g" strokeWidth="4" /><line x1="220" y1="10" x2="220" y2="290" className="s-g" strokeWidth="4" />
        {V.map((v, i) => (
          <g key={v} {...hit(v, () => setK(i))}>
            <rect x="60" y={22 + i * 46} width="160" height="28" className={`${i === k ? "f-au" : i > k ? "f-gs" : "f-w"} s-ln`} />
            <text x="140" y={41 + i * 46} textAnchor="middle" fontSize="13" fontWeight="600" className={i === k ? "t-on-au" : ""}>{v === "may" ? "may / might" : v}</text>
          </g>
        ))}
        <text x="250" y="30" fontSize="10" className="t-mu" transform="rotate(90 250 30)">STRONGER ↑</text>
      </svg>
      <div>
        <Field label="Your claim (without the verb)" id={`${uid}-s`}>{(id) => <input id={id} className="fw-in" {...bind("s")} />}</Field>
        <input className="fw-in" aria-label="The rest of the claim" style={{ marginTop: 6 }} {...bind("o")} />
        <div className="fw-read" style={{ font: "300 20px/1.4 var(--fw-display)" }} aria-live="polite">{f.s} <b>{V[k] === "may" ? "may show" : V[k]}</b> {f.o}.</div>
        <ul className="fw-private" style={{ paddingLeft: 16 }}>{rules.map((r) => <li key={r} style={{ marginBottom: 4 }}>{r}</li>)}</ul>
      </div>
    </div>
  );
}

export const TOOLS: Record<string, (p: { uid: string }) => ReactNode> = {
  "dome-citadel": DomeCitadel,
  "code-creative-process": CreativeProcess,
  "hcos-radar": Hcos,
  "optimization-stack": OptimizationStack,
  "career-types": CareerTypes,
  "magnetic-brand-ladder": BrandLadder,
  "content-gps": ContentGps,
  "founder-identity": FounderIdentity,
  "life-awareness-equation": LifeAwareness,
  "four-domains": FourDomains,
  "focus-funnel": FocusFunnel,
  "voyage-path": VoyagePath,
  "goal-system-tree": GoalTree,
  "personal-operating-system": PersonalOs,
  "type-b-day-type-a-life": TypeBTypeA,
  "funding-chain": FundingChain,
  "management-3c": Management3c,
  "velocity-equation": Velocity,
  "versatilist": Versatilist,
  "efficacy-standard": EfficacyStandard,
  "paired-contrasts": PairedContrasts,
  "identity-house": IdentityHouse,
  "humor-bridge": HumorBridge,
  "evidence-strength-ladder": EvidenceLadder,
};
