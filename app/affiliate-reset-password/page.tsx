"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AffiliateResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  const resetPassword = async () => {
    if (!token) {
      alert("Missing reset token.");
      return;
    }

    if (!password || !confirmPassword) {
      alert("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/affiliate-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not reset password.");
        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
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
              🔑
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
              Affiliate Access
            </p>

            <h1 className="font-serif text-3xl font-bold">
              Reset Password
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Enter a new password for your affiliate account.
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mb-5 rounded-2xl border border-green-400/30 bg-green-500/10 p-5 text-sm text-green-200">
                Your affiliate password has been reset successfully.
              </div>

              <Link
                href="/affiliate-login"
                className="inline-block rounded-full bg-[#d4af37] px-8 py-3 font-semibold text-[#061b3a] transition hover:bg-[#f0c94a]"
              >
                Go to Affiliate Login
              </Link>
            </div>
          ) : (
            <>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                New Password
              </label>

              <input
                type="password"
                className="mb-4 w-full rounded-xl border border-[#d4af37]/20 bg-[#020817]/70 p-4 text-white outline-none placeholder:text-gray-500 focus:border-[#d4af37]"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Confirm New Password
              </label>

              <input
                type="password"
                className="mb-6 w-full rounded-xl border border-[#d4af37]/20 bg-[#020817]/70 p-4 text-white outline-none placeholder:text-gray-500 focus:border-[#d4af37]"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <button
                onClick={resetPassword}
                disabled={loading}
                className="w-full rounded-full bg-[#d4af37] py-4 font-semibold text-[#061b3a] shadow-xl transition hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

              <div className="mt-6 text-center">
                <Link
                  href="/affiliate-login"
                  className="text-sm font-semibold text-[#d4af37] hover:underline"
                >
                  ← Back to Affiliate Login
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}