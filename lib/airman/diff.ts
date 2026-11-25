// Field-level diff for import proposals: what changes, from what, to what.
export interface FieldChange { field: string; before: unknown; after: unknown }
export function diff(before: Record<string, unknown>, after: Record<string, unknown>): FieldChange[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const out: FieldChange[] = [];
  for (const k of [...keys].sort()) {
    if (!(k in after)) continue; // imports never delete a field
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) out.push({ field: k, before: before[k] ?? null, after: after[k] });
  }
  return out;
}
