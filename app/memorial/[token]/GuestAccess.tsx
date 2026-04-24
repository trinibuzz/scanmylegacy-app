"use client";

import { useState } from "react";

export default function GuestAccess({ memorial, token }: any) {
  const [allowed, setAllowed] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const enterMemorial = async () => {
    const res = await fetch("/api/guest-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        guest_name: guestName,
        guest_email: guestEmail,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setAllowed(true);
  };

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8">
          <h1 className="mb-2 text-center font-serif text-3xl">
            You’re Invited
          </h1>

          <p className="mb-6 text-center text-gray-400">
            Enter your name to view this memorial.
          </p>

          <input
            className="mb-3 w-full rounded bg-[#0b1320] border border-[#2a3550] p-3"
            placeholder="Your Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />

          <input
            className="mb-4 w-full rounded bg-[#0b1320] border border-[#2a3550] p-3"
            placeholder="Email Address (optional)"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
          />

          <button
            onClick={enterMemorial}
            className="w-full rounded bg-[#d4af37] py-3 font-semibold text-black"
          >
            Enter Memorial
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1320] p-10 text-white">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#1f2a44] bg-[#111a2e] p-8">
        <h1 className="mb-2 font-serif text-4xl">{memorial.full_name}</h1>

        <p className="mb-6 text-gray-400">
          {memorial.birth_date ? new Date(memorial.birth_date).toLocaleDateString() : ""}
          {" — "}
          {memorial.death_date ? new Date(memorial.death_date).toLocaleDateString() : ""}
        </p>

        <p className="leading-relaxed text-gray-300">{memorial.biography}</p>
      </div>
    </main>
  );
}