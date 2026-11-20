import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";
import { env } from "@/lib/env";

export async function POST() {
  await signOut();
  return NextResponse.redirect(`${env.siteUrl}/`, 303);
}
