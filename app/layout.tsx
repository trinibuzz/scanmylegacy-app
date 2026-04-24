import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScanMyLegacy",
  description: "Preserve memories. Celebrate lives. Keep their legacy alive forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}