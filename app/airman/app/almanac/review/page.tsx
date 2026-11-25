import { notFound } from "next/navigation";
import { currentProfile } from "@/lib/airman/auth";
import { entryOf, moduleRow } from "@/lib/airman/data";
import { code } from "@/lib/airman/program";
import { Form } from "@/components/airman/Form";

export default async function Review({ searchParams }: { searchParams: Promise<{ n?: string; d?: string }> }) {
  const sp = await searchParams;
  const n = Number(sp.n), d = Number(sp.d);
  const p = (await currentProfile())!;
  const [e, m] = await Promise.all([entryOf(p.id, n), moduleRow(n)]);
  if (!e?.sealed_at || (d !== 7 && d !== 30)) notFound();
  return (
    <main className="page" style={{ display: "grid", gap: 14 }}>
      <p className="k">DAY {d} REVIEW · {code(n)}</p>
      <h1 style={{ fontSize: 22, margin: 0 }}>{m?.content.title ?? code(n)}</h1>
      <div className="card">
        <p className="serif" style={{ fontSize: 18, marginTop: 0 }}>From memory first: what was this module&apos;s one idea, and where did you use it since?</p>
        <Form endpoint="/api/airman/almanac/review" extra={{ n, d }} submit="Save review" fields={[{ name: "answer", label: "Your answer", type: "textarea", rows: 4, required: true }]} />
      </div>
    </main>
  );
}
