import type { Metadata, Viewport } from "next";
import "./globals.css";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "The Vantage by Langford", template: "%s · The Vantage" },
  description: "Programs for people in transition who intend to build.",
  openGraph: { siteName: "The Vantage", type: "website", images: ["/images/paintings/ridge-first-light.jpg"] },
};
export const viewport: Viewport = { themeColor: "#0D0B08", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
