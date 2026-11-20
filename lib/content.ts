import "server-only";
import { store } from "./store";
import type { Program, Module, LibraryItem, Cohort, Purchase } from "./types";

export async function publishedPrograms() {
  return store().list<Program>("programs", { status: "published" }, { column: "release_no" });
}
export async function allPrograms() {
  return store().list<Program>("programs", undefined, { column: "release_no" });
}
export async function programBySlug(slug: string) {
  return store().get<Program>("programs", { slug });
}
export async function programById(id: string) {
  return store().get<Program>("programs", { id });
}
export async function tracklist(programId: string, includeDrafts = false) {
  const rows = await store().list<Module>("modules", includeDrafts ? { program_id: programId } : { program_id: programId, status: "published" }, { column: "number" });
  return rows;
}
export async function moduleOf(programId: string, number: number) {
  return store().get<Module>("modules", { program_id: programId, number });
}
export async function publishedLibrary() {
  return store().list<LibraryItem>("library_items", { status: "published" }, { column: "published_at", ascending: false });
}
export async function libraryItem(slug: string) {
  return store().get<LibraryItem>("library_items", { slug });
}
export async function currentCohort() {
  const rows = await store().list<Cohort>("cohorts", { open: true });
  return rows[0] ?? null;
}
export async function seatsTaken(cohortId: string) {
  return store().count("purchases", { kind: "cohort", cohort_id: cohortId, status: "paid" });
}
export async function purchasesOf(memberId: string) {
  return store().list<Purchase>("purchases", { member_id: memberId }, { column: "created_at", ascending: false });
}
