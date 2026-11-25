import type { Member, Module, Program, LibraryItem } from "./types";

export type Gate =
  | { open: true }
  | { open: false; reason: "sign_in" | "library" | "draft" };

/**
 * Server-side gate. Called on every protected page and API.
 * - Module 1 of a published program: any signed-in member (email only, no card).
 * - Military-free programs (AAPEX): verified service members and veterans, at $0.
 * - Library or Cohort tier: every published program.
 */
export function moduleGate(member: Member | null, program: Program, mod: Module): Gate {
  if (program.status !== "published" || mod.status !== "published") return { open: false, reason: "draft" };
  if (!member) return { open: false, reason: "sign_in" };
  if (mod.number === 1) return { open: true };
  if (program.military_free && member.verified_military && member.verification_type !== "military_spouse") return { open: true };
  if (hasPaidAccess(member)) return { open: true };
  return { open: false, reason: "library" };
}

export function libraryGate(member: Member | null, item: LibraryItem): Gate {
  if (item.status !== "published") return { open: false, reason: "draft" };
  if (item.tier_required === "public") return { open: true };
  if (!member) return { open: false, reason: "sign_in" };
  if (item.tier_required === "free") return { open: true };
  return hasPaidAccess(member) ? { open: true } : { open: false, reason: "library" };
}

export function hasPaidAccess(m: Member) {
  if (m.tier === "cohort") return true;
  if (m.tier === "library") return m.subscription_status === "active" || m.subscription_status === "trialing";
  return false;
}
