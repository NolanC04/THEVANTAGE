import { test } from "node:test";
import assert from "node:assert/strict";
import { checkPublic } from "../lib/rules.ts";
import { sign, verifySignature, packageSchema, targetFor } from "../lib/studiolo-package.ts";
import { moduleGate } from "../lib/access.ts";

test("clinical words are flagged; the Great Depression is not", () => {
  const f = checkPublic({ body: "This is not therapy. The Great Depression shaped them." }, { aapexAllowed: true, authorOfRecord: "Nolan Langford" });
  assert.deepEqual(f.map((x) => x.match), ["therapy"]);
});

test("AAPEX outside allowed places is flagged", () => {
  const f = checkPublic({ title: "Why AAPEX works" }, { aapexAllowed: false, authorOfRecord: "Nolan Langford" });
  assert.equal(f[0].rule, "aapex_name");
});

test("missing author of record and unfilled gaps are flagged", () => {
  const f = checkPublic({ body: "Story: [NOLAN: the night shift story]" }, { aapexAllowed: true, authorOfRecord: "" });
  assert.deepEqual(f.map((x) => x.rule).sort(), ["author_of_record", "placeholder"]);
});

test("rank and partisan words are flagged, common words are not", () => {
  const f = checkPublic({ body: "A major step in general. As a Senior Airman, vote Republican." }, { aapexAllowed: true, authorOfRecord: "N" });
  assert.deepEqual(f.map((x) => x.rule).sort(), ["military_branding", "partisan_language"]);
});

test("signature: valid passes, tampered and stale fail", () => {
  const body = JSON.stringify({ a: 1 });
  const ts = String(Math.floor(Date.now() / 1000));
  const sig = sign("s3cret", ts, body);
  assert.equal(verifySignature("s3cret", ts, sig, body), true);
  assert.equal(verifySignature("s3cret", ts, sig, body.replace("1", "2")), false);
  assert.equal(verifySignature("other", ts, sig, body), false);
  assert.equal(verifySignature("s3cret", String(Number(ts) - 3600), sign("s3cret", String(Number(ts) - 3600), body), body), false);
});

const pkg = {
  schema: "studiolo.vantage/1", package_id: "pc-1", version: 1,
  piece: { id: "p1", title: "Gratitude", program: "AAPEX", module_number: 1 },
  format: "self-paced lesson", body_md: "Hello", assets: [], author_of_record: "Nolan Langford", approved_at: new Date().toISOString(),
};
test("package schema and target mapping", () => {
  const p = packageSchema.parse(pkg);
  assert.equal(targetFor(p).table, "modules");
  assert.equal(targetFor(packageSchema.parse({ ...pkg, format: "newsletter" })).kind, "newsletter");
  assert.equal(packageSchema.safeParse({ ...pkg, schema: "studiolo.apex/1" }).success, false);
});

const program = { status: "published", military_free: true } as never;
const mod = (n: number) => ({ number: n, status: "published" }) as never;
const member = (o: object) => ({ tier: "free", verified_military: false, verification_type: null, subscription_status: null, ...o }) as never;
test("gate: module 1 needs only email; paid and verified tiers unlock the rest", () => {
  assert.deepEqual(moduleGate(null, program, mod(1)), { open: false, reason: "sign_in" });
  assert.equal(moduleGate(member({}), program, mod(1)).open, true);
  assert.equal(moduleGate(member({}), program, mod(2)).open, false);
  assert.equal(moduleGate(member({ tier: "library", subscription_status: "active" }), program, mod(2)).open, true);
  assert.equal(moduleGate(member({ tier: "library", subscription_status: "canceled" }), program, mod(2)).open, false);
  assert.equal(moduleGate(member({ verified_military: true, verification_type: "veteran" }), program, mod(24)).open, true);
  assert.equal(moduleGate(member({ verified_military: false, verification_type: "military_spouse" }), program, mod(2)).open, false);
});
