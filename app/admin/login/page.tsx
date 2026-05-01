"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      alert("Please enter admin email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Admin login failed.");
        return;
      }

      window.location.href = "/admin/dashboard";
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 shadow-2xl">
        <p className="mb-2 text-center text-sm uppercase tracking-[0.25em] text-[#d4af37]">
          ScanMyLegacy Admin
        </p>

        <h1 className="mb-6 text-center font-serif text-3xl text-white">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white placeholder:text-gray-500"
        />

        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white placeholder:text-gray-500"
        />

        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded-lg bg-[#d4af37] py-4 font-semibold text-black transition hover:opacity-90"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </main>
  );
}
