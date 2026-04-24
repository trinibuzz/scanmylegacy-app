"use client";

import { useState } from "react";

export default function GuestAccess({ memorial, token }: any) {
  const [allowed, setAllowed] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const enterMemorial = async () => {
    const res = await fetch("/api/guest-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
          <h1 className="mb-2 text-center font-serif text-3xl">You’re Invited</h1>
          <p className="mb-6 text-center text-gray-400">
            Enter your name to view this memorial.
          </p>

          <input
            className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
            placeholder="Your Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />

          <input
            className="mb-4 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
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
    <main className="min-h-screen bg-[#0b1320] text-white">
      <section className="px-6 py-16 text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
          In Loving Memory
        </p>

        <h1 className="mb-4 font-serif text-5xl">{memorial.full_name}</h1>

        <p className="mb-8 text-gray-400">
          {memorial.birth_date ? new Date(memorial.birth_date).toLocaleDateString() : ""}
          {" — "}
          {memorial.death_date ? new Date(memorial.death_date).toLocaleDateString() : ""}
        </p>

        <div className="mx-auto h-px max-w-xl bg-[#d4af37]/40" />
      </section>

      {memorial.cover_photo && (
        <div className="mx-auto mb-10 max-w-3xl px-6">
          <img
            src={memorial.cover_photo}
            alt={memorial.full_name}
            className="h-[380px] w-full rounded-2xl border border-[#1f2a44] object-cover shadow-2xl"
          />
        </div>
      )}

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-16 md:grid-cols-3">
        <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 md:col-span-2">
          <h2 className="mb-4 font-serif text-2xl text-[#d4af37]">
            Life Story
          </h2>

          <p className="leading-relaxed text-gray-300">{memorial.biography}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 text-center">
            <div className="mb-3 text-4xl">🕯️</div>
            <h3 className="font-serif text-xl">Light a Candle</h3>
            <p className="mt-2 text-sm text-gray-400">
              A quiet tribute of love and remembrance.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 text-center">
            <div className="mb-3 text-4xl">🌹</div>
            <h3 className="font-serif text-xl">Leave a Flower</h3>
            <p className="mt-2 text-sm text-gray-400">
              Honor their memory with a simple gesture.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}