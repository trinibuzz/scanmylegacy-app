"use client";

import { useEffect, useState } from "react";

export default function EditMemorial({ params }: any) {
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);

  useEffect(() => {
    fetch(`/api/edit-memorial?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.memorial) {
          setFullName(data.memorial.full_name || "");
          setBirthDate(data.memorial.birth_date?.slice(0, 10) || "");
          setDeathDate(data.memorial.death_date?.slice(0, 10) || "");
          setBiography(data.memorial.biography || "");
        }
      });
  }, [params.id]);

  const saveChanges = async () => {
    const formData = new FormData();

    formData.append("id", params.id);
    formData.append("full_name", fullName);
    formData.append("birth_date", birthDate);
    formData.append("death_date", deathDate);
    formData.append("biography", biography);

    if (coverPhoto) {
      formData.append("cover_photo", coverPhoto);
    }

    const res = await fetch("/api/edit-memorial", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    window.location.href = `/admin/memorial/${params.id}`;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
      <div className="w-full max-w-2xl rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8">
        <h1 className="mb-6 font-serif text-3xl text-[#d4af37]">
          Edit Memorial
        </h1>

        <input
          className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <div className="mb-3 grid grid-cols-2 gap-3">
          <input
            type="date"
            className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          <input
            type="date"
            className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
            value={deathDate}
            onChange={(e) => setDeathDate(e.target.value)}
          />
        </div>

        <input
          type="file"
          accept="image/*"
          className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
          onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
        />

        <textarea
          className="mb-4 min-h-[140px] w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
          placeholder="Biography"
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
        />

        <button
          onClick={saveChanges}
          className="w-full rounded bg-[#d4af37] py-3 font-semibold text-black"
        >
          Save Changes
        </button>
      </div>
    </main>
  );
}