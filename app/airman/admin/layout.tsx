import { requireRole } from "@/lib/airman/auth";
import { AppHeader } from "@/components/airman/AppHeader";
import { Footer } from "@/components/airman/Footer";
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const p = await requireRole(["admin"]);
  return (<><AppHeader profile={p} view="Admin" />{children}<Footer /></>);
}
