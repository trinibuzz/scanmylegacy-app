"use client";

import { useState } from "react";

export default function AdminResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const resetPassword = async () => {
    setSuccessMessage("");

    if (!email || !newPassword) {
      alert("Please enter the customer email and a new password.");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    const confirmed = confirm(
      `Reset password for ${email}?\n\nThe customer will use the new password you enter here.`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Password reset failed.");
        return;
      }

      setSuccessMessage(
        `Password reset successfully for ${data.user?.email || email}.`
      );

      setEmail("");
      setNewPassword("");
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#061b3a] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.28em] text-[#d4af37]">
              Admin Control
            </p>

            <h1 className="font-serif text-4xl font-bold">
              Reset Customer Password
            </h1>

            <p className="mt-3 max-w-2xl text-gray-300">
              Use this tool when a customer forgets their password. The new
              password is saved securely using bcrypt.
            </p>
          </div>

          <a
            href="/admin"
            className="rounded-full border border-[#d4af37]/50 px-5 py-3 text-center text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#061b3a]"
          >
            Back to Admin
          </a>
        </div>

        <div className="rounded-3xl border border-[#d4af37]/20 bg-[#082652] p-6 shadow-2xl sm:p-8">
          {successMessage && (
            <div className="mb-6 rounded-2xl border border-green-400/30 bg-green-500/10 p-4 text-green-200">
              {successMessage}
            </div>
          )}

          <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
            Customer Email
          </label>

          <input
            type="email"
            className="mb-5 w-full rounded-xl border border-[#d4af37]/20 bg-[#061b3a] p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37]"
            placeholder="customer@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
            New Temporary Password
          </label>

          <input
            type="text"
            className="mb-5 w-full rounded-xl border border-[#d4af37]/20 bg-[#061b3a] p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37]"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button
            onClick={resetPassword}
            disabled={loading}
            className="w-full rounded-full bg-[#d4af37] px-6 py-4 font-semibold text-[#061b3a] shadow-xl transition hover:scale-[1.01] hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>

          <div className="mt-6 rounded-2xl border border-[#d4af37]/15 bg-[#061b3a] p-4 text-sm leading-relaxed text-gray-300">
            After resetting, give the customer the temporary password. They can
            log in immediately. Once email reset links are configured, we can
            upgrade this into a fully automatic forgot-password flow.
          </div>
        </div>
      </div>
    </main>
  );
}