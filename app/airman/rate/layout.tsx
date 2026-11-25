import { requireRole } from "@/lib/airman/auth";
import { AppHeader } from "@/components/airman/AppHeader";
import { Footer } from "@/components/airman/Footer";
export const dynamic = "force-dynamic";
export default async function RateLayout({ children }: { children: React.ReactNode }) {
  const p = await requireRole(["rater", "admin"]);
  return (<><AppHeader profile={p} view="Rater" />{children}<Footer /></>);
}
