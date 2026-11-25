import { currentProfile } from "@/lib/airman/auth";
import { store } from "@/lib/airman/store";
import { MEASURES, WAVES } from "@/lib/airman/measures";
import { AGREEMENT, AGREEMENT_VERSION, AUDIO_CONSENT } from "@/lib/airman/agreement";
import { Form } from "@/components/airman/Form";
import { Checkin } from "./Checkin";

export default async function Checkins({ searchParams }: { searchParams: Promise<{ wave?: string }> }) {
  const p = (await currentProfile())!;
  const [agreement, done] = await Promise.all([
    store().get<{ version: string }>("agreements", { user_id: p.id, version: AGREEMENT_VERSION }),
    store().list<{ wave: string; at: string }>("checkins", { user_id: p.id }),
  ]);
  const group = p.role === "comparison" ? "Comparison group" : "Cohort member";
  if (!agreement)
    return (
      <main className="page" style={{ display: "grid", gap: 14 }}>
        <h1 style={{ fontSize: 22, margin: "8px 0 0" }}>Before you begin</h1>
        <div className="card" style={{ display: "grid", gap: 8 }}>
          <span className="k">AGREEMENT · {group.toUpperCase()}</span>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>{AGREEMENT.map((a) => <li key={a}>{a}</li>)}</ul>
          <Form endpoint="/api/airman/agreement" reload submit="Sign" fields={[
            { name: "audio", label: AUDIO_CONSENT, type: "checkbox" },
            { name: "agree", label: "I have read and agree to the above.", type: "checkbox", required: true },
            { name: "signature", label: "Type your full name to sign", required: true },
          ]} />
        </div>
      </main>
    );
  const sp = await searchParams;
  const wave = WAVES.find((w) => w[0] === sp.wave);
  if (wave) return <main className="page"><Checkin wave={wave[0]} label={`${wave[0]} · ${wave[1]}`} measures={MEASURES} /></main>;
  return (
    <main className="page" style={{ display: "grid", gap: 12 }}>
      <h1 style={{ fontSize: 22, margin: "8px 0 0" }}>Check-ins</h1>
      <p className="help" style={{ margin: 0 }}>Four short check-ins. Group numbers only; nobody sees your individual answers in a report.</p>
      {WAVES.map(([w, name, when]) => {
        const d = done.find((x) => x.wave === w);
        return (
          <a key={w} href={d ? undefined : `/airman/app/checkins?wave=${w}`} className="card" aria-disabled={Boolean(d)} style={{ display: "flex", justifyContent: "space-between", textDecoration: "none", color: "var(--color-ink)", minHeight: 44 }}>
            <span><b>{w} · {name}</b><br /><span className="help">{when}</span></span>
            <span className="pill">{d ? `DONE ${new Date(d.at).toLocaleDateString()}` : "OPEN"}</span>
          </a>
        );
      })}
    </main>
  );
}
