import "server-only";
import { store } from "@/lib/store";
import { store as airmanStore } from "@/lib/airman/store";
import type { SavedEntry } from "@/components/frameworks/FrameworkCard";

export type FrameworkEntry = { framework_id: string; module_number: number | null; data: Record<string, unknown>; summary: string; saved_at: string };

const byId = (rows: FrameworkEntry[]) => Object.fromEntries(rows.map((r) => [r.framework_id, { data: r.data, saved_at: r.saved_at } satisfies SavedEntry]));

/** A Vantage member's own saved frameworks. Never call with anyone else's id. */
export const memberFrameworkEntries = (memberId: string) => store().list<FrameworkEntry>("framework_entries", { member_id: memberId }, { column: "saved_at", ascending: false });
export const memberSaved = async (memberId: string) => byId(await memberFrameworkEntries(memberId));

/** An Airman's own saved frameworks. Never call with anyone else's id. */
export const airmanFrameworkEntries = (userId: string) => airmanStore().list<FrameworkEntry>("framework_entries", { user_id: userId }, { column: "saved_at", ascending: false });
export const airmanSaved = async (userId: string) => byId(await airmanFrameworkEntries(userId));
