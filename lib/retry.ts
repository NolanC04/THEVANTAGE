/** Loud failure, server side: one silent retry, then the error propagates to a visible message. */
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return await fn();
  }
}
