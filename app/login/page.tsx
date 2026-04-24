"use client";

import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
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

    alert("Login successful!");
    window.location.href = "/dashboard";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>

        <input
          className="w-full p-2 mb-3 bg-zinc-800 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-4 bg-zinc-800 rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-white text-black p-2 rounded"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </main>
  );
}