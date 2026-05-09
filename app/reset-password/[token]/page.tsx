"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import SiteHeader from "../../components/SiteHeader";

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params?.token as string;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const resetPassword = async () => {
    setSuccessMessage("");

    if (!password || !confirmPassword) {
      alert("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/reset-password", {
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
        alert(data.error || "Unable to reset password.");
        return;
      }

      setSuccessMessage("Your password has been reset. You can now log in.");
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
      <SiteHeader />

      <section className="flex min-h-[calc(100vh-74px)] items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-[#d4af37]/30 bg-[#111a2e] p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#061b3a] text-2xl">
              🔑
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
              Secure Reset
            </p>

            <h1 className="font-serif text-3xl font-bold">
              Create New Password
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-gray-300">
              Enter a new password for your ScanMyLegacy account.
            </p>
          </div>

          {successMessage && (
            <div className="mb-5 rounded-2xl border border-green-400/30 bg-green-500/10 p-4 text-center text-sm leading-relaxed text-green-200">
              {successMessage}
            </div>
          )}

          <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
            New Password
          </label>

          <input
            type="password"
            className="mb-4 w-full rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37]"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
            Confirm Password
          </label>

          <input
            type="password"
            className="mb-5 w-full rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37]"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                resetPassword();
              }
            }}
          />

          <button
            onClick={resetPassword}
            disabled={loading || Boolean(successMessage)}
            className="w-full rounded-full bg-[#d4af37] px-6 py-4 text-center font-semibold text-[#061b3a] shadow-xl transition hover:scale-[1.01] hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>

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