// Checks a framework save before it reaches the Almanac. Pure, so tests can run it.
import { frameworkById } from "./registry.ts";

export const MAX_SAVE_BYTES = 20_000;

export type CleanSave = { framework_id: string; module_number: number | null; data: Record<string, unknown>; summary: string };

export function cleanSave(body: unknown, admin: boolean): { ok: true; value: CleanSave } | { ok: false; error: string; status: number } {
  const b = (body ?? {}) as Record<string, unknown>;
  const fw = typeof b.framework_id === "string" ? frameworkById(b.framework_id) : null;
  if (!fw || (fw.status === "held" && !admin)) return { ok: false, error: "That framework isn't open.", status: 404 };
  const data = b.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, error: "Nothing to save yet.", status: 400 };
  if (JSON.stringify(data).length > MAX_SAVE_BYTES) return { ok: false, error: "That's more than one framework can hold. Trim a few answers and save again.", status: 413 };
  const n = b.module_number;
  const module_number = typeof n === "number" && fw.aapex.includes(n) ? n : null;
  const summary = typeof b.summary === "string" ? b.summary.trim().slice(0, 1000) : "";
  return { ok: true, value: { framework_id: fw.id, module_number, data: data as Record<string, unknown>, summary } };
}
