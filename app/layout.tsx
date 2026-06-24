import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "JanusScope",
    template: "%s | JanusScope",
  },
  description:
    "AI construction education and software tools that help construction professionals review documents, understand scope, organize risk, and ask better project questions.",
  openGraph: {
    title: "JanusScope",
    description:
      "Practical AI tools for construction professionals reviewing project documents, scopes, contracts, bids, budgets, RFIs, and field issues.",
    siteName: "JanusScope",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
