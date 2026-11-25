"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/airman/app", label: "Modules", d: "M4 5h7v7H4zM13 5h7v7h-7zM4 14h7v7H4zM13 14h7v7h-7z" },
  { href: "/airman/app/community", label: "Community", d: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" },
  { href: "/airman/app/checkins", label: "Check-ins", d: "M5 12l4 4 10-10" },
  { href: "/airman/app/almanac", label: "Almanac", d: "M5 4h10a4 4 0 014 4v12H9a4 4 0 01-4-4z" },
];

export function LearnerNav() {
  const path = usePathname();
  return (
    <nav aria-label="Learner" style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "var(--color-card)", borderTop: "1px solid var(--color-border)", paddingBottom: "env(safe-area-inset-bottom)", zIndex: 20 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
        {TABS.map((t) => {
          const on = t.href === "/airman/app" ? path === "/airman/app" || path.startsWith("/airman/app/m/") : path.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined} style={{ minHeight: 58, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, fontSize: 11, fontWeight: 600, textDecoration: "none", color: on ? "var(--color-primary)" : "var(--color-muted)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d={t.d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
