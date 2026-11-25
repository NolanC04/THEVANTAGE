import { NextResponse } from "next/server";
import { signOut } from "@/lib/airman/auth";
import { env } from "@/lib/airman/env";
export async function POST() {
  await signOut();
  return NextResponse.redirect(`${env.siteUrl}/`, 303);
}
