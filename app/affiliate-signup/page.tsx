"use client";

import { useState } from "react";

export default function AffiliateSignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [affiliate, setAffiliate] = useState<any>(null);

  const handleSignup = async () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      alert("Please complete all fields");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/affiliates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Signup failed");
        return;
      }

      setAffiliate(data.affiliate);
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!affiliate?.referral_link) return;

    await navigator.clipboard.writeText(
      affiliate.referral_link
    );

    alert("Referral link copied!");
  };

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            Earn With ScanMyLegacy
          </p>

          <h1 className="font-serif text-4xl">
            Become an Affiliate
          </h1>

          <p className="mt-4 text-gray-400">
            Create your affiliate account, get your
            referral link, and earn commission when
            someone purchases through your link.
          </p>
        </div>

        {!affiliate ? (
          <>
            <input
              className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
            />

            <input
              className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4"
              placeholder="Email Address"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <input
              type="password"
              className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <input
              type="password"
              className="mb-6 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
            />

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full rounded-lg bg-[#d4af37] py-4 font-semibold text-black disabled:opacity-60"
            >
              {loading
                ? "Creating Affiliate Account..."
                : "Join Affiliate Program"}
            </button>
          </>
        ) : (
          <div className="rounded-2xl border border-[#d4af37]/30 bg-[#0b1320] p-6">
            <h2 className="mb-4 font-serif text-2xl text-[#d4af37]">
              Welcome, {affiliate.full_name}
            </h2>

            <p className="mb-2 text-gray-300">
              Your referral code:
            </p>

            <div className="mb-6 rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 font-mono text-[#d4af37]">
              {affiliate.referral_code}
            </div>

            <p className="mb-2 text-gray-300">
              Your referral link:
            </p>

            <div className="mb-6 break-all rounded-lg border border-[#2a3550] bg-[#111a2e] p-4 text-sm">
              {affiliate.referral_link}
            </div>

            <button
              onClick={copyLink}
              className="w-full rounded-lg bg-[#d4af37] py-4 font-semibold text-black"
            >
              Copy Referral Link
            </button>
          </div>
        )}
      </div>
    </main>
  );
}