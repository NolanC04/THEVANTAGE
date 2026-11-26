import { NextResponse } from "next/server";
import { currentProfile, homeOf } from "@/lib/airman/auth";
import { env } from "@/lib/airman/env";

// After a sign-in link sets the session: create the profile on first sign-in, then go to the right home.
export async function GET() {
  const p = await currentProfile();
  if (!p) return NextResponse.redirect(`${env.siteUrl}/airman?error=invite`);
  return NextResponse.redirect(`${env.siteUrl}${homeOf(p.role)}`);
}
