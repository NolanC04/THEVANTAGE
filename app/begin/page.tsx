import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { currentMember, devAuth } from "@/lib/auth";
import { SignInForm } from "@/components/SignInForm";

export const metadata: Metadata = { title: "Begin", description: "The first module, whole. Email only, no card." };
export const dynamic = "force-dynamic";

const ERRORS: Record<string, string> = {
  link_expired: "That link expired or was already used. Send a fresh one.",
  google_unavailable: "Google sign-in isn't set up yet. Use your email.",
  google_failed: "Google sign-in didn't complete. Try again or use your email.",
};

export default async function Begin({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const next = sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/programs/aapex/1";
  if (await currentMember()) redirect(next);
  return (
    <section className="wrap pt-[150px] pb-[var(--section)] grid md:grid-cols-2 gap-16 items-start">
      <div>
        <p className="eyebrow">Begin · Free</p>
        <h1 className="h2 mt-6">The first module, whole.</h1>
        <p className="body mt-8 max-w-[30rem]">Your email opens it. No card, no trial clock. Your answers start an Almanac that stays yours.</p>
      </div>
      <div>
        {sp.error && ERRORS[sp.error] && <p role="alert" className="error mb-8">{ERRORS[sp.error]}</p>}
        <SignInForm next={next} dev={devAuth()} />
      </div>
    </section>
  );
}
