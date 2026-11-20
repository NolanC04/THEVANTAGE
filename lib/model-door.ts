import "server-only";
import { env, ConfigError } from "./env";

/**
 * The single door for every Claude call in The Vantage.
 * - Sealed lane: anything mentioning "Hurried Heart" never leaves this server.
 * - Logs model and token use.
 * Retries happen once on the client (loud-failure rule), so this makes one attempt per request.
 */
export class SealedLaneError extends Error {
  constructor() {
    super("Sealed lane: this material is never sent to a model.");
  }
}

export async function callClaude(opts: { system: string; messages: { role: "user" | "assistant"; content: string }[]; maxTokens?: number }) {
  const all = [opts.system, ...opts.messages.map((m) => m.content)].join("\n");
  if (/hurried\s+heart/i.test(all)) throw new SealedLaneError();
  if (!env.anthropicKey) throw new ConfigError("ANTHROPIC_API_KEY");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.anthropicKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({ model: env.anthropicModel, max_tokens: opts.maxTokens ?? 800, system: opts.system, messages: opts.messages }),
  });
  if (!res.ok) throw new Error(`Model call failed (${res.status}).`);
  const body = (await res.json()) as { content: { type: string; text?: string }[]; usage?: { input_tokens: number; output_tokens: number }; model: string };
  console.info(JSON.stringify({ at: "model-door", model: body.model, in: body.usage?.input_tokens, out: body.usage?.output_tokens }));
  return body.content.filter((c) => c.type === "text").map((c) => c.text).join("").trim();
}

/** Locked prompts are read from NolanC04/SIGNETOPS. Never copied into this repo. */
const cache = new Map<string, { text: string; at: number }>();
export async function lockedPrompt(file: "cowork-prompts/gene.md") {
  const hit = cache.get(file);
  if (hit && Date.now() - hit.at < 3600_000) return hit.text;
  const res = await fetch(`${env.signetopsRawBase}/${file}`, {
    headers: env.githubToken ? { Authorization: `Bearer ${env.githubToken}` } : {},
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Could not load the locked GENE prompt from SIGNETOPS (${res.status}).`);
  const text = await res.text();
  cache.set(file, { text, at: Date.now() });
  return text;
}
