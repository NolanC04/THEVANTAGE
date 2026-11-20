"use client";
import { useState } from "react";
import { postJSON } from "@/lib/client-fetch";

// GENE's behavior follows the locked prompt in NolanC04/SIGNETOPS cowork-prompts/gene.md (fetched server-side, never copied).
export function GeneAsks({
  programSlug,
  moduleNumber,
  question,
  sealed,
}: {
  programSlug: string;
  moduleNumber: number;
  question: string | null;
  sealed: { answer: string; reply: string } | null;
}) {
  const [answer, setAnswer] = useState("");
  const [done, setDone] = useState(sealed);
  const [err, setErr] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!answer.trim()) {
      setErr("Write an answer first. One honest sentence is enough.");
      setFailed(false);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const r = await postJSON<{ reply: string }>("/api/gene", { programSlug, moduleNumber, answer });
      setDone({ answer, reply: r.reply });
    } catch (e) {
      setFailed(true);
      setErr(`GENE didn't answer: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="eyebrow">GENE asks</h2>
      <p className="title font-light text-[clamp(28px,3.4vw,44px)] leading-[1.2] mt-7 mb-0">
        {question ?? <span className="bracket">[NOLAN: GENE question for module {moduleNumber}]</span>}
      </p>
      {done ? (
        <div className="mt-14 border-l border-[var(--color-gold)] pl-8">
          <p className="eyebrow">GENE</p>
          <p className="title text-[28px] leading-[1.4] mt-4 mb-0">{done.reply}</p>
          <p className="mt-5 mb-0 text-[13px]" style={{ color: "var(--color-dim)" }}>Sealed into your Almanac</p>
        </div>
      ) : (
        <div className="field mt-14">
          <label htmlFor="reply">Your answer</label>
          <textarea
            id="reply"
            rows={4}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{ fontFamily: "var(--font-display)", fontSize: 24 }}
          />
          {err && <p role="alert" className="error">{err}</p>}
          <button type="button" className="btn-gold mt-8" disabled={busy || !question} onClick={send}>
            {busy ? "GENE is reading…" : failed ? "Retry" : "Send to GENE"}
          </button>
        </div>
      )}
    </div>
  );
}
