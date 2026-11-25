import Link from "next/link";
import { code } from "@/lib/airman/program";

/** Day 7 / Day 30 retrieval reviews surface on Home based on sealed_at. */
export function Reviews({ entries }: { entries: { n: number; sealed_at: string; reviews: number[] }[] }) {
  const now = Date.now();
  const due = entries.flatMap((e) => ([7, 30] as const).filter((d) => !e.reviews.includes(d) && now - Date.parse(e.sealed_at) >= d * 86400_000).map((d) => ({ n: e.n, d })));
  if (!due.length) return null;
  return (
    <div className="card-activity">
      <span className="k">REVIEW FROM MEMORY</span>
      {due.slice(0, 3).map(({ n, d }) => (
        <Link key={`${n}-${d}`} href={`/airman/app/almanac/review?n=${n}&d=${d}`} style={{ display: "block", marginTop: 8, fontWeight: 600 }}>Day {d} review · {code(n)}</Link>
      ))}
    </div>
  );
}
