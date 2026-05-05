import type { Metadata } from "next";
import "./globals.css";
import LiveChat from "./components/LiveChat";
import Footer from "./components/Footer";

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
        <Footer />
        <LiveChat />
      </body>
    </html>
  );
}