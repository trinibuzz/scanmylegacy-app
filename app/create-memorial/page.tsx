"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteHeader from "../components/SiteHeader";

function CreateMemorialForm() {
  const searchParams = useSearchParams();

  const packageSlug = searchParams.get("package") || "";
  const packagePrice = searchParams.get("price") || "0";
  const refCode = searchParams.get("ref") || "";

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const packageName = packageSlug
    ? packageSlug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "No package selected";

  const isPaidPackage = Number(packagePrice) > 0;

  const showError = (message: string) => {
    setErrorMessage(message);

    setTimeout(() => {
      document
        .getElementById("create-memorial-error")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const submitMemorial = async () => {
    setErrorMessage("");

    if (!creatorName || !creatorEmail || !fullName) {
      showError("Please complete all required fields before continuing.");
      return;
    }

    if (!password || password.length < 6) {
      showError("Please create a password with at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match. Please check and try again.");
      return;
    }

    if (!packageSlug) {
      showError(
        "No package was selected. Please return to the Packages page and choose a plan."
      );
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
    formData.append("referral_code", refCode);

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
        showError(data.error || "Failed to create memorial. Please try again.");
        return;
      }

      if (Number(packagePrice) > 0) {
        const paymentOptionsUrl = `/payment-option?memorial_id=${encodeURIComponent(
          data.memorial.id
        )}&package_name=${encodeURIComponent(
          data.memorial.package_name
        )}&package_price=${encodeURIComponent(
          data.memorial.package_price
        )}&customer_name=${encodeURIComponent(creatorName)}`;

        window.location.href = paymentOptionsUrl;
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      showError(
        "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle =
    "w-full rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100";

  const fileInputStyle =
    "w-full cursor-pointer rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-[#d4af37] file:px-4 file:py-2 file:font-semibold file:text-[#0b1320] hover:border-[#d4af37]/60";

  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-[62vh] overflow-hidden bg-[#26447F]">
        <img
          src="/images/create-hero.jpg"
          alt="Create a ScanMyLegacy memorial"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#26447F]/95 via-[#26447F]/84 to-[#0b1320]/50" />

        <div className="relative z-10 mx-auto flex min-h-[62vh] max-w-7xl items-center px-6 py-20 sm:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
              Create Memorial
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-7xl">
              Begin the journey of preserving a legacy.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              Create a private digital sanctuary with photos, stories, music,
              tributes, and memories your family can visit anytime.
            </p>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            Memorial Setup
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl">
            Tell us about you and your loved one
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            Complete the details below. You can always manage and add more
            memories from your dashboard later.
          </p>
        </div>

        {errorMessage && (
          <div
            id="create-memorial-error"
            className="mb-8 rounded-2xl border border-red-400/40 bg-red-500/10 p-5 text-center shadow-xl"
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-red-300">
              Please Check This
            </p>

            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-red-100 sm:text-base">
              {errorMessage}
            </p>

            {errorMessage.toLowerCase().includes("free trial") && (
              <a
                href="/packages?expired=1"
                className="mt-4 inline-block rounded-full bg-[#d4af37] px-6 py-3 text-sm font-semibold text-[#0b1320] transition hover:bg-[#f0c94a]"
              >
                Choose a Paid Package
              </a>
            )}
          </div>
        )}

        <div className="space-y-8">
          {/* Selected Package */}
          <div className="rounded-3xl border border-[#d4af37]/25 bg-[#111a2e] p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                  Selected Package
                </p>

                <h3 className="font-serif text-3xl text-white">
                  {packageName}
                </h3>
              </div>

              <div className="rounded-2xl border border-[#d4af37]/30 bg-[#0b1320] px-6 py-4 text-center">
                <p className="text-sm text-gray-400">Package Price</p>
                <p className="text-2xl font-bold text-[#d4af37]">
                  ${packagePrice}
                </p>
              </div>
            </div>

            {!packageSlug && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                No package was selected. Please return to the Packages page and
                choose a plan before continuing.
              </p>
            )}

            {refCode && (
              <p className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-sm text-gray-300">
                Referral code applied:{" "}
                <span className="font-mono text-[#d4af37]">{refCode}</span>
              </p>
            )}
          </div>

          {/* Your Information */}
          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl sm:p-8">
            <div className="mb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Step 1
              </p>

              <h2 className="font-serif text-2xl sm:text-3xl">
                Your Information
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                This creates your owner account so you can manage the memorial
                later.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                placeholder="Owner / Creator Full Name *"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className={inputStyle}
              />

              <input
                type="email"
                placeholder="Owner / Creator Email Address *"
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
          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl sm:p-8">
            <div className="mb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Step 2
              </p>

              <h2 className="font-serif text-2xl sm:text-3xl">
                Create Your Login Password
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                This password lets you log in later to manage this memorial.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="password"
                placeholder="Create Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
              />

              <input
                type="password"
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputStyle}
              />
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Password must be at least 6 characters.
            </p>
          </div>

          {/* Memorial Details */}
          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl sm:p-8">
            <div className="mb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Step 3
              </p>

              <h2 className="font-serif text-2xl sm:text-3xl">
                Memorial Details
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Add the first details for your loved one’s memorial page.
              </p>
            </div>

            <input
              placeholder="Loved One’s Full Name *"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputStyle}
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                  Date of Passing
                </label>
                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  className={inputStyle}
                />
              </div>
            </div>

            <textarea
              placeholder="Tell Their Story (Biography)"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              rows={6}
              className={`mt-4 ${inputStyle}`}
            />

            <div className="mt-6 rounded-2xl border border-[#d4af37]/20 bg-[#0b1320] p-5">
              <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                Cover Photo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
                className={fileInputStyle}
              />

              <p className="mt-2 text-xs text-gray-500">
                This image appears at the top of the memorial page.
              </p>

              {coverPhoto && (
                <p className="mt-2 text-xs text-[#d4af37]">
                  Selected: {coverPhoto.name}
                </p>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-[#d4af37]/20 bg-[#0b1320] p-5">
              <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                Memorial Gallery Photos Optional
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  setGalleryPhotos(Array.from(e.target.files || []))
                }
                className={fileInputStyle}
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

            <div className="mt-4 rounded-2xl border border-[#d4af37]/20 bg-[#0b1320] p-5">
              <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                Memorial Song Optional
              </label>

              <input
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
                onChange={(e) => setMemorialMusic(e.target.files?.[0] || null)}
                className={fileInputStyle}
              />

              <p className="mt-2 text-xs text-gray-500">
                Upload a special song, instrumental, or voice note for the
                slideshow. Recommended file types: MP3, WAV, or M4A.
              </p>

              {memorialMusic && (
                <p className="mt-2 text-xs text-[#d4af37]">
                  Selected: {memorialMusic.name}
                </p>
              )}
            </div>
          </div>

          {/* Additional Options */}
          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl sm:p-8">
            <div className="mb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Step 4
              </p>

              <h2 className="font-serif text-2xl sm:text-3xl">
                Additional Options
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[#d4af37]/20 bg-[#0b1320] p-5 transition hover:border-[#d4af37]/60">
                <input
                  type="checkbox"
                  checked={enableFamilyTree}
                  onChange={(e) => setEnableFamilyTree(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold text-[#d4af37]">
                    Enable Family Tree
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-gray-400">
                    Add a family tree section to help future generations
                    understand their roots.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-[#d4af37]/20 bg-[#0b1320] p-5 transition hover:border-[#d4af37]/60">
                <input
                  type="checkbox"
                  checked={enableReminders}
                  onChange={(e) => setEnableReminders(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-semibold text-[#d4af37]">
                    Enable Anniversary Reminders
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-gray-400">
                    Prepare this memorial for future remembrance reminders when
                    email reminders are enabled.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={submitMemorial}
            disabled={loading || !packageSlug}
            className="w-full rounded-full bg-[#d4af37] py-4 font-semibold text-[#0b1320] shadow-xl transition hover:scale-[1.01] hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating Memorial..."
              : isPaidPackage
              ? "Continue to Payment"
              : "Create Free Memorial"}
          </button>

          <p className="text-center text-sm text-gray-500">
            You’ll be able to manage this memorial from your dashboard after it
            is created.
          </p>
        </div>
      </section>
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