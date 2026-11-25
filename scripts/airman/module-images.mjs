// Module paintings. Source of truth: docs/airman/design/pilot-app/data.js (each module's `img`).
//   node scripts/airman/module-images.mjs          → writes lib/airman/module-images.json (n → image_url)
//   node scripts/airman/module-images.mjs --check  → fails unless all 24 files exist under public/
import { readFileSync, writeFileSync, existsSync } from "fs";
import vm from "vm";

const ctx = { window: {} };
vm.runInNewContext(readFileSync("docs/airman/design/pilot-app/data.js", "utf8"), ctx);
const map = Object.fromEntries(ctx.window.MODS.map((m) => [m.n, m.img]));
const problems = [];
for (let n = 1; n <= 24; n++) {
  const url = map[n];
  if (!url) problems.push(`M${String(n).padStart(2, "0")}: no img in data.js`);
  else if (!existsSync(`public${url}`)) problems.push(`M${String(n).padStart(2, "0")}: public${url} is missing`);
}
if (process.argv.includes("--check") && existsSync("lib/airman/module-images.json")) {
  const seeded = JSON.parse(readFileSync("lib/airman/module-images.json", "utf8"));
  if (JSON.stringify(seeded) !== JSON.stringify(map)) problems.push("lib/airman/module-images.json is out of date with data.js; run npm run airman:seed-images");
}
if (problems.length) {
  console.error(`Module paintings check failed:\n${problems.join("\n")}`);
  process.exit(1);
}
if (process.argv.includes("--check")) console.log("Module paintings: all 24 present.");
else {
  writeFileSync("lib/airman/module-images.json", JSON.stringify(map, null, 2) + "\n");
  console.log("lib/airman/module-images.json written (24 modules).");
}
