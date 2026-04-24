"use client";

import { useState } from "react";

export default function CreateMemorial() {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);

  const saveMemorial = async () => {
    const formData = new FormData();

    formData.append("full_name", fullName);
    formData.append("birth_date", birthDate);
    formData.append("death_date", deathDate);
    formData.append("biography", biography);

    if (coverPhoto) {
      formData.append("cover_photo", coverPhoto);
    }

    const res = await fetch("/api/memorials", {
      method: "POST",
      body: formData,
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
    <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
      <div className="w-full max-w-2xl rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 shadow-2xl">
        <h1 className="mb-2 text-center font-serif text-3xl">
          Preserve a Legacy
        </h1>

        <p className="mb-6 text-center text-gray-400">
          Create a timeless tribute for your loved one
        </p>

        <input
          className="mb-3 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-3"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <div className="mb-3 grid grid-cols-2 gap-3">
          <input
            type="date"
            className="rounded-lg border border-[#2a3550] bg-[#0b1320] p-3"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          <input
            type="date"
            className="rounded-lg border border-[#2a3550] bg-[#0b1320] p-3"
            value={deathDate}
            onChange={(e) => setDeathDate(e.target.value)}
          />
        </div>

        <input
          type="file"
          accept="image/*"
          className="mb-3 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-3"
          onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
        />

        <textarea
          className="mb-4 min-h-[120px] w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-3"
          placeholder="Write a life story, tribute, or memories..."
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
        />

        <button
          onClick={saveMemorial}
          className="w-full rounded-lg bg-[#d4af37] py-3 font-semibold text-black transition hover:opacity-90"
        >
          Create Memorial
        </button>
      </div>
    </main>
  );
}