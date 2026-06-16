import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubScope Risk Review",
  description: "Pre-execution subcontract risk review for subcontractors.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
