"use client";

import Link from "next/link";
import { useState } from "react";

export default function AffiliateLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      alert("Please enter your affiliate email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/affiliate-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      window.location.href = "/affiliate-dashboard";
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#061b3a] text-white">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(38,68,127,0.65),transparent_38%)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#061b3a] via-[#082652] to-[#020817]" />

        <div className="relative z-10 grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
              ScanMyLegacy Affiliate Program
            </p>

            <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl">
              Partner with ScanMyLegacy and earn through referrals.
            </h1>

            <p className="mb-8 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
              Log in to view your affiliate dashboard, referral link, pending
              commissions, paid commissions, and referral history.
            </p>

            <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
              {[
                { label: "Referral Link", icon: "🔗" },
                { label: "Commissions", icon: "💰" },
                { label: "Partner Growth", icon: "📈" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#d4af37]/20 bg-white/5 p-5 text-center shadow-xl backdrop-blur"
                >
                  <div className="mb-3 text-3xl">{item.icon}</div>
                  <p className="text-sm font-semibold text-gray-200">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-[#d4af37]/25 bg-[#061b3a]/85 p-8 shadow-2xl backdrop-blur">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#082652] text-2xl">
                  🕯️
                </div>

                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
                  Affiliate Access
                </p>

                <h2 className="font-serif text-3xl font-bold text-white">
                  Affiliate Login
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  Enter your affiliate account details to continue.
                </p>
              </div>

              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                className="mb-4 w-full rounded-xl border border-[#d4af37]/20 bg-[#020817]/70 p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37]"
                placeholder="affiliate@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Password
              </label>
              <input
                type="password"
                className="mb-3 w-full rounded-xl border border-[#d4af37]/20 bg-[#020817]/70 p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37]"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    login();
                  }
                }}
              />

              <div className="mb-6 text-right">
                <Link
                  href="/affiliate-forgot-password"
                  className="text-sm font-semibold text-[#d4af37] transition hover:text-[#f0c94a] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                onClick={login}
                disabled={loading}
                className="w-full rounded-full bg-[#d4af37] py-4 font-semibold text-[#061b3a] shadow-xl transition hover:scale-[1.01] hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login to Affiliate Dashboard"}
              </button>

              <div className="mt-6 border-t border-[#d4af37]/15 pt-6 text-center text-sm text-gray-400">
                <p>
                  Not an affiliate yet?{" "}
                  <Link
                    href="/affiliate-signup"
                    className="font-semibold text-[#d4af37] transition hover:text-[#f0c94a]"
                  >
                    Become an Affiliate
                  </Link>
                </p>

                <p className="mt-3">
                  Need regular memorial access?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#d4af37] transition hover:text-[#f0c94a]"
                  >
                    User Login
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-5 text-center">
              <Link
                href="/"
                className="text-sm font-semibold text-gray-300 transition hover:text-[#d4af37]"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}