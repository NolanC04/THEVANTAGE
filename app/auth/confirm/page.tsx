import type { Metadata } from "next";
import { FinishSignIn } from "@/components/auth/FinishSignIn";

export const metadata: Metadata = { title: "Signing in", robots: { index: false } };

export default async function Confirm({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const raw = (await searchParams).next ?? "/account";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
  return (
    <main id="main" className="wrap pt-[150px] pb-[var(--section)] max-w-[640px] body">
      <FinishSignIn then={next} retryHref={`/begin?next=${encodeURIComponent(next)}`} />
    </main>
  );
}
