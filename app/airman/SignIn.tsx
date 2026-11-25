"use client";
import { useState } from "react";
import { postJSON } from "@/lib/airman/fetchWithRetry";

export function SignIn({ dev }: { dev: boolean }) {
  const [returning, setReturning] = useState(false);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  const ready = returning ? Boolean(email) : Boolean(code && email && consent);
  async function go() {
    setState("busy");
    try {
      const r = await postJSON<{ redirect?: string }>("/api/airman/auth/signin", { code: returning ? "" : code, email, consent, returning });
      if (r.redirect) window.location.href = r.redirect;
      else setState("sent");
    } catch (e) {
      setMsg((e as Error).message);
      setState("error");
    }
  }
  if (state === "sent") return <p role="status" style={{ margin: 0 }}>Check your email for a one-tap sign-in link.</p>;
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); if (ready) go(); }} style={{ display: "grid", gap: 14 }}>
      {!returning && (
        <div>
          <label className="label" htmlFor="code">Invite code</label>
          <input id="code" className="in" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off" style={{ letterSpacing: ".2em", fontWeight: 600 }} />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" className="in" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <p className="help" style={{ margin: "6px 0 0" }}>A personal address works best; some .mil inboxes block outside links.</p>
      </div>
      {!returning && (
        <label style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.45 }}>
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ width: 22, height: 22, accentColor: "var(--color-primary)", flex: "none" }} />
          <span>I understand my Almanac is mine to export or delete, GENE never sees my name or email, and quick-check answers may show on the room screen with names.</span>
        </label>
      )}
      {state === "error" && <p role="alert" className="err" style={{ margin: 0 }}>{msg}</p>}
      <button className="btn" type="submit" disabled={!ready || state === "busy"}>{state === "busy" ? "…" : state === "error" ? "Retry" : "Enter"}</button>
      <button type="button" className="help" onClick={() => setReturning((r) => !r)} style={{ background: "none", border: 0, textDecoration: "underline", cursor: "pointer", minHeight: 44 }}>
        {returning ? "First time? Use an invite code" : "Already joined? Get a one-tap email link"}
      </button>
      {dev && <p className="help" style={{ margin: 0 }}>Development preview: Supabase isn&apos;t configured, so Enter signs you in directly.</p>}
    </form>
  );
}
