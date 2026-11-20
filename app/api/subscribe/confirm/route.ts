import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { env } from "@/lib/env";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const hit = token ? await store().update("subscribers", { token, status: "pending" }, { status: "confirmed", confirmed_at: new Date().toISOString() }) : [];
  return NextResponse.redirect(`${env.siteUrl}/newsletter?${hit.length ? "confirmed=1" : "invalid=1"}`);
}
