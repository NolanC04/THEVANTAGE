import { CRISIS } from "@/lib/airman/privacy";
export function Footer() {
  return (
    <footer className="help" style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px 120px", lineHeight: 1.6 }}>
      <p style={{ margin: 0, color: "var(--color-ink)" }}><strong>{CRISIS}</strong></p>
      <p style={{ margin: "6px 0 0" }}>Training, not counseling. Unofficial program resource. Not an activity of the U.S. Air Force or DoD; no federal endorsement implied.</p>
    </footer>
  );
}
