import type { Metadata } from "next";
import "./globals.css";
import LiveChat from "./components/LiveChat";

export const metadata: Metadata = {
  title: "ScanMyLegacy",
  description:
    "Preserve memories. Celebrate lives. Keep their legacy alive forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <LiveChat />
      </body>
    </html>
  );
}