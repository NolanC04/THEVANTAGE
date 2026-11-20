import Link from "next/link";

export function Footer() {
  return (
    <footer className="wrap flex flex-wrap items-baseline justify-between gap-x-12 gap-y-6 pt-20 pb-[72px] text-[13px] tracking-[.02em]" style={{ color: "var(--color-dim)" }}>
      <Link href="/" className="title text-[24px] no-underline" style={{ color: "var(--color-text)" }}>
        The Vantage
      </Link>
      <p className="m-0 max-w-[46ch]">
        An educational program, not a clinical or counseling service. In crisis, call or text 988; veterans press 1.
      </p>
      <nav aria-label="Footer" className="flex gap-6">
        <Link href="/newsletter" style={{ color: "var(--color-dim)" }}>Newsletter</Link>
        <Link href="/military" style={{ color: "var(--color-dim)" }}>Military and veterans</Link>
      </nav>
      <p className="m-0">© 2026 Langford Signet LLC</p>
    </footer>
  );
}
