import { redirect } from "next/navigation";
import { currentProfile, devAuth, homeOf } from "@/lib/airman/auth";
import { Logo, Wordmark } from "@/components/airman/Logo";
import { Footer } from "@/components/airman/Footer";
import { SignIn } from "./SignIn";

export const dynamic = "force-dynamic";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const p = await currentProfile();
  if (p) redirect(homeOf(p.role));
  const { error } = await searchParams;
  return (
    <>
      <main className="page" style={{ paddingTop: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
          <Logo size={72} />
          <Wordmark />
        </div>
        <div className="card" style={{ marginTop: 32 }}>
          {error === "invite" && <p role="alert" className="err" style={{ marginTop: 0 }}>That account isn&apos;t set up yet. Ask your facilitator for an invite code.</p>}
          {error === "link" && <p role="alert" className="err" style={{ marginTop: 0 }}>That sign-in link expired. Send a new one.</p>}
          <SignIn dev={devAuth()} />
        </div>
      </main>
      <Footer />
    </>
  );
}
