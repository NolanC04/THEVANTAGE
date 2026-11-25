import { signedIn, HttpError } from "@/lib/airman/guard";
import { isAdmin, audit } from "@/lib/airman/auth";
import { propose } from "@/lib/airman/imports";
import { ok, fail } from "@/lib/airman/api";

export async function POST(req: Request) {
  try {
    const p = await signedIn();
    if (!isAdmin(p)) throw new HttpError(403, "Admins only.");
    const b = await req.json();
    const mods = Array.isArray(b?.modules) ? b.modules : null;
    if (!mods) throw new HttpError(400, "Expected { modules: [...] }.");
    const items = mods.filter((m: { n?: unknown }) => Number.isInteger(m.n) && (m.n as number) >= 1 && (m.n as number) <= 24).map((m: { n: number }) => ({ n: m.n, content: m as Record<string, unknown> }));
    const n = await propose(String(b.source ?? "bundle upload").slice(0, 80), items, p.id);
    await audit(p, "import.proposed", "modules", { proposals: n });
    return ok({ proposals: n });
  } catch (e) {
    return fail(e);
  }
}
