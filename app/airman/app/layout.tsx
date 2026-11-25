import { requireRole } from "@/lib/airman/auth";
import { AppHeader } from "@/components/airman/AppHeader";
import { LearnerNav } from "@/components/airman/LearnerNav";
import { Footer } from "@/components/airman/Footer";

export const dynamic = "force-dynamic";

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const p = await requireRole(["learner", "assistant", "facilitator", "admin", "comparison"]);
  return (
    <>
      <AppHeader profile={p} view="Learner" />
      {children}
      <Footer />
      <LearnerNav />
    </>
  );
}
