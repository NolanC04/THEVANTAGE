import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { currentMember } from "@/lib/auth";

/** The Vantage's public site: nav, pricing and footer. The Airman Vantage (/airman) has its own shell. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let signedIn = false;
  try {
    signedIn = Boolean(await currentMember());
  } catch {
    signedIn = false; // nav still renders; protected pages surface their own errors
  }
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-4">Skip to content</a>
      <Nav signedIn={signedIn} />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
