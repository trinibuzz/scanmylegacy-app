import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "ScanMyLegacy",
  description: "Preserve memories. Celebrate lives. Keep their legacy alive forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
  <LiveChat />
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}