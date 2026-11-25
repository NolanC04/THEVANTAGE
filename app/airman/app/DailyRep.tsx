"use client";
import { useState } from "react";
import { postJSON } from "@/lib/airman/fetchWithRetry";

export function DailyRep({ prompt, done }: { prompt: string | null; done: boolean }) {
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">(done ? "done" : "idle");
  const [err, setErr] = useState("");
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between" }}><span className="k">TODAY · DAILY REP</span><span className="help">2 min</span></div>
      {state === "done" ? (
        <p style={{ margin: "8px 0 0" }}>Logged for today. A new one shows up tomorrow.</p>
      ) : (
        <>
          <p className="serif" style={{ fontSize: 17, margin: "8px 0" }}>{prompt ?? <span className="gap">[NOLAN: daily rep prompt for this session&apos;s focus skill]</span>}</p>
          <textarea className="in" rows={2} placeholder="A line or two is enough" value={text} onChange={(e) => setText(e.target.value)} />
          {state === "error" && <p role="alert" className="err">{err}</p>}
          <button className="btn-ghost" style={{ marginTop: 8 }} disabled={!text.trim() || state === "busy" || !prompt} onClick={async () => {
            setState("busy");
            try { await postJSON("/api/airman/daily-rep", { text }); setState("done"); } catch (e) { setErr((e as Error).message); setState("error"); }
          }}>{state === "error" ? "Retry" : "Save to my Almanac"}</button>
        </>
      )}
    </div>
  );
}
