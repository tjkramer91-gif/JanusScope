import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JanusScope",
  description: "AI construction help for scope, contracts, bids, RFIs, change orders, budgets, and project risk.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
