import { NextResponse } from "next/server";
import { supabaseSession } from "@/lib/supabase-server";
import { env, supabaseConfigured } from "@/lib/env";

export async function GET(req: Request) {
  const next = new URL(req.url).searchParams.get("next") ?? "/account";
  if (!supabaseConfigured()) return NextResponse.redirect(`${env.siteUrl}/begin?error=google_unavailable`);
  const { data, error } = await (await supabaseSession()).auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${env.siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) return NextResponse.redirect(`${env.siteUrl}/begin?error=google_failed`);
  return NextResponse.redirect(data.url);
}
