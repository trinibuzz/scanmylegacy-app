"use client";

import { useState } from "react";
import SiteHeader from "../components/SiteHeader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  return (
    <main className="min-h-screen bg-[#061b3a] text-white">
      <SiteHeader />

      <section className="flex min-h-[calc(100vh-74px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-[#d4af37]/30 bg-[#111a2e] p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#061b3a] text-2xl">
              🔐
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
              Password Help
            </p>

            <h1 className="font-serif text-3xl font-bold">
              Forgot Password
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              Enter the email used to create your memorial account. Our support
              team can reset your password securely.
            </p>
          </div>

          <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
            Account Email
          </label>

          <input
            type="email"
            className="mb-5 w-full rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37]"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <a
            href={`mailto:support@scanmylegacy.com?subject=${encodeURIComponent(
              "ScanMyLegacy Password Reset Request"
            )}&body=${encodeURIComponent(
              `Hello ScanMyLegacy Support,\n\nI need help resetting my password.\n\nAccount email: ${email}\n\nThank you.`
            )}`}
            className="block w-full rounded-full bg-[#d4af37] px-6 py-4 text-center font-semibold text-[#061b3a] shadow-xl transition hover:scale-[1.01] hover:bg-[#f0c94a]"
          >
            Request Password Reset
          </a>

          <p className="mt-5 text-center text-xs leading-relaxed text-gray-400">
            For security, password resets are handled by ScanMyLegacy support
            until automatic email reset links are configured.
          </p>

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-sm font-semibold text-[#d4af37] transition hover:text-[#f0c94a]"
            >
              ← Back to Login
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}