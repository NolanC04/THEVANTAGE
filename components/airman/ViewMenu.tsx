"use client";
import { useState } from "react";

/** Shown only to people with facilitator or admin access. Learners never see it. */
export function ViewMenu({ current, isAdmin }: { current: "Learner" | "Facilitator" | "Admin"; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const items = [["Facilitator", "/airman/facilitator"], ["Learner", "/airman/app"], ...(isAdmin ? [["Admin", "/airman/admin"]] : [])];
  return (
    <div style={{ position: "relative" }}>
      <button className="pill" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((o) => !o)} style={{ border: 0, cursor: "pointer", minHeight: 32 }}>
        View: {current}
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
      </button>
      {open && (
        <div className="card" style={{ position: "absolute", right: 0, top: 38, minWidth: 200, padding: 6, zIndex: 30 }}>
          {items.map(([l, h]) => (
            <a key={h} href={h} aria-current={l === current ? "page" : undefined} style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "var(--color-ink)", fontSize: 14 }}>
              {l}{l === current && <span aria-hidden="true">✓</span>}
            </a>
          ))}
          <p className="help" style={{ margin: "6px 12px 8px" }}>Shown only to people with facilitator or admin access.</p>
        </div>
      )}
    </div>
  );
}
