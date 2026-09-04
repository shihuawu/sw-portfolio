import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shihua Wu — AI-Native Operator",
  description:
    "AI-Native Operator building and operating production agent systems for companies standing up their first go-to-market engine.",
  openGraph: {
    title: "Shihua Wu — AI-Native Operator",
    description:
      "I build the first GTM engine — and the agents that run it.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f0e8",
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

/** Provides the shared document shell and metadata for the portfolio. */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
