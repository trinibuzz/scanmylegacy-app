"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-[#1f2a44] bg-[#0b1320]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="font-serif text-xl text-white">
          ScanMy <span className="text-[#d4af37]">Legacy</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 text-sm text-gray-300 md:flex">
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/packages">Packages</Link>
          <Link href="/faqs">FAQs</Link>
          <Link href="/login">Login</Link>
        </nav>

        {/* CTA */}
        <Link
          href="/packages"
          className="rounded-lg bg-[#d4af37] px-4 py-2 font-semibold text-black"
        >
          Book a Spot
        </Link>
      </div>
    </header>
  );
}