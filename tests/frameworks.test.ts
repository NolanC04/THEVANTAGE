import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkPublic } from "../lib/rules.ts";
import { FRAMEWORKS, frameworksForModule, visibleFrameworks } from "../lib/frameworks/registry.ts";

const tools = readFileSync(new URL("../components/frameworks/tools.tsx", import.meta.url), "utf8");
const live = FRAMEWORKS.filter((f) => f.status === "live");

test("every live framework passes the public rules (no AAPEX name, clinical, partisan or military-rank language)", () => {
  for (const f of live) {
    const found = checkPublic({ title: f.title, type: f.type, concept: f.concept }, { aapexAllowed: false, authorOfRecord: "Nolan Langford" });
    assert.deepEqual(found, [], `${f.id}: ${found.map((x) => x.match).join(", ")}`);
  }
});

test("every live framework has a working component", () => {
  for (const f of live) assert.ok(tools.includes(`"${f.id}":`), `${f.id} has no entry in TOOLS`);
});

test("held frameworks stay out of learner views and module shelves", () => {
  const held = FRAMEWORKS.filter((f) => f.status === "held").map((f) => f.id);
  assert.ok(held.includes("hcos-radar") && held.includes("versatilist"));
  assert.ok(visibleFrameworks(false).every((f) => f.status === "live"));
  for (let n = 1; n <= 24; n++) assert.ok(frameworksForModule(n, false).every((f) => f.status === "live"));
  assert.ok(frameworksForModule(19, true).some((f) => f.id === "versatilist"));
});

test("ids are unique and placements point at real modules", () => {
  assert.equal(new Set(FRAMEWORKS.map((f) => f.id)).size, FRAMEWORKS.length);
  for (const f of FRAMEWORKS) for (const n of f.aapex) assert.ok(Number.isInteger(n) && n >= 1 && n <= 24, `${f.id} → ${n}`);
});

test("module 02 carries the focus funnel and the goal tree", () => {
  assert.deepEqual(frameworksForModule(2, false).map((f) => f.id), ["focus-funnel", "goal-system-tree"]);
});

test("the tool copy itself passes the public rules", () => {
  // [NOLAN: …] gaps are intentional here; every other rule must pass.
  const found = checkPublic({ tools }, { aapexAllowed: false, authorOfRecord: "Nolan Langford" }).filter((x) => x.rule !== "placeholder");
  assert.deepEqual(found, [], found.map((x) => x.match).join(", "));
});

import { cleanSave, MAX_SAVE_BYTES } from "../lib/frameworks/save.ts";

test("saves: only real, open frameworks; module kept only where the framework is placed", () => {
  assert.equal(cleanSave({ framework_id: "nope", data: {} }, false).ok, false);
  assert.equal(cleanSave({ framework_id: "hcos-radar", data: { s1: [5] } }, false).ok, false);
  assert.equal(cleanSave({ framework_id: "hcos-radar", data: { s1: [5] } }, true).ok, true);
  assert.equal(cleanSave({ framework_id: "focus-funnel", data: [] }, false).ok, false);
  const good = cleanSave({ framework_id: "focus-funnel", module_number: 2, data: { s1: ["a"] }, summary: " x " }, false);
  assert.ok(good.ok && good.value.module_number === 2 && good.value.summary === "x");
  const moved = cleanSave({ framework_id: "focus-funnel", module_number: 7, data: { s1: ["a"] } }, false);
  assert.ok(moved.ok && moved.value.module_number === null);
  const big = cleanSave({ framework_id: "focus-funnel", data: { s1: "x".repeat(MAX_SAVE_BYTES) } }, false);
  assert.ok(!big.ok && big.status === 413);
});

test("the migration keeps saved frameworks owner-only on both sides", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20261125100000_framework_entries.sql", import.meta.url), "utf8");
  const policies = sql.match(/create policy[^;]+;/g) ?? [];
  assert.equal(policies.length, 2);
  assert.ok(policies.every((p) => /for all/.test(p) && /auth\.uid\(\)/.test(p) && !/is_staff|facilitator|admin/.test(p)));
});
