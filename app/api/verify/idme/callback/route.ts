import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { currentMember } from "@/lib/auth";
import { exchangeAndRead } from "@/lib/idme";
import { store } from "@/lib/store";
import { env } from "@/lib/env";

// Stores only the outcome (type + timestamp). No documents, images or ID numbers.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const jar = await cookies();
  const state = jar.get("idme_state")?.value;
  jar.delete("idme_state");
  const member = await currentMember();
  if (!member) return NextResponse.redirect(`${env.siteUrl}/begin?next=/military`);
  if (!state || url.searchParams.get("state") !== state || !url.searchParams.get("code"))
    return NextResponse.redirect(`${env.siteUrl}/military?error=failed`);
  try {
    let result;
    try {
      result = await exchangeAndRead(url.searchParams.get("code")!);
    } catch {
      result = await exchangeAndRead(url.searchParams.get("code")!);
    }
    if (!result) return NextResponse.redirect(`${env.siteUrl}/military?error=not_verified`);
    const spouse = result === "military_spouse";
    await store().update("members", { id: member.id }, {
      verified_military: !spouse,
      verification_type: result,
      verified_at: new Date().toISOString(),
      spouse_discount: spouse,
      ...(spouse || member.tier === "library" || member.tier === "cohort" ? {} : { tier: "military" }),
    });
    return NextResponse.redirect(`${env.siteUrl}/military?verified=${result}`);
  } catch {
    return NextResponse.redirect(`${env.siteUrl}/military?error=failed`);
  }
}
