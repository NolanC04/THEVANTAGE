import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { currentMember } from "@/lib/auth";
import { authorizeUrl } from "@/lib/idme";
import { env, ConfigError } from "@/lib/env";

export async function GET() {
  const member = await currentMember();
  if (!member) return NextResponse.redirect(`${env.siteUrl}/begin?next=/military`);
  try {
    const state = randomBytes(16).toString("hex");
    (await cookies()).set("idme_state", state, { httpOnly: true, sameSite: "lax", maxAge: 600, path: "/" });
    return NextResponse.redirect(authorizeUrl(state));
  } catch (e) {
    const why = e instanceof ConfigError ? "not_configured" : "failed";
    return NextResponse.redirect(`${env.siteUrl}/military?error=${why}`);
  }
}
