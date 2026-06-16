import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JanusScope",
  description: "Construction document review and project intelligence, starting with SubScope for subcontractors.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
