"use client";
import { useState } from "react";
import { postJSON } from "@/lib/client-fetch";

export function SignInForm({ next, dev }: { next: string; dev: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function go() {
    setState("busy");
    try {
      const r = await postJSON<{ dev?: boolean; next?: string }>("/api/auth/signin", { email, next });
      if (r.dev) window.location.href = r.next ?? next;
      else setState("sent");
    } catch (e) {
      setState("error");
      setMsg((e as Error).message);
    }
  }
  if (state === "sent")
    return <p role="status" className="title text-[28px] leading-snug">Check your email. The link opens your library.</p>;
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); go(); }} className="grid gap-8">
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {state === "error" && <p role="alert" className="error">{msg}</p>}
      <div className="flex flex-wrap items-center gap-6">
        <button className="btn-gold" type="submit" disabled={state === "busy"}>{state === "error" ? "Retry" : "Send my link"}</button>
        {!dev && <a className="btn-line" href={`/api/auth/google?next=${encodeURIComponent(next)}`}>Continue with Google</a>}
      </div>
      {dev && <p className="text-[13px] m-0" style={{ color: "var(--color-dim)" }}>Development preview: Supabase isn&apos;t configured, so this signs you in without an email.</p>}
    </form>
  );
}
