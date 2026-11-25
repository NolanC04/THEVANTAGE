"use client";
export class LoudFailure extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}
/** One silent retry on network or server failure, then a typed error the UI shows with Retry. 4xx answers are not retried. */
export async function fetchWithRetry<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const go = async () => {
    const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) }, body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body });
    const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
    if (!res.ok) throw new LoudFailure(data.error ?? `Request failed (${res.status}).`, res.status);
    return data;
  };
  try {
    return await go();
  } catch (e) {
    if (e instanceof LoudFailure && e.status && e.status < 500) throw e;
    return await go();
  }
}
export const postJSON = <T = unknown,>(url: string, json: unknown) => fetchWithRetry<T>(url, { method: "POST", json });
