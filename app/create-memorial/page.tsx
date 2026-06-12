"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteHeader from "../components/SiteHeader";

type GiftOrder = {
  id: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  recipient_name: string;
  relationship: string | null;
  recipient_status: string | null;
  occasion: string | null;
  gift_message: string | null;
  delivery_method: string | null;
  package_name: string | null;
  package_price_usd: string | number | null;
  package_price_ttd: string | number | null;
  payment_status: string | null;
  gift_status: string | null;
  setup_token: string | null;
  memorial_id: number | null;
};

function slugifyPackageName(packageName: string) {
  return packageName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[—–]/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function CreateMemorialForm() {
  const searchParams = useSearchParams();

  const giftToken = searchParams.get("gift_token") || "";
  const isGiftSetup = Boolean(giftToken);

  const normalPackageSlug = searchParams.get("package") || "";
  const normalPackagePrice = searchParams.get("price") || "0";
  const refCode = searchParams.get("ref") || "";

  const rawPageType = searchParams.get("type") || "";
  const pageType =
    rawPageType === "living" || rawPageType === "memorial"
      ? rawPageType
      : isGiftSetup
      ? "memorial"
      : "memorial";

  const isLivingLegacy = pageType === "living";
  const isMemorialPage = pageType === "memorial";

  const pageTypeLabel = isLivingLegacy
    ? "Living Legacy Page"
    : "Memorial Page";

  const pageActionLabel = isLivingLegacy
    ? "Create Your Living Legacy Page"
    : "Create a Memorial Page";

  const personNameLabel = isLivingLegacy
    ? "Your Full Name *"
    : "Loved One’s Full Name *";

  const biographyLabel = isLivingLegacy
    ? "Tell Your Story / Life Journey"
    : "Tell Their Story / Biography";

  const dateOfPassingLabel = isLivingLegacy
    ? "Date of Passing Optional"
    : "Date of Passing";

  const creatorRelationshipLabel = isLivingLegacy
    ? "Who are you creating this for? Example: Myself"
    : "Relationship to Loved One";

  const [giftLoading, setGiftLoading] = useState(false);
  const [giftOrder, setGiftOrder] = useState<GiftOrder | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [creatorName, setCreatorName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [creatorPhone, setCreatorPhone] = useState("");
  const [creatorRelationship, setCreatorRelationship] = useState(
    isLivingLegacy ? "Myself" : ""
  );
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

  useEffect(() => {
    if (isLivingLegacy && !creatorRelationship) {
      setCreatorRelationship("Myself");
    }
  }, [isLivingLegacy, creatorRelationship]);

  useEffect(() => {
    const loadGiftOrder = async () => {
      if (!giftToken) return;

      try {
        setGiftLoading(true);
        setErrorMessage("");

        const res = await fetch(
          `/api/gift-orders/by-token?token=${encodeURIComponent(giftToken)}`
        );

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || "Unable to load gift order.");
          return;
        }

        const order = data.order as GiftOrder;
        setGiftOrder(order);

        setCreatorName(order.buyer_name || "");
        setCreatorEmail(order.buyer_email || "");
        setCreatorPhone(order.buyer_phone || "");
        setCreatorRelationship(order.relationship || "");
        setFullName(order.recipient_name || "");

        if (order.gift_message) {
          setBiography(order.gift_message);
        }
      } catch {
        setErrorMessage("Unable to load gift order.");
      } finally {
        setGiftLoading(false);
      }
    };

    loadGiftOrder();
  }, [giftToken]);

  const packageSlug = isGiftSetup
    ? slugifyPackageName(giftOrder?.package_name || "")
    : normalPackageSlug;

  const packagePrice = isGiftSetup
    ? String(giftOrder?.package_price_usd || "0")
    : normalPackagePrice;

  const packageName = isGiftSetup
    ? giftOrder?.package_name || "Gift Package"
    : normalPackageSlug
    ? normalPackageSlug
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

    if (isGiftSetup && !giftOrder) {
      showError("Gift order is not loaded yet. Please refresh and try again.");
      return;
    }

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
        isGiftSetup
          ? "This gift order does not have a valid package attached. Please contact ScanMyLegacy support."
          : "No package was selected. Please return to the Packages page and choose a plan."
      );
      return;
    }

    const formData = new FormData();

    formData.append("page_type", pageType);
    formData.append("legacy_type", pageType);

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
    formData.append("package_name", packageName);
    formData.append("package_price", packagePrice);
    formData.append("referral_code", refCode);

    formData.append("enable_family_tree", enableFamilyTree ? "1" : "0");
    formData.append("enable_reminders", enableReminders ? "1" : "0");

    if (isGiftSetup) {
      formData.append("gift_token", giftToken);
      formData.append("gift_order_id", String(giftOrder?.id || ""));
    }

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
        showError(
          data.error ||
            `Failed to create ${pageTypeLabel.toLowerCase()}. Please try again.`
        );
        return;
      }

      if (isGiftSetup) {
        await fetch("/api/memorials/activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memorial_id: data.memorial.id,
          }),
        });

        await fetch("/api/gift-orders/link-memorial", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gift_token: giftToken,
            memorial_id: data.memorial.id,
          }),
        });

        window.location.href = "/dashboard";
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

  if (giftLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
        <div className="rounded-2xl border border-[#d4af37]/25 bg-[#111a2e] p-8 text-center">
          Loading Legacy Gift...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <SiteHeader />

      <section className="relative min-h-[62vh] overflow-hidden bg-[#26447F]">
        <img
          src="/images/create-hero.jpg"
          alt="Create a ScanMyLegacy page"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#26447F]/95 via-[#26447F]/84 to-[#0b1320]/50" />

        <div className="relative z-10 mx-auto flex min-h-[62vh] max-w-7xl items-center px-6 py-20 sm:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
              {isGiftSetup ? "Legacy Gift Setup" : pageTypeLabel}
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-7xl">
              {isGiftSetup
                ? "Your Legacy Gift is ready to begin."
                : isLivingLegacy
                ? "Begin preserving your story and wishes."
                : "Begin the journey of preserving a legacy."}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              {isGiftSetup
                ? "This package has already been selected and paid for. Complete the details below to begin preserving your loved one’s legacy."
                : isLivingLegacy
                ? "Create a private digital legacy page where your story, photos, videos, family messages, final wishes, and important instructions can be preserved for the people you love."
                : "Create a private digital sanctuary with photos, stories, music, tributes, and memories your family can visit anytime."}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            {isGiftSetup ? "Gift Memorial Setup" : pageActionLabel}
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl">
            {isLivingLegacy
              ? "Tell us about you and your legacy"
              : "Tell us about you and your loved one"}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-400">
            {isGiftSetup
              ? "No payment or package selection is needed. Your Legacy Gift package is already attached."
              : isLivingLegacy
              ? "Complete the details below. You can always add more stories, wishes, photos, and family messages from your dashboard later."
              : "Complete the details below. You can always manage and add more memories from your dashboard later."}
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
          <div className="rounded-3xl border border-[#d4af37]/25 bg-[#111a2e] p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                  {isGiftSetup
                    ? "Gift Package Already Selected"
                    : "Selected Package"}
                </p>

                <h3 className="font-serif text-3xl text-white">
                  {packageName}
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Page Type:{" "}
                  <span className="font-semibold text-[#d4af37]">
                    {pageTypeLabel}
                  </span>
                </p>

                {isGiftSetup && giftOrder && (
                  <p className="mt-2 text-sm text-gray-400">
                    Gift Order #{giftOrder.id} for {giftOrder.recipient_name}
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-[#d4af37]/30 bg-[#0b1320] px-6 py-4 text-center">
                <p className="text-sm text-gray-400">Package Price</p>
                <p className="text-2xl font-bold text-[#d4af37]">
                  ${packagePrice}
                </p>
              </div>
            </div>

            {!packageSlug && !isGiftSetup && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                No package was selected. Please return to the Packages page and
                choose a plan before continuing.
              </p>
            )}

            {isGiftSetup && (
              <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                This gift package is already paid/verified. The recipient will
                not be asked to choose a package or pay again.
              </p>
            )}

            {refCode && (
              <p className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-sm text-gray-300">
                Referral code applied:{" "}
                <span className="font-mono text-[#d4af37]">{refCode}</span>
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl sm:p-8">
            <div className="mb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Step 1
              </p>

              <h2 className="font-serif text-2xl sm:text-3xl">
                Your Information
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                This creates your owner account so you can manage this{" "}
                {pageTypeLabel.toLowerCase()} later.
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
                placeholder={creatorRelationshipLabel}
                value={creatorRelationship}
                onChange={(e) => setCreatorRelationship(e.target.value)}
                className={inputStyle}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl sm:p-8">
            <div className="mb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Step 2
              </p>

              <h2 className="font-serif text-2xl sm:text-3xl">
                Create Your Login Password
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                This password lets you log in later to manage this{" "}
                {pageTypeLabel.toLowerCase()}.
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

          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl sm:p-8">
            <div className="mb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Step 3
              </p>

              <h2 className="font-serif text-2xl sm:text-3xl">
                {isLivingLegacy ? "Legacy Details" : "Memorial Details"}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                {isLivingLegacy
                  ? "Add the first details for your living legacy page."
                  : "Add the first details for your loved one’s memorial page."}
              </p>
            </div>

            <input
              placeholder={personNameLabel}
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
                  {dateOfPassingLabel}
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
              placeholder={biographyLabel}
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
                This image appears at the top of the{" "}
                {pageTypeLabel.toLowerCase()}.
              </p>

              {coverPhoto && (
                <p className="mt-2 text-xs text-[#d4af37]">
                  Selected: {coverPhoto.name}
                </p>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-[#d4af37]/20 bg-[#0b1320] p-5">
              <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                Gallery Photos Optional
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
                Upload multiple family photos for the slideshow. Recommended:
                JPG, PNG, or WEBP.
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
                {isLivingLegacy
                  ? "Legacy Song / Voice Note Optional"
                  : "Memorial Song Optional"}
              </label>

              <input
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
                onChange={(e) => setMemorialMusic(e.target.files?.[0] || null)}
                className={fileInputStyle}
              />

              <p className="mt-2 text-xs text-gray-500">
                {isLivingLegacy
                  ? "Upload a special song, blessing, voice note, or message for your legacy page. Recommended file types: MP3, WAV, or M4A."
                  : "Upload a special song, instrumental, or voice note for the slideshow. Recommended file types: MP3, WAV, or M4A."}
              </p>

              {memorialMusic && (
                <p className="mt-2 text-xs text-[#d4af37]">
                  Selected: {memorialMusic.name}
                </p>
              )}
            </div>
          </div>

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
                    Prepare this page for future remembrance reminders when
                    email reminders are enabled.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={submitMemorial}
            disabled={loading || (!packageSlug && !isGiftSetup)}
            className="w-full rounded-full bg-[#d4af37] py-4 font-semibold text-[#0b1320] shadow-xl transition hover:scale-[1.01] hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? isLivingLegacy
                ? "Creating Legacy Page..."
                : "Creating Memorial..."
              : isGiftSetup
              ? "Create Gift Memorial"
              : isPaidPackage
              ? "Continue to Payment"
              : isLivingLegacy
              ? "Create Free Legacy Page"
              : "Create Free Memorial"}
          </button>

          <p className="text-center text-sm text-gray-500">
            {isGiftSetup
              ? "This gift package has already been paid for. You will not be asked to pay again."
              : `You’ll be able to manage this ${pageTypeLabel.toLowerCase()} from your dashboard after it is created.`}
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