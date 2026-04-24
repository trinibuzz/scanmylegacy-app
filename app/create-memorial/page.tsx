"use client";

import { useState } from "react";

export default function CreateMemorial() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");

  const saveMemorial = async () => {
    const res = await fetch("/api/memorials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: fullName,
        birth_date: birthDate,
        death_date: deathDate,
        biography,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Memorial saved!");
    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen bg-[#0b1320] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-[#111a2e] rounded-2xl p-8 shadow-2xl border border-[#1f2a44]">

        <h1 className="text-3xl font-serif text-center mb-2">
          Preserve a Legacy
        </h1>

        <p className="text-center text-gray-400 mb-6">
          Create a timeless tribute for your loved one
        </p>

        <input
          className="w-full mb-3 p-3 rounded-lg bg-[#0b1320] border border-[#2a3550]"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="date"
            className="p-3 rounded-lg bg-[#0b1320] border border-[#2a3550]"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          <input
            type="date"
            className="p-3 rounded-lg bg-[#0b1320] border border-[#2a3550]"
            value={deathDate}
            onChange={(e) => setDeathDate(e.target.value)}
          />
        </div>

        <textarea
          className="w-full mb-4 p-3 rounded-lg bg-[#0b1320] border border-[#2a3550] min-h-[120px]"
          placeholder="Write a life story, tribute, or memories..."
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
        />

        <button
          onClick={saveMemorial}
          className="w-full bg-[#d4af37] text-black font-semibold py-3 rounded-lg hover:opacity-90 transition"
        >
          Create Memorial
        </button>

      </div>
    </main>
  );
}