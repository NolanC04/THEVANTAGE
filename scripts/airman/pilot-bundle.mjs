// Builds an import bundle from the approved pilot app content (docs/airman/design/pilot-app/data.js).
// The bundle goes through Admin → Import content, which shows a diff and needs approval before anything saves.
// Mapping notes: the Bridge question (reflect_prompt) is proposed as the module's first field-work prompt;
// change it in the bundle or after import if a different prompt should carry the Bridge.
import { readFileSync, writeFileSync } from "fs";
import vm from "vm";

const ctx = { window: {} };
vm.runInNewContext(readFileSync("docs/airman/design/pilot-app/data.js", "utf8"), ctx);
const mods = ctx.window.MODS.map((m) => ({
  n: m.n, title: m.title, arc: m.arc, dlo: m.dlo, method: m.method, materials: m.materials, fieldwork: m.fieldwork,
  prompts: m.prompts, reflect_prompt: m.prompts?.[0], debrief: m.debrief, summary: m.summary, science: m.science,
  selfdebrief: m.selfdebrief, quote: m.quote, scene: m.scene, reads: m.reads,
  closing_draft: m.closing_draft, // compendium DRAFT, stored for Nolan only, never shown to learners
}));
writeFileSync("pilot-bundle.json", JSON.stringify({ source: "pilot app data.js (19 Nov 2026)", modules: mods }, null, 2));
console.log(`pilot-bundle.json: ${mods.length} modules`);
