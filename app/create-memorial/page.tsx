"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function CreateMemorialForm() {
  const searchParams = useSearchParams();

  const packageSlug = searchParams.get("package") || "";
  const packagePrice = searchParams.get("price") || "0";

  const [loading, setLoading] = useState(false);

  const [creatorName, setCreatorName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [creatorPhone, setCreatorPhone] = useState("");
  const [creatorRelationship, setCreatorRelationship] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [memorialMusic, setMemorialMusic] = useState<File | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);

  const [enableFamilyTree, setEnableFamilyTree] = useState(false);
  const [enableReminders, setEnableReminders] = useState(false);

  const submitMemorial = async () => {
    if (!creatorName || !creatorEmail || !fullName) {
      alert("Please complete all required fields.");
      return;
    }

    if (!password || password.length < 6) {
      alert("Please create a password with at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const formData = new FormData();

    formData.append("creator_name", creatorName);
    formData.append("creator_email", creatorEmail);
    formData.append("creator_phone", creatorPhone);
    formData.append("creator_relationship", creatorRelationship);
    formData.append("password", password);

    formData.append("full_name", fullName);
    formData.append("birth_date", birthDate);
    formData.append("death_date", deathDate);
    formData.append("biography", biography);

    formData.append("package_slug", packageSlug);
    formData.append("package_name", packageSlug.replace(/-/g, " "));
    formData.append("package_price", packagePrice);

    formData.append("enable_family_tree", enableFamilyTree ? "1" : "0");
    formData.append("enable_reminders", enableReminders ? "1" : "0");

    if (coverPhoto) {
      formData.append("cover_photo", coverPhoto);
    }

    if (memorialMusic) {
      formData.append("memorial_music", memorialMusic);
    }

    galleryPhotos.forEach((photo) => {
      formData.append("gallery_photos", photo);
    });

    try {
      setLoading(true);

      const res = await fetch("/api/memorials", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create memorial");
        return;
      }

      if (Number(packagePrice) > 0) {
        const paymentRes = await fetch("/api/wipay-checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memorial_id: data.memorial.id,
            package_name: data.memorial.package_name,
            package_price: data.memorial.package_price,
            customer_name: creatorName,
          }),
        });

        const paymentData = await paymentRes.json();

        if (!paymentRes.ok) {
          alert(paymentData.error || "Payment setup failed");
          return;
        }

        window.location.href = paymentData.checkout_url;
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white placeholder:text-gray-500";

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-[#d4af37]">
            Begin the Journey
          </h1>

          <p className="mt-3 text-gray-400">
            Create a dedicated digital sanctuary for your loved one.
          </p>
        </div>

        <div className="space-y-8">
          {/* Selected Package */}
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#d4af37]">
              Selected Package
            </h2>

            <input readOnly value={packageSlug} className={inputStyle} />

            <input
              readOnly
              value={`$${packagePrice}`}
              className={`mt-4 ${inputStyle}`}
            />
          </div>

          {/* Your Information */}
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#d4af37]">
              Your Information
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                placeholder="Owner / Creator Full Name"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className={inputStyle}
              />

              <input
                type="email"
                placeholder="Owner / Creator Email Address"
                value={creatorEmail}
                onChange={(e) => setCreatorEmail(e.target.value)}
                className={inputStyle}
              />

              <input
                placeholder="Phone / WhatsApp Number"
                value={creatorPhone}
                onChange={(e) => setCreatorPhone(e.target.value)}
                className={inputStyle}
              />

              <input
                placeholder="Relationship to Loved One"
                value={creatorRelationship}
                onChange={(e) => setCreatorRelationship(e.target.value)}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Account Password */}
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#d4af37]">
              Create Your Login Password
            </h2>

            <p className="mb-4 text-sm text-gray-400">
              This password lets you log in later to manage this memorial.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputStyle}
              />
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Password must be at least 6 characters.
            </p>
          </div>

          {/* Memorial Details */}
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#d4af37]">
              Memorial Details
            </h2>

            <input
              placeholder="Loved One’s Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputStyle}
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={inputStyle}
              />

              <input
                type="date"
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
                className={inputStyle}
              />
            </div>

            <textarea
              placeholder="Tell Their Story (Biography)"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              rows={5}
              className={`mt-4 ${inputStyle}`}
            />

            <div className="mt-4">
              <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                Cover Photo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
                className={inputStyle}
              />

              <p className="mt-2 text-xs text-gray-500">
                This image appears at the top of the memorial page.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
              <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                Memorial Gallery Photos (Optional)
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setGalleryPhotos(Array.from(e.target.files || []))
                }
                className={inputStyle}
              />

              <p className="mt-2 text-xs text-gray-500">
                Upload multiple family photos for the memorial slideshow.
                Recommended: JPG, PNG, or WEBP.
              </p>

              {galleryPhotos.length > 0 && (
                <p className="mt-2 text-xs text-[#d4af37]">
                  {galleryPhotos.length} gallery photo
                  {galleryPhotos.length === 1 ? "" : "s"} selected.
                </p>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
              <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                Memorial Song (Optional)
              </label>

              <input
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
                onChange={(e) => setMemorialMusic(e.target.files?.[0] || null)}
                className={inputStyle}
              />

              <p className="mt-2 text-xs text-gray-500">
                Upload a special song, instrumental, or voice note for the
                slideshow. Recommended file types: MP3, WAV, or M4A.
              </p>
            </div>
          </div>

          {/* Additional Options */}
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <h2 className="mb-4 text-xl font-semibold text-[#d4af37]">
              Additional Options
            </h2>

            <label className="mb-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={enableFamilyTree}
                onChange={(e) => setEnableFamilyTree(e.target.checked)}
              />
              Enable Family Tree
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={enableReminders}
                onChange={(e) => setEnableReminders(e.target.checked)}
              />
              Enable Anniversary Reminders
            </label>
          </div>

          <button
            onClick={submitMemorial}
            disabled={loading}
            className="w-full rounded-lg bg-[#d4af37] py-4 font-semibold text-black"
          >
            {loading ? "Creating Memorial..." : "Continue to Payment"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CreateMemorialPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
          Loading form...
        </main>
      }
    >
      <CreateMemorialForm />
    </Suspense>
  );
}
