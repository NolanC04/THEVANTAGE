import "server-only";
import { NextResponse } from "next/server";
import { ConfigError } from "./env";
import { SealedLaneError } from "./model-door";

export const ok = (data: unknown = { ok: true }, status = 200) => NextResponse.json(data, { status });
export const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export function fail(e: unknown) {
  if (e instanceof ConfigError) return bad(e.message, 503);
  if (e instanceof SealedLaneError) return bad(e.message, 422);
  console.error(e);
  return bad("Something on our side failed. Try again.", 500);
}

export const isEmail = (s: unknown): s is string => typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
export const str = (s: unknown, max = 4000) => (typeof s === "string" ? s.trim().slice(0, max) : "");
