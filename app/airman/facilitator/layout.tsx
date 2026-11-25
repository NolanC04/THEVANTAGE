import Link from "next/link";
import { requireRole } from "@/lib/airman/auth";
import { AppHeader } from "@/components/airman/AppHeader";
import { Footer } from "@/components/airman/Footer";

export const dynamic = "force-dynamic";
const NAV = [["/airman/facilitator", "Overview"], ["/airman/facilitator/class", "Classes & room"], ["/airman/facilitator/run", "Run sheets"], ["/airman/facilitator/outcomes", "Outcomes"], ["/airman/facilitator/people", "People"]];

export default async function FacilitatorLayout({ children }: { children: React.ReactNode }) {
  const p = await requireRole(["facilitator", "admin"]);
  return (
    <>
      <AppHeader profile={p} view="Facilitator" />
      <nav aria-label="Facilitator" style={{ borderBottom: "1px solid var(--color-border)", overflowX: "auto" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", gap: 4 }}>
          {NAV.map(([h, l]) => <Link key={h} href={h} style={{ padding: "12px 10px", whiteSpace: "nowrap", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{l}</Link>)}
        </div>
      </nav>
      {children}
      <Footer />
    </>
  );
}
