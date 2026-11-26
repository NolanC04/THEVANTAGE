import { devAuth, devSignIn } from "@/lib/auth";
import { sendMagicLink } from "@/lib/supabase-magic-link";
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
    await sendMagicLink(b.email.trim(), `${env.siteUrl}/auth/confirm?next=${encodeURIComponent(next)}`);
    return ok({ sent: true });
  } catch (e) {
    return fail(e);
  }
}
