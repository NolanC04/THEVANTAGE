import "server-only";
import { store } from "./store";
import { diff } from "./diff";
import { mentionsVantage } from "./brand";
import type { ModuleContent, ModuleRow } from "./program";

const ALLOWED: (keyof ModuleContent)[] = ["title", "arc", "dlo", "method", "materials", "focus_skill", "unit_outcome", "daily_rep", "facilitator_opener", "hook", "learn_md", "fieldwork", "prompts", "reflect_prompt", "debrief", "summary", "science", "selfdebrief", "quote", "scene", "reads", "quick_check", "roleplay", "closing_draft"];

export class ImportRejected extends Error {
  name = "ImportRejected";
}

export function cleanContent(raw: Record<string, unknown>): ModuleContent {
  return Object.fromEntries(ALLOWED.filter((k) => raw[k] != null).map((k) => [k, raw[k]])) as ModuleContent;
}

/** Every import becomes a proposal with a diff; nothing is saved until an admin approves it. */
export async function propose(source: string, items: { n: number; content: Record<string, unknown> }[], by: string) {
  const db = store();
  const flagged = items.filter((it) => mentionsVantage(cleanContent(it.content))).map((it) => `M${String(it.n).padStart(2, "0")}`);
  if (flagged.length) throw new ImportRejected(`AAPEX materials never mention The Vantage. Remove it from ${flagged.join(", ")} and import again.`);
  const out = [];
  for (const it of items) {
    const m = await db.get<ModuleRow>("modules", { number: it.n });
    if (!m) continue;
    const next = { ...m.content, ...cleanContent(it.content) };
    const changes = diff(m.content as Record<string, unknown>, next as Record<string, unknown>);
    if (!changes.length) continue;
    out.push(await db.insert<{ id: string }>("import_proposals", { module_number: it.n, source, changes, proposed: next, base_version: m.version, status: "pending", proposed_by: by, at: new Date().toISOString() }));
  }
  return out.length;
}
