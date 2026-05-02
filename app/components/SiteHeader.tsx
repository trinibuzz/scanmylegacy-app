"use client";

import { useState } from "react";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Packages", href: "/packages" },
    { label: "FAQ", href: "/faqs" },
    { label: "Login", href: "/login" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-[9999] border-b border-[#d4af37]/30 bg-[#26447F] shadow-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="/" onClick={closeMenu} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/50 bg-[#111a2e] text-lg">
            🕯️
          </div>

          <div>
            <div className="font-serif text-lg font-bold leading-tight text-white sm:text-xl">
              Scan<span className="text-[#d4af37]">My</span>Legacy
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]">
              Preserve Memories Forever
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-6 text-sm lg:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-gray-300 transition hover:text-[#d4af37]"
            >
              {item.label}
            </a>
          ))}

          <a
            href="/packages"
            className="rounded-full bg-[#d4af37] px-5 py-2 font-semibold text-black transition hover:opacity-90"
          >
            Create Memorial
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-2xl leading-none text-[#d4af37] lg:hidden"
          aria-label="Open menu"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#d4af37]/20 bg-[#081827] px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl border border-[#1f2a44] bg-[#111a2e] px-4 py-3 text-sm font-semibold text-gray-200 transition hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                {item.label}
              </a>
            ))}

            <a
              href="/packages"
              onClick={closeMenu}
              className="mt-2 rounded-xl bg-[#d4af37] px-4 py-3 text-center text-sm font-semibold text-black"
            >
              Create Memorial
            </a>
          </div>
        </div>
      )}
    </header>
  );
}