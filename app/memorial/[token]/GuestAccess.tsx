"use client";

import { useEffect, useState } from "react";
import FamilyTreeView from "./FamilyTreeView";
import ChatBox from "./ChatBox";

type ActiveSection =
  | "story"
  | "blessings"
  | "flowers"
  | "family-tree"
  | "chat"
  | "messages";

export default function GuestAccess({ memorial, token }: any) {
  const [allowed, setAllowed] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [visitorCount, setVisitorCount] = useState(0);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("story");

  const [messageName, setMessageName] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [entries, setEntries] = useState<any[]>([]);

  const [candles, setCandles] = useState(0);
  const [flowers, setFlowers] = useState(0);
  const [reactions, setReactions] = useState<any[]>([]);

  const [showCandleModal, setShowCandleModal] = useState(false);
  const [showFlowerModal, setShowFlowerModal] = useState(false);
  const [tributeName, setTributeName] = useState("");
  const [tributeMessage, setTributeMessage] = useState("");
  const [flowerType, setFlowerType] = useState("rose");

  const pageType = memorial.page_type === "living" ? "living" : "memorial";
  const isLivingLegacy = pageType === "living";

  const pageTypeLabel = isLivingLegacy ? "Living Legacy" : "Memorial Tribute";
  const pageTypeFullLabel = isLivingLegacy
    ? "Living Legacy Page"
    : "Memorial Page";

  const pageTitlePrefix = isLivingLegacy
    ? "Living Legacy of"
    : "In Loving Memory";

  const enterButtonLabel = isLivingLegacy
    ? "Enter Legacy Page"
    : "Enter Memorial";

  const shareButtonLabel = isLivingLegacy
    ? "Share Legacy Page"
    : "Share Memorial";

  const pageLinkCopiedLabel = isLivingLegacy
    ? "Legacy page link copied to clipboard"
    : "Memorial link copied to clipboard";

  const slideshowTitle = isLivingLegacy
    ? "Legacy Slideshow"
    : "Memorial Slideshow";

  const slideshowDescription = isLivingLegacy
    ? "A beautiful collection of photos, milestones, family moments, and memories that tell the story of this living legacy."
    : "A beautiful collection of memories that gently plays through each photo like a tribute film.";

  const musicButtonText = isLivingLegacy ? "Legacy Music" : "Memorial Music";
  const lifeStoryTitle = isLivingLegacy ? "My Life Story" : "Life Story";
  const guestbookTitle = isLivingLegacy ? "Family Messages" : "Guestbook";

  const guestbookPlaceholder = isLivingLegacy
    ? "Write a message, memory, blessing, or words of love..."
    : "Write a message, memory, tribute, or words of comfort...";

  const noGuestbookText = isLivingLegacy
    ? "No family messages yet."
    : "No guestbook messages yet.";

  const candleActionLabel = isLivingLegacy
    ? "Leave a Blessing"
    : "Light a Candle";

  const candleRoomTitle = isLivingLegacy ? "Blessings" : "Candle Room";
  const candleCountText = isLivingLegacy ? "blessings left" : "candles lit";

  const candleEmptyText = isLivingLegacy
    ? "No blessings left yet."
    : "No candles lit yet.";

  const candleModalTitle = isLivingLegacy
    ? "Leave a Blessing"
    : "Light a Candle";

  const candleSubmitLabel = isLivingLegacy
    ? "Leave Blessing"
    : "Light Candle";

  const candleAlertText = isLivingLegacy
    ? "Blessing left ❤️"
    : "Candle lit 🕯️";

  const flowerActionLabel = isLivingLegacy ? "Send Flowers" : "Plant a Flower";

  const flowerCountText = isLivingLegacy
    ? "flowers sent"
    : "flowers planted";

  const flowerEmptyText = isLivingLegacy
    ? "No flowers sent yet."
    : "No flowers planted yet.";

  const flowerSubmitLabel = isLivingLegacy ? "Send Flowers" : "Plant Flower";
  const flowerByLabel = isLivingLegacy ? "Sent by" : "Planted by";

  const flowerAlertText = isLivingLegacy
    ? "Flowers sent 🌸"
    : "Flower planted 🌸";

  const heroSubText = isLivingLegacy
    ? "A living tribute filled with stories, memories, blessings, family love, and legacy."
    : "A lasting tribute filled with memories, love, family history, and heartfelt messages.";

  const entryHeading = isLivingLegacy
    ? "You’re invited to visit this Living Legacy"
    : "You’re invited to visit this Memorial Tribute";

  const entryDescription = isLivingLegacy
    ? "Enter your name to view this private legacy page, explore the story, share blessings, send flowers, and connect with family."
    : "Enter your name to view this private memorial, explore memories, light a candle, plant a flower, and leave a tribute.";

  const storyEmptyText = isLivingLegacy
    ? "No life story added yet."
    : "No story added yet.";

  const flowerOptions: any = {
    rose: "🌹",
    tulip: "🌷",
    sunflower: "🌻",
    lily: "🌸",
    hibiscus: "🌺",
    orchid: "💮",
  };

  const candleReactions = reactions.filter(
    (reaction) => reaction.reaction_type === "candle"
  );

  const flowerReactions = reactions.filter(
    (reaction) => reaction.reaction_type === "flower"
  );

  const featureCards: {
    key: ActiveSection;
    icon: string;
    title: string;
    text: string;
  }[] = [
    {
      key: "story",
      icon: "📖",
      title: isLivingLegacy ? "My Legacy" : "Life Story",
      text: isLivingLegacy
        ? "Read the personal story and legacy journey."
        : "Read the life story and memories.",
    },
    {
      key: "blessings",
      icon: isLivingLegacy ? "❤️" : "🕯️",
      title: isLivingLegacy ? "Blessings" : "Candles",
      text: `${candles} ${candleCountText}`,
    },
    {
      key: "flowers",
      icon: "🌸",
      title: isLivingLegacy ? "Flowers" : "Flower Garden",
      text: `${flowers} ${flowerCountText}`,
    },
    {
      key: "family-tree",
      icon: "🌳",
      title: "Family Tree",
      text: "View family roots and branches.",
    },
    {
      key: "chat",
      icon: "💬",
      title: "Chatroom",
      text: "Share live messages with family.",
    },
    {
      key: "messages",
      icon: "✍️",
      title: isLivingLegacy ? "Family Messages" : "Guestbook",
      text: isLivingLegacy
        ? "Post memories, blessings, and love."
        : "Leave tributes and words of comfort.",
    },
  ];

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

  const navItems: {
    label: string;
    href: string;
    section: ActiveSection;
  }[] = [
    { label: "Slideshow", href: "#slideshow", section: "story" },
    {
      label: isLivingLegacy ? "My Story" : "Life Story",
      href: "#legacy-sections",
      section: "story",
    },
    {
      label: isLivingLegacy ? "Blessings" : "Tributes",
      href: "#legacy-sections",
      section: "blessings",
    },
    {
      label: "Family Tree",
      href: "#legacy-sections",
      section: "family-tree",
    },
    { label: "Chat", href: "#legacy-sections", section: "chat" },
    {
      label: isLivingLegacy ? "Messages" : "Guestbook",
      href: "#legacy-sections",
      section: "messages",
    },
  ];

  const publicNavItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Packages", href: "/packages" },
    { label: "FAQ", href: "/faq" },
    { label: "Login", href: "/login" },
  ];

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const goToSection = (section: ActiveSection, href = "#legacy-sections") => {
    setActiveSection(section);
    setMenuOpen(false);

    setTimeout(() => {
      const targetId = href.replace("#", "");
      document.getElementById(targetId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  };

  const MemorialHeader = ({ simple = false }: { simple?: boolean }) => (
    <header className="fixed left-0 right-0 top-0 z-[9999] border-b border-[#d4af37]/30 bg-[#0b1320] shadow-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <a
          href={simple ? "/" : "#top"}
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4af37]/50 bg-[#111a2e] text-lg">
            {isLivingLegacy ? "✍️" : "🕯️"}
          </div>

          <div>
            <div className="font-serif text-lg font-bold leading-tight text-white sm:text-xl">
              Scan<span className="text-[#d4af37]">My</span>Legacy
            </div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#d4af37]">
              {pageTypeLabel}
            </div>
          </div>
        </a>

        <nav className="hidden items-center gap-5 text-sm lg:flex">
          {publicNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-gray-300 transition hover:text-[#d4af37]"
            >
              {item.label}
            </a>
          ))}

          {!simple &&
            navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => goToSection(item.section, item.href)}
                className="text-gray-300 transition hover:text-[#d4af37]"
              >
                {item.label}
              </button>
            ))}

          <button
            type="button"
            onClick={shareMemorial}
            className="rounded-full bg-[#d4af37] px-5 py-2 font-semibold text-black transition hover:opacity-90"
          >
            {simple ? "Share" : shareButtonLabel}
          </button>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-2xl leading-none text-[#d4af37] lg:hidden"
          aria-label="Open memorial menu"
        >
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#d4af37]/20 bg-[#081827] px-4 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {publicNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-xl border border-[#1f2a44] bg-[#111a2e] px-4 py-3 text-sm font-semibold text-gray-200 transition hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                {item.label}
              </a>
            ))}

            {simple ? (
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  document
                    .getElementById("enter-memorial-box")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-xl border border-[#d4af37]/40 bg-[#111a2e] px-4 py-3 text-left text-sm font-semibold text-[#d4af37] transition hover:border-[#d4af37]"
              >
                {enterButtonLabel}
              </button>
            ) : (
              navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => goToSection(item.section, item.href)}
                  className="rounded-xl border border-[#1f2a44] bg-[#111a2e] px-4 py-3 text-left text-sm font-semibold text-gray-200 transition hover:border-[#d4af37] hover:text-[#d4af37]"
                >
                  {item.label}
                </button>
              ))
            )}

            <button
              type="button"
              onClick={() => {
                closeMenu();
                shareMemorial();
              }}
              className="mt-2 rounded-xl bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black"
            >
              {shareButtonLabel}
            </button>
          </div>
        </div>
      )}
    </header>
  );

  const galleryPhotos =
    memorial.gallery_photos && memorial.gallery_photos.length > 0
      ? memorial.gallery_photos.map((photo: any) => safeMediaPath(photo))
      : memorial.cover_photo
      ? [safeMediaPath(memorial.cover_photo)]
      : [];

  const loadGuestbook = async () => {
    const res = await fetch(`/api/guestbook?token=${token}`);
    const data = await res.json();
    setEntries(data.entries || []);
  };

  const loadReactions = async () => {
    const res = await fetch(`/api/reactions?token=${token}`);
    const data = await res.json();

    setCandles(data.candles || 0);
    setFlowers(data.flowers || 0);
    setReactions(data.reactions || []);
  };

  useEffect(() => {
    if (allowed) {
      loadGuestbook();
      loadReactions();
    }
  }, [allowed]);

  useEffect(() => {
    if (!isSlideshowPlaying || galleryPhotos.length <= 1) return;

    const interval = setInterval(() => {
      setActivePhoto((current) =>
        current === galleryPhotos.length - 1 ? 0 : current + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [isSlideshowPlaying, galleryPhotos.length]);

  const enterMemorial = async () => {
    if (!guestName.trim()) {
      alert("Please enter your name to continue.");
      return;
    }

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

    setMessageName(guestName);
    setTributeName(guestName);
    setVisitorCount(data.visitor_count || 0);
    setAllowed(true);
  };

  const shareMemorial = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: isLivingLegacy
          ? `${memorial.full_name} Living Legacy`
          : `${memorial.full_name} Memorial`,
        text: isLivingLegacy
          ? `Visit the living legacy page of ${memorial.full_name}`
          : `Visit the memorial of ${memorial.full_name}`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert(pageLinkCopiedLabel);
    }
  };

  const openCandleModal = () => {
    setTributeName(messageName || guestName);
    setTributeMessage("");
    setShowCandleModal(true);
  };

  const openFlowerModal = () => {
    setTributeName(messageName || guestName);
    setTributeMessage("");
    setFlowerType("rose");
    setShowFlowerModal(true);
  };

  const submitReaction = async (type: "candle" | "flower") => {
    if (!tributeName.trim()) {
      alert("Please enter your name");
      return;
    }

    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        reaction_type: type,
        guest_name: tributeName,
        message: tributeMessage,
        flower_type: type === "flower" ? flowerType : "",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    await loadReactions();

    setShowCandleModal(false);
    setShowFlowerModal(false);
    setTributeMessage("");

    if (type === "candle") alert(candleAlertText);
    if (type === "flower") alert(flowerAlertText);
  };

  const toggleMusic = () => {
    const audio = document.getElementById("memorial-music") as HTMLAudioElement;

    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {
          alert(`Please tap Play ${musicButtonText} again to start the audio.`);
        });
    }
  };

  const submitGuestbook = async () => {
    const formData = new FormData();

    formData.append("token", token);
    formData.append("guest_name", messageName);
    formData.append("message", message);

    if (image) formData.append("image", image);
    if (video) formData.append("video", video);
    if (audio) formData.append("audio", audio);

    const res = await fetch("/api/guestbook", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert(isLivingLegacy ? "Message posted ❤️" : "Guestbook message posted ❤️");

    setMessage("");
    setImage(null);
    setVideo(null);
    setAudio(null);

    await loadGuestbook();
  };

  const renderFeatureCards = () => (
    <section
      id="legacy-sections"
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
    >
      <div className="mb-5 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
          Explore This Legacy
        </p>

        <h2 className="font-serif text-3xl text-white">
          Choose What You Want To View
        </h2>

        <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-400">
          Tap a card below to open that section without making the page too
          long.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {featureCards.map((card) => {
          const isActive = activeSection === card.key;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setActiveSection(card.key)}
              className={`rounded-2xl border p-4 text-center shadow-xl transition hover:-translate-y-1 ${
                isActive
                  ? "border-[#d4af37] bg-[#d4af37] text-black"
                  : "border-[#d4af37]/20 bg-[#111a2e] text-white hover:border-[#d4af37]/70"
              }`}
            >
              <div className="mb-2 text-3xl">{card.icon}</div>

              <h3
                className={`font-serif text-lg ${
                  isActive ? "text-black" : "text-[#d4af37]"
                }`}
              >
                {card.title}
              </h3>

              <p
                className={`mt-2 text-xs leading-relaxed ${
                  isActive ? "text-black/75" : "text-gray-400"
                }`}
              >
                {card.text}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );

  if (!allowed) {
    return (
      <main className="min-h-screen bg-[#0b1320] text-white">
        <MemorialHeader simple />

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 pt-28">
          {memorial.cover_photo && (
            <img
              src={safeMediaPath(memorial.cover_photo)}
              alt={memorial.full_name}
              className="absolute inset-0 h-full w-full object-cover object-[center_20%] opacity-35"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1320]/80 via-[#0b1320]/90 to-[#0b1320]" />

          <div
            id="enter-memorial-box"
            className="relative z-10 w-full max-w-xl rounded-3xl border border-[#d4af37]/25 bg-[#111a2e]/95 p-6 text-center shadow-2xl backdrop-blur sm:p-8"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#0b1320] text-3xl">
              {isLivingLegacy ? "✍️" : "🕯️"}
            </div>

            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              {entryHeading}
            </p>

            <h1 className="mb-3 font-serif text-3xl text-white sm:text-4xl">
              {memorial.full_name}
            </h1>

            <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-gray-300">
              {entryDescription}
            </p>

            <div className="mb-6 rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-4 text-left">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]">
                Your Name
              </label>

              <input
                className="mb-3 w-full rounded-xl border border-[#2a3550] bg-[#111a2e] p-3 text-white outline-none transition focus:border-[#d4af37]"
                placeholder="Enter your name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />

              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]">
                Email Address Optional
              </label>

              <input
                className="w-full rounded-xl border border-[#2a3550] bg-[#111a2e] p-3 text-white outline-none transition focus:border-[#d4af37]"
                placeholder="Email Address (optional)"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>

            <button
              onClick={enterMemorial}
              className="w-full rounded-xl bg-[#d4af37] py-4 font-semibold text-black transition hover:opacity-90"
            >
              {enterButtonLabel}
            </button>

            <p className="mt-4 text-xs text-gray-500">
              Private {pageTypeFullLabel} powered by ScanMyLegacy.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <MemorialHeader />

      {showCandleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-2xl border border-[#d4af37]/40 bg-[#111a2e] p-6 shadow-2xl">
            <div className="mb-4 text-center text-5xl">
              {isLivingLegacy ? "❤️" : "🕯️"}
            </div>

            <h2 className="mb-4 text-center font-serif text-2xl text-[#d4af37]">
              {candleModalTitle}
            </h2>

            <input
              className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
              placeholder="Your Name"
              value={tributeName}
              onChange={(e) => setTributeName(e.target.value)}
            />

            <textarea
              className="mb-4 min-h-[100px] w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
              placeholder={
                isLivingLegacy
                  ? "Leave a blessing, words of love, or encouragement..."
                  : "Leave a short message..."
              }
              value={tributeMessage}
              onChange={(e) => setTributeMessage(e.target.value)}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => submitReaction("candle")}
                className="flex-1 rounded bg-[#d4af37] py-3 font-semibold text-black"
              >
                {candleSubmitLabel}
              </button>

              <button
                onClick={() => setShowCandleModal(false)}
                className="flex-1 rounded border border-gray-500 py-3 text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showFlowerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-2xl border border-[#d4af37]/40 bg-[#111a2e] p-6 shadow-2xl">
            <div className="mb-4 text-center text-5xl">
              {flowerOptions[flowerType]}
            </div>

            <h2 className="mb-4 text-center font-serif text-2xl text-[#d4af37]">
              {flowerActionLabel}
            </h2>

            <input
              className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
              placeholder="Your Name"
              value={tributeName}
              onChange={(e) => setTributeName(e.target.value)}
            />

            <select
              className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
              value={flowerType}
              onChange={(e) => setFlowerType(e.target.value)}
            >
              <option value="rose">Rose</option>
              <option value="tulip">Tulip</option>
              <option value="sunflower">Sunflower</option>
              <option value="lily">Lily</option>
              <option value="hibiscus">Hibiscus</option>
              <option value="orchid">Orchid</option>
            </select>

            <textarea
              className="mb-4 min-h-[100px] w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
              placeholder={
                isLivingLegacy
                  ? "Send flowers with a short message..."
                  : "Leave a short message..."
              }
              value={tributeMessage}
              onChange={(e) => setTributeMessage(e.target.value)}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => submitReaction("flower")}
                className="flex-1 rounded bg-[#d4af37] py-3 font-semibold text-black"
              >
                {flowerSubmitLabel}
              </button>

              <button
                onClick={() => setShowFlowerModal(false)}
                className="flex-1 rounded border border-gray-500 py-3 text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <section
        id="top"
        className="relative flex min-h-[75vh] items-center justify-center overflow-hidden pt-20 text-center"
      >
        {memorial.cover_photo && (
          <img
            src={safeMediaPath(memorial.cover_photo)}
            alt={memorial.full_name}
            className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#0b1320]/78 to-[#0b1320]" />

        <div className="relative z-10 mx-auto max-w-5xl px-6">
          <div className="mx-auto mb-6 w-fit rounded-full border border-[#d4af37]/30 bg-black/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37] backdrop-blur">
            {pageTypeFullLabel}
          </div>

          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#d4af37]">
            {pageTitlePrefix}
          </p>

          <h1 className="mb-5 font-serif text-4xl sm:text-5xl md:text-7xl">
            {memorial.full_name}
          </h1>

          <p className="mx-auto mb-5 max-w-2xl text-base leading-relaxed text-gray-300 sm:text-lg">
            {heroSubText}
          </p>

          <p className="mb-8 text-lg text-gray-300">
            {memorial.birth_date
              ? new Date(memorial.birth_date).toLocaleDateString()
              : ""}
            {isLivingLegacy
              ? memorial.death_date
                ? ` — ${new Date(memorial.death_date).toLocaleDateString()}`
                : " — Living Legacy"
              : ` — ${
                  memorial.death_date
                    ? new Date(memorial.death_date).toLocaleDateString()
                    : ""
                }`}
          </p>

          <div className="mx-auto mb-8 h-px max-w-md bg-[#d4af37]/40" />

          <button
            onClick={shareMemorial}
            className="rounded-xl border border-[#d4af37]/40 bg-black/30 px-6 py-3 text-sm font-semibold text-[#d4af37] backdrop-blur transition hover:bg-[#d4af37] hover:text-black"
          >
            {shareButtonLabel}
          </button>

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <div className="rounded-full border border-[#d4af37]/30 bg-black/30 px-4 py-2 text-sm text-gray-200 backdrop-blur">
              👁 {visitorCount} Visitors
            </div>

            <div className="rounded-full border border-[#d4af37]/30 bg-black/30 px-4 py-2 text-sm text-gray-200 backdrop-blur">
              💬 Family Chat Active
            </div>
          </div>
        </div>
      </section>

      {galleryPhotos.length > 0 && (
        <section
          id="slideshow"
          className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14"
        >
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              Treasured Moments
            </p>

            <h2 className="font-serif text-3xl md:text-4xl">
              {slideshowTitle}
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400">
              {slideshowDescription}
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] shadow-2xl">
            <div className="relative aspect-[16/9] overflow-hidden bg-black">
              <img
                key={activePhoto}
                src={galleryPhotos[activePhoto]}
                alt={slideshowTitle}
                className="block h-full w-full object-contain memorial-cinematic"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

              {galleryPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhoto(
                        activePhoto === 0
                          ? galleryPhotos.length - 1
                          : activePhoto - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-[#d4af37]/40 bg-black/50 px-4 py-3 text-2xl text-white backdrop-blur transition hover:bg-[#d4af37] hover:text-black"
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePhoto(
                        activePhoto === galleryPhotos.length - 1
                          ? 0
                          : activePhoto + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-[#d4af37]/40 bg-black/50 px-4 py-3 text-2xl text-white backdrop-blur transition hover:bg-[#d4af37] hover:text-black"
                  >
                    ›
                  </button>

                  <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-200">
                    {activePhoto + 1} / {galleryPhotos.length}
                  </div>
                </>
              )}
            </div>

            <audio id="memorial-music" loop>
              <source
                src={
                  memorial.memorial_music
                    ? safeMediaPath(memorial.memorial_music)
                    : "/music/memorial.mp3"
                }
                type="audio/mpeg"
              />
            </audio>

            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[#d4af37]/10 bg-[#081827]/90 px-4 py-4">
              <button
                type="button"
                onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                className="rounded-full border border-[#d4af37]/40 px-5 py-2 text-sm text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
              >
                {isSlideshowPlaying ? "Pause Slideshow" : "Play Slideshow"}
              </button>

              <button
                type="button"
                onClick={toggleMusic}
                className="rounded-full border border-[#d4af37]/40 px-5 py-2 text-sm text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
              >
                {isMusicPlaying ? "Pause Music" : `Play ${musicButtonText}`}
              </button>
            </div>

            {galleryPhotos.length > 1 && (
              <div className="grid grid-cols-3 gap-2 bg-[#081827]/80 p-3 sm:grid-cols-4 sm:gap-3 sm:p-4 md:grid-cols-6">
                {galleryPhotos.map((photo: string, index: number) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActivePhoto(index)}
                    className={`overflow-hidden rounded-xl border transition ${
                      activePhoto === index
                        ? "scale-105 border-[#d4af37]"
                        : "border-white/10 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={safeMediaPath(photo)}
                      alt={`Slideshow thumbnail ${index + 1}`}
                      className="h-16 w-full object-cover sm:h-20 md:h-24"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {renderFeatureCards()}

      {activeSection === "story" && (
        <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              {isLivingLegacy ? "Personal Story" : "Legacy Story"}
            </p>

            <h2 className="mb-4 font-serif text-2xl text-[#d4af37]">
              {lifeStoryTitle}
            </h2>

            <p className="leading-relaxed text-gray-300">
              {memorial.biography || storyEmptyText}
            </p>
          </div>
        </section>
      )}

      {activeSection === "blessings" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                  {isLivingLegacy ? "Words of Love" : "Tributes"}
                </p>

                <h2 className="font-serif text-2xl text-[#d4af37]">
                  {candleRoomTitle}
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  {candles} {candleCountText}
                </p>
              </div>

              <button
                onClick={openCandleModal}
                className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f0c94a]"
              >
                {candleActionLabel}
              </button>
            </div>

            {candleReactions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#d4af37]/20 bg-[#0b1320] p-6 text-center text-gray-400">
                {candleEmptyText}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {candleReactions.map((reaction: any) => (
                  <div
                    key={reaction.id}
                    className="rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-center"
                  >
                    <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#d4af37]/10 shadow-[0_0_30px_rgba(212,175,55,0.35)]">
                      <span className="animate-pulse text-5xl">
                        {isLivingLegacy ? "❤️" : "🕯️"}
                      </span>
                    </div>

                    <p className="font-semibold text-white">
                      {reaction.guest_name}
                    </p>

                    {reaction.message && (
                      <p className="mt-3 text-sm italic text-gray-300">
                        “{reaction.message}”
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === "flowers" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                  Flower Garden
                </p>

                <h2 className="font-serif text-2xl text-[#d4af37]">
                  {isLivingLegacy ? "Flowers Sent With Love" : "Flower Garden"}
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  {flowers} {flowerCountText}
                </p>
              </div>

              <button
                onClick={openFlowerModal}
                className="rounded-xl bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#f0c94a]"
              >
                {flowerActionLabel}
              </button>
            </div>

            {flowerReactions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#d4af37]/20 bg-[#0b1320] p-6 text-center text-gray-400">
                {flowerEmptyText}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {flowerReactions.map((reaction: any) => {
                  const selectedFlower =
                    flowerOptions[reaction.flower_type] || "🌸";

                  return (
                    <div
                      key={reaction.id}
                      className="rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-center"
                    >
                      <div className="mb-3 text-6xl">{selectedFlower}</div>

                      <div className="mx-auto mb-2 w-fit rounded-full border border-[#d4af37]/40 px-3 py-1 text-xs text-[#d4af37]">
                        {flowerByLabel} {reaction.guest_name}
                      </div>

                      {reaction.message && (
                        <p className="mt-3 text-sm italic text-gray-300">
                          “{reaction.message}”
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === "family-tree" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <FamilyTreeView token={token} />
        </section>
      )}

      {activeSection === "chat" && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <ChatBox memorialId={memorial.id} guestName={messageName || guestName} />
        </section>
      )}

      {activeSection === "messages" && (
        <section className="mx-auto max-w-5xl px-4 py-8 pb-16 sm:px-6">
          <div className="mb-6 rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <h2 className="mb-4 font-serif text-2xl text-[#d4af37]">
              {guestbookTitle}
            </h2>

            <input
              className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
              placeholder="Your Name"
              value={messageName}
              onChange={(e) => setMessageName(e.target.value)}
            />

            <textarea
              className="mb-3 min-h-[100px] w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
              placeholder={guestbookPlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              <label className="rounded border border-[#2a3550] bg-[#0b1320] p-3 text-sm text-gray-300">
                Photo
                <input
                  type="file"
                  accept="image/*"
                  className="mt-2 w-full text-xs"
                  onChange={(e) => setImage(e.target.files?.[0] || null)}
                />
              </label>

              <label className="rounded border border-[#2a3550] bg-[#0b1320] p-3 text-sm text-gray-300">
                Video
                <input
                  type="file"
                  accept="video/*"
                  className="mt-2 w-full text-xs"
                  onChange={(e) => setVideo(e.target.files?.[0] || null)}
                />
              </label>

              <label className="rounded border border-[#2a3550] bg-[#0b1320] p-3 text-sm text-gray-300">
                Audio
                <input
                  type="file"
                  accept="audio/*"
                  className="mt-2 w-full text-xs"
                  onChange={(e) => setAudio(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <button
              onClick={submitGuestbook}
              className="w-full rounded bg-[#d4af37] py-3 font-semibold text-black"
            >
              {isLivingLegacy ? "Post Family Message" : "Post to Guestbook"}
            </button>
          </div>

          <div className="space-y-4">
            {entries.length === 0 ? (
              <p className="text-center text-gray-400">{noGuestbookText}</p>
            ) : (
              entries.map((entry: any) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5"
                >
                  <h3 className="font-semibold text-white">
                    {entry.guest_name}
                  </h3>

                  <p className="mt-2 text-gray-300">{entry.message}</p>

                  {entry.image_url && (
                    <img
                      src={safeMediaPath(entry.image_url)}
                      alt="Guestbook image"
                      className="mt-4 max-h-[520px] w-full rounded-xl bg-white object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  {entry.video_url && (
                    <video controls className="mt-4 w-full rounded-xl">
                      <source src={safeMediaPath(entry.video_url)} />
                    </video>
                  )}

                  {entry.audio_url && (
                    <audio controls className="mt-4 w-full">
                      <source src={safeMediaPath(entry.audio_url)} />
                    </audio>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </main>
  );
}