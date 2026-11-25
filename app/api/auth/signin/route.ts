import { devAuth, devSignIn } from "@/lib/auth";
import { supabaseSession } from "@/lib/supabase-server";
import { env } from "@/lib/env";
import { ok, bad, fail, isEmail, str } from "@/lib/api";

const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "/account");

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (!isEmail(b.email)) return bad("That email doesn't look complete.");
    const next = safeNext(str(b.next, 300));
    if (devAuth()) {
      await devSignIn(b.email);
      return ok({ dev: true, next });
    }
    const { error } = await (await supabaseSession()).auth.signInWithOtp({
      email: b.email.trim(),
      options: { emailRedirectTo: `${env.siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) throw new Error(error.message);
    return ok({ sent: true });
  } catch (e) {
    return fail(e);
  }
}
