"use client";
/** Loud failure, client side: one silent retry, then throw so the UI shows a message with Retry. */
export async function postJSON<T = unknown>(url: string, body: unknown): Promise<T> {
  const go = async () => {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
    if (!res.ok) throw Object.assign(new Error(data.error ?? `Request failed (${res.status}).`), { status: res.status });
    return data;
  };
  try {
    return await go();
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status && status < 500) throw e; // a validation answer is not a transient failure
    return await go();
  }
}
