import { currentMember } from "@/lib/auth";
import { programBySlug, moduleOf } from "@/lib/content";
import { moduleGate } from "@/lib/access";
import { callClaude, lockedPrompt } from "@/lib/model-door";
import { store } from "@/lib/store";
import { ok, bad, fail, str } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const answer = str(body.answer, 4000);
    if (!answer) return bad("Write an answer first. One honest sentence is enough.");
    const member = await currentMember();
    if (!member) return bad("Sign in first.", 401);
    const program = await programBySlug(str(body.programSlug, 80));
    const mod = program ? await moduleOf(program.id, Number(body.moduleNumber)) : null;
    if (!program || !mod) return bad("Module not found.", 404);
    if (!moduleGate(member, program, mod).open) return bad("This module is locked for your membership.", 403);
    if (!mod.gene_question) return bad("This module's GENE question hasn't been released yet.", 409);

    const prompt = await lockedPrompt("cowork-prompts/gene.md");
    const system = `${prompt}\n\n---\nContext (The Vantage member library): ${program.word}, Module ${mod.number}, "${mod.title}". The question you asked: "${mod.gene_question}". Reply in at most three sentences. Questions first; one question that exposes the thinking behind the answer.`;
    const reply = await callClaude({ system, messages: [{ role: "user", content: answer }], maxTokens: 400 });
    if (!reply) throw new Error("Empty reply from GENE.");

    await store().upsert(
      "almanac_entries",
      {
        member_id: member.id,
        program_slug: program.slug,
        module_number: mod.number,
        question: mod.gene_question,
        answer,
        gene_reply: reply,
        sealed_at: new Date().toISOString(),
      },
      "member_id,program_slug,module_number",
    );
    return ok({ reply });
  } catch (e) {
    return fail(e);
  }
}
