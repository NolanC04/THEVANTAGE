"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/programs", label: "Programs" },
  { href: "/library", label: "Library" },
  { href: "/cohort", label: "Cohorts" },
  { href: "/organizations", label: "Organizations" },
];

export function Nav({ signedIn }: { signedIn: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <nav aria-label="Main" className="wrap relative flex items-center justify-between gap-5 py-4 md:py-9">
        <Link href="/" className="title text-[24px] md:text-[28px] tracking-[.02em] no-underline" style={{ color: "var(--color-text)" }}>
          The Vantage
        </Link>
        <button
          type="button"
          className="btn-line md:hidden"
          aria-expanded={open}
          aria-controls="nav-links"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Menu"}
        </button>
        <div
          id="nav-links"
          className={`${open ? "flex" : "hidden"} md:flex absolute md:static left-0 right-0 top-[76px] flex-col md:flex-row md:items-center gap-1 md:gap-10 bg-[var(--color-ground)] md:bg-transparent px-5 pb-6 md:p-0 border-b md:border-0 border-[var(--color-rule)] text-[15px] md:text-[14px] tracking-[.04em]`}
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={path.startsWith(l.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
              className="no-underline py-3 md:py-0"
              style={{ color: path.startsWith(l.href) ? "var(--color-gold)" : "var(--color-text)" }}
            >
              {l.label}
            </Link>
          ))}
          <Link href={signedIn ? "/account" : "/begin"} className="btn-line mt-3 md:mt-0 self-start" onClick={() => setOpen(false)}>
            {signedIn ? "Your library" : "Begin"}
          </Link>
        </div>
      </nav>
    </header>
  );
}
