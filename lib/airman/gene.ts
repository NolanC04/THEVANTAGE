import "server-only";
import { createHash } from "crypto";
import { env, ConfigError, genePromptRef, genePromptBase } from "./env";
import { parseRead, type GeneRead } from "./gene-rules";

/**
 * The single model door for Airman Apex. GENE's persona and rules come from the locked prompt in
 * NolanC04/SIGNETOPS cowork-prompts/gene.md (fetched, never copied). GENE never receives a name or email:
 * only the module's reflect prompt, the learner's answer and the anon id.
 */
const cache: { text?: string; sha?: string; at?: number } = {};
async function genePrompt() {
  if (cache.text && cache.sha && Date.now() - (cache.at ?? 0) < 3600_000) return { text: cache.text, sha: cache.sha };
  const res = await fetch(`${genePromptBase()}/cowork-prompts/gene.md`, { headers: env.githubToken ? { Authorization: `Bearer ${env.githubToken}` } : {}, cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load the locked GENE prompt (${res.status}).`);
  cache.text = await res.text();
  cache.sha = createHash("sha256").update(cache.text).digest("hex");
  cache.at = Date.now();
  return { text: cache.text, sha: cache.sha };
}

/** What produced a reading. Filed with every read so a score can be reproduced, compared and priced. */
export interface GeneMeta { model: string; prompt_ref: string; prompt_sha256: string; rubric_version: string; input_tokens: number | null; output_tokens: number | null; latency_ms: number }

export async function geneRead(input: { reflectPrompt: string; answer: string; history: { q: string; a: string }[]; last: boolean }): Promise<{ read: GeneRead; meta: GeneMeta }> {
  if (/hurried\s+heart/i.test(input.answer)) throw new Error("Sealed lane: this material is never sent to a model.");
  if (!env.anthropicKey) throw new ConfigError("ANTHROPIC_API_KEY");
  const prompt = await genePrompt();
  const system = `${prompt.text}

---
Context: AAPEX, a resiliency training program (training, not counseling; never use clinical or diagnostic language).
Grade the reasoning behind the written answer, never the answer itself. Never plan actions ("That's SILAS's desk") or build courses ("That's FORGE's line").
${input.last ? "This is the last turn: reply with ONE closing sentence naming what was uncovered, in follow_up_question." : "Ask the one question that exposes the thinking behind the thinking."}
If the writing suggests risk of harm, set flag true.
Respond with JSON only: {"reasoning_grade": 1-5, "thinking_pattern": "short", "follow_up_question": "…", "flag": false}`;
  const messages = [
    { role: "user" as const, content: `Bridge question: ${input.reflectPrompt}\n\nAnswer: ${input.answer}` },
    ...input.history.flatMap((h) => [{ role: "assistant" as const, content: JSON.stringify({ follow_up_question: h.q }) }, { role: "user" as const, content: h.a }]),
  ];
  const started = Date.now();
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": env.anthropicKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: env.anthropicModel, max_tokens: 400, system, messages }),
  });
  if (!res.ok) throw new Error(`GENE call failed (${res.status}).`);
  const body = (await res.json()) as { content: { type: string; text?: string }[]; usage?: { input_tokens: number; output_tokens: number } };
  console.info(JSON.stringify({ at: "model-door", model: env.anthropicModel, in: body.usage?.input_tokens, out: body.usage?.output_tokens }));
  const read = parseRead(body.content.map((c) => c.text ?? "").join(""));
  return {
    read,
    meta: { model: env.anthropicModel, prompt_ref: genePromptRef(), prompt_sha256: prompt.sha, rubric_version: env.geneRubricVersion, input_tokens: body.usage?.input_tokens ?? null, output_tokens: body.usage?.output_tokens ?? null, latency_ms: Date.now() - started },
  };
}
