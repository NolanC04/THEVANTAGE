import { FinishSignIn } from "@/components/auth/FinishSignIn";

export const metadata = { title: "Signing in", robots: { index: false } };

export default function Confirm() {
  return (
    <main className="page" style={{ paddingTop: 48 }}>
      <FinishSignIn then="/airman/auth/finish" retryHref="/airman" className="card" />
    </main>
  );
}
