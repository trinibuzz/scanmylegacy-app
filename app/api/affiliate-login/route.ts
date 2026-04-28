"use client";

import { useState } from "react";

export default function AffiliateLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
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
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8">
        <h1 className="mb-6 text-center font-serif text-3xl text-[#d4af37]">
          Affiliate Login
        </h1>

        <input
          className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="mb-6 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="w-full rounded bg-[#d4af37] py-3 font-semibold text-black"
        >
          Login
        </button>
      </div>
    </main>
  );
}