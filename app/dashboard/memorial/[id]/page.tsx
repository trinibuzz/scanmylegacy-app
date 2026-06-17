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
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [reactions, setReactions] = useState<any[]>([]);

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");

  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [memorialMusic, setMemorialMusic] = useState<File | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<File[]>([]);

  const safeMediaPath = (pathValue: any) => {
    if (!pathValue) return "";

    let cleanPath = String(pathValue).trim();
    cleanPath = cleanPath.replace(/\\/g, "/");

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    cleanPath = cleanPath.replace(/^public\//, "");
    cleanPath = cleanPath.replace(/^\/public\//, "/");

    if (!cleanPath.startsWith("/")) {
      cleanPath = `/${cleanPath}`;
    }

    return encodeURI(cleanPath);
  };

  const loadChatMessages = async (memorialIdToLoad: string) => {
    try {
      setLoadingChat(true);

      const res = await fetch(
        `/api/memorial-chat?memorial_id=${memorialIdToLoad}`
      );

      const data = await res.json();

      if (res.ok) {
        setChatMessages(data.messages || []);
      }
    } catch {
      setChatMessages([]);
    } finally {
      setLoadingChat(false);
    }
  };

  const loadMemorial = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/dashboard/memorial/${id}`);
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Unable to load page.");
        window.location.href = "/dashboard";
        return;
      }

      setMemorial(data.memorial);
      setGallery(data.gallery || []);
      setReactions(data.reactions || []);

      setFullName(data.memorial.full_name || "");
      setBirthDate(
        data.memorial.birth_date ? data.memorial.birth_date.slice(0, 10) : ""
      );
      setDeathDate(
        data.memorial.death_date ? data.memorial.death_date.slice(0, 10) : ""
      );
      setBiography(data.memorial.biography || "");

      await loadChatMessages(String(data.memorial.id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadMemorial();
  }, [id]);

  const pageType = memorial?.page_type === "living" ? "living" : "memorial";
  const isLivingLegacy = pageType === "living";

  const pageName = isLivingLegacy ? "Living Legacy" : "Memorial";
  const pageNameLower = isLivingLegacy ? "living legacy page" : "memorial";
  const manageTitle = isLivingLegacy
    ? "Manage Living Legacy"
    : "Manage Memorial";
  const loadingText = isLivingLegacy
    ? "Loading legacy editor..."
    : "Loading memorial editor...";
  const notFoundText = isLivingLegacy
    ? "Living Legacy page not found."
    : "Memorial not found.";
  const detailsTitle = isLivingLegacy ? "Legacy Details" : "Memorial Details";
  const namePlaceholder = isLivingLegacy
    ? "Full Name"
    : "Loved One’s Full Name";
  const biographyPlaceholder = isLivingLegacy
    ? "My Story / Life Journey"
    : "Biography / Life Story";
  const coverPhotoLabel = isLivingLegacy
    ? "Change Legacy Cover Photo"
    : "Change Cover Photo";
  const musicLabel = isLivingLegacy
    ? "Change Legacy Song / Voice Note"
    : "Change Memorial Song";
  const saveButtonLabel = isLivingLegacy
    ? "Save Legacy Updates"
    : "Save Memorial Updates";
  const successMessage = isLivingLegacy
    ? "Living Legacy updated successfully."
    : "Memorial updated successfully.";
  const viewButtonLabel = isLivingLegacy
    ? "View Legacy Page"
    : "View Memorial";
  const linkLabel = isLivingLegacy ? "Legacy Link" : "Memorial Link";
  const galleryTitle = isLivingLegacy
    ? "Legacy Gallery Manager"
    : "Gallery Manager";
  const noGalleryText = isLivingLegacy
    ? "No legacy photos uploaded yet."
    : "No gallery photos uploaded yet.";
  const paymentExpiredText = isLivingLegacy
    ? "This living legacy page was temporarily active while bank transfer payment was being reviewed. Payment was not verified within 48 hours, so editing is now temporarily disabled until payment is confirmed by admin."
    : "This memorial was temporarily active while bank transfer payment was being reviewed. Payment was not verified within 48 hours, so editing is now temporarily disabled until payment is confirmed by admin.";
  const bankReviewText = isLivingLegacy
    ? "Your living legacy page is temporarily active while your bank transfer is being reviewed. You can view and manage this page during this review period."
    : "Your memorial is temporarily active while your bank transfer is being reviewed. You can view and manage this memorial during this review period.";

  const reactionsTitle = isLivingLegacy
    ? "Blessings & Flowers Manager"
    : "Candles & Flowers Manager";

  const noReactionsText = isLivingLegacy
    ? "No blessings or flowers have been posted yet."
    : "No candles or flowers have been posted yet.";

  const flowerOptions: any = {
    rose: "🌹",
    tulip: "🌷",
    sunflower: "🌻",
    lily: "🌸",
    hibiscus: "🌺",
    orchid: "💮",
  };

  const now = new Date();

  const paymentDueAt = memorial?.payment_due_at
    ? new Date(memorial.payment_due_at)
    : null;

  const isPendingBankTransfer =
    memorial?.payment_status === "pending_bank_transfer";

  const isExpiredBankTransfer =
    memorial?.payment_status === "expired_bank_transfer" ||
    (isPendingBankTransfer &&
      paymentDueAt &&
      now.getTime() > paymentDueAt.getTime());

  const bankTransferStillActive =
    isPendingBankTransfer &&
    paymentDueAt &&
    now.getTime() <= paymentDueAt.getTime();

  const hoursLeft =
    bankTransferStillActive && paymentDueAt
      ? Math.max(
          0,
          Math.ceil(
            (paymentDueAt.getTime() - now.getTime()) / (1000 * 60 * 60)
          )
        )
      : 0;

  const canManage = !isExpiredBankTransfer;

  const saveMemorial = async () => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

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
        alert(data.error || `Failed to update ${pageNameLower}.`);
        return;
      }

      alert(successMessage);
      setCoverPhoto(null);
      setMemorialMusic(null);
      setGalleryPhotos([]);
      await loadMemorial();
    } finally {
      setSaving(false);
    }
  };

  const deleteGalleryPhoto = async (galleryId: number) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const confirmed = confirm(`Remove this photo from the ${pageNameLower}?`);
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

  const deleteChatMessage = async (messageId: number) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const confirmed = confirm(
      "Delete this chat message? This will remove it from the public family chat."
    );

    if (!confirmed) return;

    const res = await fetch("/api/memorial-chat", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_id: messageId,
        memorial_id: memorial.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete chat message.");
      return;
    }

    await loadChatMessages(String(memorial.id));
  };

  const editReaction = async (reaction: any) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const newMessage = prompt(
      "Edit the blessing / flower message:",
      reaction.message || ""
    );

    if (newMessage === null) return;

    let newFlowerType = reaction.flower_type || "rose";

    if (reaction.reaction_type === "flower") {
      const flowerPrompt = prompt(
        "Flower type: rose, tulip, sunflower, lily, hibiscus, or orchid",
        newFlowerType
      );

      if (flowerPrompt === null) return;

      newFlowerType = flowerPrompt.trim().toLowerCase() || "rose";
    }

    const res = await fetch(`/api/dashboard/memorial/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "edit_reaction",
        reaction_id: reaction.id,
        message: newMessage,
        flower_type: newFlowerType,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to update blessing or flower.");
      return;
    }

    alert(data.message || "Blessing or flower updated.");
    await loadMemorial();
  };

  const deleteReaction = async (reaction: any) => {
    if (!canManage) {
      alert(
        `This ${pageNameLower} is temporarily deactivated because payment was not verified within 48 hours.`
      );
      return;
    }

    const label =
      reaction.reaction_type === "flower"
        ? "flower"
        : isLivingLegacy
        ? "blessing"
        : "candle";

    const confirmed = confirm(
      `Delete this ${label}? This will remove it from the public page.`
    );

    if (!confirmed) return;

    const res = await fetch(`/api/dashboard/memorial/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reaction_id: reaction.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to delete blessing or flower.");
      return;
    }

    await loadMemorial();
  };

  const formatDateTime = (dateValue: string) => {
    if (!dateValue) return "";

    return new Date(dateValue).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderChatMedia = (msg: any) => {
    if (msg.image_url) {
      return (
        <img
          src={safeMediaPath(msg.image_url)}
          alt="Chat image"
          className="mt-3 max-h-[260px] w-full rounded-xl object-cover"
        />
      );
    }

    if (msg.video_url) {
      return (
        <video controls className="mt-3 w-full rounded-xl">
          <source src={safeMediaPath(msg.video_url)} />
        </video>
      );
    }

    if (msg.audio_url) {
      return (
        <div className="mt-3 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-3">
          <p className="mb-2 text-xs font-semibold text-[#d4af37]">
            🎙️ Voice Note / Audio
          </p>

          <audio controls className="w-full">
            <source src={safeMediaPath(msg.audio_url)} />
          </audio>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
        {loadingText}
      </main>
    );
  }

  if (!memorial) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
        {notFoundText}
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

          <h1 className="font-serif text-4xl font-bold">{manageTitle}</h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            {isLivingLegacy
              ? "Update your story, media, gallery, and manage visitor chat messages."
              : "Update your loved one’s story, media, gallery, and manage visitor chat messages."}
          </p>
        </div>

        {bankTransferStillActive && (
          <div className="mb-8 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-5 text-yellow-100 shadow-xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em]">
              Bank Transfer Under Review
            </p>

            <p className="leading-relaxed">
              {bankReviewText} About {hoursLeft} hour
              {hoursLeft === 1 ? "" : "s"} left before automatic deactivation
              if payment is not verified.
            </p>
          </div>
        )}

        {isExpiredBankTransfer && (
          <div className="mb-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-5 text-red-100 shadow-xl">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em]">
              Payment Review Expired
            </p>

            <p className="leading-relaxed">{paymentExpiredText}</p>
          </div>
        )}

        <div className="mb-8 flex flex-wrap gap-3">
          <a
            href="/dashboard"
            className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold text-[#d4af37]"
          >
            Back to Dashboard
          </a>

          {!isExpiredBankTransfer ? (
            <a
              href={memorialLink}
              target="_blank"
              className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
            >
              {viewButtonLabel}
            </a>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-lg bg-gray-700 px-5 py-3 text-sm font-semibold text-gray-300"
            >
              Awaiting Payment Verification
            </button>
          )}

          {Number(memorial.enable_family_tree) === 1 && (
            <a
              href={`/family-tree/${memorial.id}`}
              className="rounded-lg border border-[#d4af37]/50 bg-[#111a2e] px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
            >
              Manage Family Tree
            </a>
          )}
        </div>

        <div
          className={`grid gap-8 lg:grid-cols-[1.2fr_0.8fr] ${
            !canManage ? "opacity-70" : ""
          }`}
        >
          <section className="space-y-6">
            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <h2 className="mb-5 font-serif text-2xl text-[#d4af37]">
                {detailsTitle}
              </h2>

              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={namePlaceholder}
                disabled={!canManage}
                className="mb-4 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  disabled={!canManage}
                  className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <input
                  type="date"
                  value={deathDate}
                  onChange={(e) => setDeathDate(e.target.value)}
                  disabled={!canManage}
                  className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <textarea
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                rows={8}
                placeholder={biographyPlaceholder}
                disabled={!canManage}
                className="w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <h2 className="mb-5 font-serif text-2xl text-[#d4af37]">
                Media Updates
              </h2>

              <div className="mb-5 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                  {coverPhotoLabel}
                </label>

                <input
                  type="file"
                  accept="image/*"
                  disabled={!canManage}
                  onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
                  className="w-full rounded border border-[#2a3550] bg-[#111a2e] p-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                {coverPhoto && (
                  <p className="mt-2 text-xs text-[#d4af37]">
                    Selected: {coverPhoto.name}
                  </p>
                )}
              </div>

              <div className="mb-5 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                  {musicLabel}
                </label>

                <input
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a,.mp3,.wav,.m4a"
                  disabled={!canManage}
                  onChange={(e) =>
                    setMemorialMusic(e.target.files?.[0] || null)
                  }
                  className="w-full rounded border border-[#2a3550] bg-[#111a2e] p-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                {memorialMusic && (
                  <p className="mt-2 text-xs text-[#d4af37]">
                    Selected: {memorialMusic.name}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                  Add More Gallery Photos
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={!canManage}
                  onChange={(e) =>
                    setGalleryPhotos(Array.from(e.target.files || []))
                  }
                  className="w-full rounded border border-[#2a3550] bg-[#111a2e] p-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                {galleryPhotos.length > 0 && (
                  <p className="mt-2 text-xs text-[#d4af37]">
                    {galleryPhotos.length} new photo
                    {galleryPhotos.length === 1 ? "" : "s"} selected.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={saveMemorial}
              disabled={saving || !canManage}
              className="w-full rounded-xl bg-[#d4af37] py-4 font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
            >
              {isExpiredBankTransfer
                ? "Awaiting Payment Verification"
                : saving
                ? "Saving Updates..."
                : saveButtonLabel}
            </button>

            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-[#d4af37]">
                    Chat Message Manager
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Review and remove messages from the public family chat.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadChatMessages(String(memorial.id))}
                  className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-sm font-semibold text-[#d4af37]"
                >
                  Refresh
                </button>
              </div>

              {loadingChat ? (
                <p className="text-gray-400">Loading chat messages...</p>
              ) : chatMessages.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d4af37]/25 bg-[#0b1320] p-5 text-center text-sm text-gray-400">
                  No chat messages yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {msg.guest_name}
                          </p>

                          <p className="text-xs text-gray-500">
                            {formatDateTime(msg.created_at)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteChatMessage(msg.id)}
                          disabled={!canManage}
                          className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>

                      {msg.body && (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                          {msg.body}
                        </p>
                      )}

                      {renderChatMedia(msg)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl text-[#d4af37]">
                    {reactionsTitle}
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Correct spelling, change flower type, or remove unwanted
                    blessings and flowers from the public page.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadMemorial}
                  className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-sm font-semibold text-[#d4af37]"
                >
                  Refresh
                </button>
              </div>

              {reactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d4af37]/25 bg-[#0b1320] p-5 text-center text-sm text-gray-400">
                  {noReactionsText}
                </div>
              ) : (
                <div className="space-y-4">
                  {reactions.map((reaction) => {
                    const isFlower = reaction.reaction_type === "flower";
                    const reactionLabel = isFlower
                      ? "Flower"
                      : isLivingLegacy
                      ? "Blessing"
                      : "Candle";
                    const selectedFlower =
                      flowerOptions[reaction.flower_type] || "🌸";

                    return (
                      <div
                        key={reaction.id}
                        className="rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-4"
                      >
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="mb-2 flex items-center gap-2">
                              <span className="text-2xl">
                                {isFlower
                                  ? selectedFlower
                                  : isLivingLegacy
                                  ? "❤️"
                                  : "🕯️"}
                              </span>

                              <span className="rounded-full border border-[#d4af37]/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]">
                                {reactionLabel}
                              </span>
                            </div>

                            <p className="font-semibold text-white">
                              {reaction.guest_name || "Someone"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {formatDateTime(reaction.created_at)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => editReaction(reaction)}
                              disabled={!canManage}
                              className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteReaction(reaction)}
                              disabled={!canManage}
                              className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {isFlower && reaction.flower_type && (
                          <p className="mb-2 text-xs text-gray-500">
                            Flower type: {reaction.flower_type}
                          </p>
                        )}

                        {reaction.message ? (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                            {reaction.message}
                          </p>
                        ) : (
                          <p className="text-sm italic text-gray-500">
                            No message entered.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-[#1f2a44] bg-[#111a2e]">
              <div className="relative min-h-[260px] bg-[#081827]">
                {memorial.cover_photo ? (
                  <img
                    src={safeMediaPath(memorial.cover_photo)}
                    alt={memorial.full_name}
                    className="h-full min-h-[260px] w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-[260px] items-center justify-center text-6xl">
                    {isLivingLegacy ? "✍️" : "🕯️"}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">
                    Preview
                  </p>

                  <h2 className="mt-2 font-serif text-3xl">{fullName}</h2>
                </div>
              </div>

              <div className="p-5">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                  {linkLabel}
                </p>

                <div className="break-all rounded-lg bg-[#0b1320] p-3 text-sm text-gray-300">
                  {memorialLink}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
              <h2 className="mb-4 font-serif text-2xl text-[#d4af37]">
                {galleryTitle}
              </h2>

              {gallery.length === 0 ? (
                <p className="text-gray-400">{noGalleryText}</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {gallery.map((photo) => (
                    <div
                      key={photo.id}
                      className="overflow-hidden rounded-xl border border-[#1f2a44] bg-[#0b1320]"
                    >
                      <img
                        src={safeMediaPath(photo.file_url)}
                        alt="Gallery photo"
                        className="h-32 w-full object-cover"
                      />

                      <button
                        onClick={() => deleteGalleryPhoto(photo.id)}
                        disabled={!canManage}
                        className="w-full bg-red-900/70 px-3 py-2 text-xs text-red-100 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-300"
                      >
                        Remove
                      </button>
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