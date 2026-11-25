"use client";
import { useState } from "react";
import { postJSON } from "@/lib/client-fetch";

export function DomeEditor({ given, chosen }: { given: string[]; chosen: string[] }) {
  const [g, setG] = useState(given.join("\n"));
  const [c, setC] = useState(chosen.join("\n"));
  const [state, setState] = useState<"idle" | "busy" | "saved" | "failed">("idle");
  const [err, setErr] = useState("");
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-10 mt-10">
        {[
          ["Given", "dome-given", g, setG, "What was given to you. One per line."],
          ["Chosen", "dome-chosen", c, setC, "What you chose to build. One per line."],
        ].map(([label, id, v, set, hint]) => (
          <div key={id as string} className="field">
            <label htmlFor={id as string} className="eyebrow" style={{ color: "var(--color-gold)" }}>{label as string}</label>
            <textarea id={id as string} rows={5} value={v as string} placeholder={hint as string} onChange={(e) => (set as (s: string) => void)(e.target.value)} style={{ fontFamily: "var(--font-display)", fontSize: 22 }} />
          </div>
        ))}
      </div>
      {state === "failed" && <p role="alert" className="error">Your Dome didn&apos;t save: {err}</p>}
      <button
        type="button"
        className="btn-line mt-8"
        disabled={state === "busy"}
        onClick={async () => {
          setState("busy");
          try {
            await postJSON("/api/dome", { given: g, chosen: c });
            setState("saved");
          } catch (e) {
            setErr((e as Error).message);
            setState("failed");
          }
        }}
      >
        {state === "busy" ? "Saving…" : state === "failed" ? "Retry" : state === "saved" ? "Saved" : "Save the Dome"}
      </button>
    </div>
  );
}
