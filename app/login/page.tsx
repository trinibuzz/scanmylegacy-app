"use client";

import { useState } from "react";
import SiteHeader from "../components/SiteHeader";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <SiteHeader />

      {/* HERO / LOGIN */}
      <section className="relative min-h-[calc(100vh-74px)] overflow-hidden bg-[#26447F]">
        <img
          src="/images/home-hero.jpg"
          alt="ScanMyLegacy login"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#26447F]/95 via-[#26447F]/85 to-[#0b1320]/55" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-74px)] max-w-7xl items-center justify-center px-6 py-16">
          <div className="w-full max-w-md rounded-3xl border border-[#d4af37]/30 bg-[#111a2e]/95 p-8 shadow-2xl backdrop-blur">
            <div className="mb-8 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#d4af37]">
                Welcome Back
              </p>

              <h1 className="font-serif text-4xl font-bold text-[#f8f5ee]">
                Login
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                Access your memorial dashboard and continue preserving your
                loved one’s legacy.
              </p>
            </div>

            <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
              Email
            </label>
            <input
              className="mb-4 w-full rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37]"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
              Password
            </label>
            <input
              className="mb-6 w-full rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-3 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37]"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />

            <button
              className="w-full rounded-full bg-[#d4af37] px-6 py-4 font-semibold text-[#0b1320] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="mt-6 text-center text-sm text-gray-400">
              Need to create a memorial?{" "}
              <a
                href="/packages"
                className="font-semibold text-[#d4af37] hover:underline"
              >
                View Packages
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}