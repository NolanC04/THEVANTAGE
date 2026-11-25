// Sends a signed studiolo.vantage/1 sample to a running Vantage. Usage:
//   VANTAGE_IMPORT_SECRET=... node scripts/send-sample-package.mjs [url] [--tamper]
import { createHmac } from "crypto";

const url = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:3000/api/import/studiolo";
const tamper = process.argv.includes("--tamper");
const secret = process.env.VANTAGE_IMPORT_SECRET;
if (!secret) throw new Error("Set VANTAGE_IMPORT_SECRET");

const pkg = {
  schema: "studiolo.vantage/1",
  package_id: "sample-gratitude",
  version: Number(process.env.VERSION ?? 1),
  piece: { id: "piece-sample", title: "Gratitude", category: "P", program: "AAPEX", module_number: 1, one_line: "Sample release for import testing." },
  format: "self-paced lesson",
  body_md: "## Verse\n\nSample body sent by scripts/send-sample-package.mjs to test the import path.\n\n> One repeated principle.",
  assets: [],
  author_of_record: "Nolan Langford",
  approved_at: new Date().toISOString(),
};
const body = JSON.stringify(pkg);
const ts = String(Math.floor(Date.now() / 1000));
const sig = "sha256=" + createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Studiolo-Timestamp": ts, "X-Studiolo-Signature": sig },
  body: tamper ? body.replace("Gratitude", "Gratitudes") : body,
});
console.log(res.status, await res.text());
