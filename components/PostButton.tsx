"use client";
import { useState } from "react";
import { postJSON } from "@/lib/client-fetch";

/** Posts, then follows a returned url. Loud failure with Retry. */
export function PostButton({ endpoint, body, label, variant = "gold" }: { endpoint: string; body?: unknown; label: string; variant?: "gold" | "line" }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        className={variant === "gold" ? "btn-gold" : "btn-line"}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr(null);
          try {
            const r = await postJSON<{ url?: string }>(endpoint, body ?? {});
            if (r.url) window.location.href = r.url;
            else window.location.reload();
          } catch (e) {
            setErr((e as Error).message);
            setBusy(false);
          }
        }}
      >
        {busy ? "One moment…" : err ? "Retry" : label}
      </button>
      {err && <p role="alert" className="error">{err}</p>}
    </div>
  );
}
