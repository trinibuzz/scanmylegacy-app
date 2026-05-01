"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ManageMemorialPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [memorial, setMemorial] = useState<any>(null);
  const [gallery, setGallery] = useState<any[]>([]);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");

  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [memorialMusic, setMemorialMusic] = useState<File | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);

  const loadMemorial = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/dashboard/memorial/${id}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Unable to load memorial.");
        window.location.href = "/dashboard";
        return;
      }

      setMemorial(data.memorial);
      setGallery(data.gallery || []);

      setFullName(data.memorial.full_name || "");
      setBirthDate(data.memorial.birth_date ? data.memorial.birth_date.slice(0, 10) : "");
      setDeathDate(data.memorial.death_date ? data.memorial.death_date.slice(0, 10) : "");
      setBiography(data.memorial.biography || "");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadMemorial();
  }, [id]);

  const saveMemorial = async () => {
    if (!fullName.trim()) {
      alert("Full name is required.");
      return;
    }

    const formData = new FormData();
    formData.append("full_name", fullName);
    formData.append("birth_date", birthDate);
    formData.append("death_date", deathDate);
    formData.append("biography", biography);

    if (coverPhoto) formData.append("cover_photo", coverPhoto);
    if (memorialMusic) formData.append("memorial_music", memorialMusic);

    galleryPhotos.forEach((photo) => {
      formData.append("gallery_photos", photo);
    });

    try {
      setSaving(true);

      const res = await fetch(`/api/dashboard/memorial/${id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to update memorial.");
        return;
      }

      alert("Memorial updated successfully.");
      setCoverPhoto(null);
      setMemorialMusic(null);
      setGalleryPhotos([]);
      await loadMemorial();
    } finally {
      setSaving(false);
    }
  };

  const deleteGalleryPhoto = async (galleryId: number) => {
    const confirmed = confirm("Remove this photo from the memorial gallery?");
    if (!confirmed) return;

    const res = await fetch(`/api/dashboard/memorial/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gallery_id: galleryId }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to remove photo.");
      return;
    }

    await loadMemorial();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
        Loading memorial editor...
      </main>
    );
  }

  if (!memorial) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
        Memorial not found.
      </main>
    );
  }

  const memorialLink = `/memorial/${memorial.invite_token}`;

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            Owner Control
          </p>
          <h1 className="font-serif text-4xl font-bold">Manage Memorial</h1>
          <p className="mt-3 max-w-2xl text-gray-400">
            Update your loved one’s story, cover photo, memorial music, and slideshow gallery.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <a href="/dashboard" className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold text-[#d4af37]">
            Back to Dashboard
          </a>
          <a href={memorialLink} target="_blank" className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black">
            View Memorial
          </a>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <h2 className="mb-5 font-serif text-2xl text-[#d4af37]">Memorial Details</h2>

              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Loved One’s Full Name" className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white" />

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white" />
                <input type="date" value={deathDate} onChange={(e) => setDeathDate(e.target.value)} className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white" />
              </div>

              <textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={8} placeholder="Biography / Life Story" className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white" />
            </div>

            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <h2 className="mb-5 font-serif text-2xl text-[#d4af37]">Media Updates</h2>

              <div className="mb-5 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                <label className="mb-2 block text-sm font-semibold text-[#d4af37]">Change Cover Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)} className="w-full rounded border border-[#2a3550] bg-[#111a2e] p-3 text-sm text-white" />
                {coverPhoto && <p className="mt-2 text-xs text-[#d4af37]">Selected: {coverPhoto.name}</p>}
              </div>

              <div className="mb-5 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                <label className="mb-2 block text-sm font-semibold text-[#d4af37]">Change Memorial Song</label>
                <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a" onChange={(e) => setMemorialMusic(e.target.files?.[0] || null)} className="w-full rounded border border-[#2a3550] bg-[#111a2e] p-3 text-sm text-white" />
                {memorialMusic && <p className="mt-2 text-xs text-[#d4af37]">Selected: {memorialMusic.name}</p>}
              </div>

              <div className="rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                <label className="mb-2 block text-sm font-semibold text-[#d4af37]">Add More Gallery Photos</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setGalleryPhotos(Array.from(e.target.files || []))} className="w-full rounded border border-[#2a3550] bg-[#111a2e] p-3 text-sm text-white" />
                {galleryPhotos.length > 0 && <p className="mt-2 text-xs text-[#d4af37]">{galleryPhotos.length} new photo{galleryPhotos.length === 1 ? "" : "s"} selected.</p>}
              </div>
            </div>

            <button onClick={saveMemorial} disabled={saving} className="w-full rounded-xl bg-[#d4af37] py-4 font-semibold text-black transition hover:opacity-90">
              {saving ? "Saving Updates..." : "Save Memorial Updates"}
            </button>
          </section>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-[#1f2a44] bg-[#111a2e]">
              <div className="relative min-h-[260px] bg-[#081827]">
                {memorial.cover_photo ? (
                  <img src={memorial.cover_photo} alt={memorial.full_name} className="h-full min-h-[260px] w-full object-cover" />
                ) : (
                  <div className="flex min-h-[260px] items-center justify-center text-6xl">🕯️</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">Preview</p>
                  <h2 className="mt-2 font-serif text-3xl">{fullName}</h2>
                </div>
              </div>
              <div className="p-5">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">Memorial Link</p>
                <div className="break-all rounded-lg bg-[#0b1320] p-3 text-sm text-gray-300">{memorialLink}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <h2 className="mb-4 font-serif text-2xl text-[#d4af37]">Gallery Manager</h2>
              {gallery.length === 0 ? (
                <p className="text-gray-400">No gallery photos uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {gallery.map((photo) => (
                    <div key={photo.id} className="overflow-hidden rounded-xl border border-[#1f2a44] bg-[#0b1320]">
                      <img src={photo.file_url?.startsWith("/") ? photo.file_url : `/${photo.file_url}`} alt="Gallery photo" className="h-32 w-full object-cover" />
                      <button onClick={() => deleteGalleryPhoto(photo.id)} className="w-full bg-red-900/70 px-3 py-2 text-xs text-red-100">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
