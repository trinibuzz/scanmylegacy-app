"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#0b1320] border-b border-[#1f2a44]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <div className="text-white font-serif text-xl">
          ScanMy <span className="text-[#d4af37]">Legacy</span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/how-it-works">How It Works</Link>
          <Link href="/packages">Packages</Link>
          <Link href="/faqs">FAQs</Link>
          <Link href="/login">Login</Link>
        </nav>

        {/* CTA */}
        <Link
          href="/create-memorial"
          className="bg-[#d4af37] text-black px-4 py-2 rounded-lg font-semibold"
        >
          Book a Spot
        </Link>

      </div>
    </header>
  );
}