import type { Metadata } from "next";
import "./airman.css";

// The Airman Vantage: the facilitated, free military segment of The Vantage (internal name).
// Publicly it is "Military and veterans"; it never shows The Vantage's prices or paid offers.
export const metadata: Metadata = {
  title: { default: "AAPEX · Military and veterans", template: "%s · AAPEX" },
  description: "Hybrid intellects and hybrid athletes. A free, voluntary, off-duty formation program for service members and veterans.",
  robots: { index: false },
};

export default function AirmanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="airman">
      {/* React hoists this stylesheet into <head>; only pages in this segment load these fonts. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap" />
      {children}
    </div>
  );
}
