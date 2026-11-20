import { NextResponse } from "next/server";
import { supabaseSession } from "@/lib/supabase-server";
import { env } from "@/lib/env";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const raw = url.searchParams.get("next") ?? "/account";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
  if (code) {
    const { error } = await (await supabaseSession()).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${env.siteUrl}${next}`);
  }
  return NextResponse.redirect(`${env.siteUrl}/begin?error=link_expired`);
}
