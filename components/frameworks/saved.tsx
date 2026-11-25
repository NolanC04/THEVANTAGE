"use client";
// Saved framework state. A tool keeps its state with useSaved instead of useState; inside a SavedState
// provider the state starts from the member's last save and is readable for the next one.
import { createContext, useContext, useState, type ReactNode, type MutableRefObject } from "react";

export type SavedData = Record<string, unknown>;
type Ctx = { init: SavedData; live: MutableRefObject<SavedData> };
const SavedCtx = createContext<Ctx | null>(null);

export function SavedState({ init, live, children }: { init: SavedData; live: MutableRefObject<SavedData>; children: ReactNode }) {
  return <SavedCtx.Provider value={{ init, live }}>{children}</SavedCtx.Provider>;
}

export function useSaved<T>(key: string, init: T) {
  const c = useContext(SavedCtx);
  const [v, setV] = useState<T>(() => (c && key in c.init ? (c.init[key] as T) : init));
  if (c) c.live.current[key] = v;
  return [v, setV] as const;
}

/** Every non-empty string a learner wrote, in order. Used as the Almanac summary when a tool has no readback. */
export function writtenText(d: unknown, out: string[] = []): string[] {
  if (typeof d === "string") { if (d.trim()) out.push(d.trim()); }
  else if (Array.isArray(d)) d.forEach((x) => writtenText(x, out));
  else if (d && typeof d === "object") Object.values(d).forEach((x) => writtenText(x, out));
  return out;
}
