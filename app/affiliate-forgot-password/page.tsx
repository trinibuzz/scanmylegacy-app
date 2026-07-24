"use client";

import Link from "next/link";
import { useState } from "react";

export default function AffiliateForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const requestReset = async () => {
    if (!email) {
      alert("Please enter your affiliate email address.");
      return;
    }

    try {
      setLoading(true);
      setResetLink("");

      const res = await fetch("/api/affiliate-forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not create reset link.");
        return;
      }

      setResetLink(data.resetLink || "");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#061b3a] text-white">
      <section className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-[#d4af37]/25 bg-[#061b3a]/90 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#082652] text-2xl">
              🔐
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
              Affiliate Password Reset
            </p>

            <h1 className="font-serif text-3xl font-bold">
              Forgot Password
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Enter your affiliate email address and we will create a secure
              reset link.
            </p>
          </div>

          <label className="mb-2 block text-sm font-semibold text-gray-300">
            Affiliate Email
          </label>

          <input
            type="email"
            className="mb-5 w-full rounded-xl border border-[#d4af37]/20 bg-[#020817]/70 p-4 text-white outline-none placeholder:text-gray-500 focus:border-[#d4af37]"
            placeholder="affiliate@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={requestReset}
            disabled={loading}
            className="w-full rounded-full bg-[#d4af37] py-4 font-semibold text-[#061b3a] shadow-xl transition hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Reset Link..." : "Create Reset Link"}
          </button>

          {resetLink && (
            <div className="mt-6 rounded-2xl border border-[#d4af37]/30 bg-[#020817]/70 p-5">
              <p className="mb-3 text-sm font-semibold text-[#d4af37]">
                Reset link created:
              </p>

              <Link
                href={resetLink}
                className="break-words text-sm text-gray-200 underline transition hover:text-[#d4af37]"
              >
                {resetLink}
              </Link>

              <p className="mt-4 text-xs leading-relaxed text-gray-400">
                Use this link to set a new affiliate password. This is a
                temporary reset link.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/affiliate-login"
              className="text-sm font-semibold text-[#d4af37] hover:underline"
            >
              ← Back to Affiliate Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}