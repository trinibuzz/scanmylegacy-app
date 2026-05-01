"use client";

import { useEffect, useState } from "react";
import FamilyTreeView from "./FamilyTreeView";
import ChatBox from "./ChatBox";

export default function GuestAccess({ memorial, token }: any) {
  const [allowed, setAllowed] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [visitorCount, setVisitorCount] = useState(0);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

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

  const flowerOptions: any = {
    rose: "🌹",
    tulip: "🌷",
    sunflower: "🌻",
    lily: "🌸",
    hibiscus: "🌺",
    orchid: "💮",
  };

  const galleryPhotos =
    memorial.gallery_photos && memorial.gallery_photos.length > 0
      ? memorial.gallery_photos
      : memorial.cover_photo
      ? [memorial.cover_photo]
      : [
          "/images/memorial/photo1.jpg",
          "/images/memorial/photo2.jpg",
          "/images/memorial/photo3.jpg",
          "/images/memorial/photo4.jpg",
        ];

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
        title: `${memorial.full_name} Memorial`,
        text: `Visit the memorial of ${memorial.full_name}`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Memorial link copied to clipboard");
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

    if (type === "candle") alert("Candle lit 🕯️");
    if (type === "flower") alert("Flower planted 🌸");
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
          alert("Please tap Play Music again to start the memorial music.");
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

    alert("Guestbook message posted ❤️");

    setMessage("");
    setImage(null);
    setVideo(null);
    setAudio(null);

    await loadGuestbook();
  };

  const candleReactions = reactions.filter(
    (reaction) => reaction.reaction_type === "candle"
  );

  const flowerReactions = reactions.filter(
    (reaction) => reaction.reaction_type === "flower"
  );

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8">
          <p className="mb-2 text-center text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            You are invited to view
          </p>

          <h1 className="mb-2 text-center font-serif text-3xl">
            {memorial.full_name}
          </h1>

          <p className="mb-6 text-center text-gray-400">
            Memorial Tribute — Enter your name to continue
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
  <style>{`
    @keyframes memorialCinematic {
      0% {
        opacity: 0;
        transform: scale(1);
        filter: blur(8px);
      }

      20% {
        opacity: 1;
        filter: blur(0px);
      }

      80% {
        opacity: 1;
        transform: scale(1.08);
        filter: blur(0px);
      }

      100% {
        opacity: 0;
        transform: scale(1.12);
        filter: blur(4px);
      }
    }
  `}</style>
      {showCandleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-2xl border border-[#d4af37]/40 bg-[#111a2e] p-6 shadow-2xl">
            <div className="mb-4 text-center text-5xl">🕯️</div>

            <h2 className="mb-4 text-center font-serif text-2xl text-[#d4af37]">
              Light a Candle
            </h2>

            <input
              className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
              placeholder="Your Name"
              value={tributeName}
              onChange={(e) => setTributeName(e.target.value)}
            />

            <textarea
              className="mb-4 min-h-[100px] w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
              placeholder="Leave a short message..."
              value={tributeMessage}
              onChange={(e) => setTributeMessage(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => submitReaction("candle")}
                className="flex-1 rounded bg-[#d4af37] py-3 font-semibold text-black"
              >
                Light Candle
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
              Plant a Flower
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
              placeholder="Leave a short message..."
              value={tributeMessage}
              onChange={(e) => setTributeMessage(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => submitReaction("flower")}
                className="flex-1 rounded bg-[#d4af37] py-3 font-semibold text-black"
              >
                Plant Flower
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

      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden text-center">
        {memorial.cover_photo && (
          <img
            src={memorial.cover_photo}
            alt={memorial.full_name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-[#0b1320]/75 to-[#0b1320]" />

        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#d4af37]">
            In Loving Memory
          </p>

          className="mb-6 font-serif text-3xl sm:text-4xl md:text-7xl"
            {memorial.full_name}
          </h1>

          <p className="mb-8 text-lg text-gray-300">
            {memorial.birth_date
              ? new Date(memorial.birth_date).toLocaleDateString()
              : ""}
            {" — "}
            {memorial.death_date
              ? new Date(memorial.death_date).toLocaleDateString()
              : ""}
          </p>

          <div className="mx-auto mb-8 h-px max-w-md bg-[#d4af37]/40" />

          <button
            onClick={shareMemorial}
            className="rounded-xl border border-[#d4af37]/40 bg-black/30 px-6 py-3 text-sm font-semibold text-[#d4af37] backdrop-blur transition hover:bg-[#d4af37] hover:text-black"
          >
            Share Memorial
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
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              Treasured Moments
            </p>

            <h2 className="font-serif text-3xl md:text-4xl">
              Memorial Slideshow
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-400">
              A beautiful collection of memories that gently plays through each
              photo like a tribute film.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] shadow-2xl">
            <div className="relative aspect-[16/9] bg-black">
<img
  key={activePhoto}
  src={galleryPhotos[activePhoto]}
  alt="Memorial slideshow"
  className="h-full w-full object-cover"
  style={{
    animation: "memorialCinematic 8s ease-in-out",
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
    src={memorial.memorial_music || "/music/memorial.mp3"}
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
                {isMusicPlaying ? "Pause Music" : "Play Music"}
              </button>
            </div>

            {galleryPhotos.length > 1 && (
              <div className="grid grid-cols-4 gap-3 bg-[#081827]/80 p-4 md:grid-cols-6">
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
                      src={photo}
                      alt={`Slideshow thumbnail ${index + 1}`}
                      className="h-20 w-full object-cover md:h-24"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto grid max-w-5xl gap-6 px-6 py-14 grid-cols-1 sm:grid-cols-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 md:col-span-2">
          <h2 className="mb-4 font-serif text-2xl text-[#d4af37]">
            Life Story
          </h2>

          <p className="leading-relaxed text-gray-300">
            {memorial.biography}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={openCandleModal}
            className="w-full rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 text-center transition hover:border-[#d4af37]"
          >
            <div className="mb-3 text-4xl">🕯️</div>
            <h3 className="font-serif text-xl">Light a Candle</h3>
            <p className="mt-2 text-sm text-gray-400">
              {candles} candles lit
            </p>
          </button>

          <button
            onClick={openFlowerModal}
            className="w-full rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 text-center transition hover:border-[#d4af37]"
          >
            <div className="mb-3 text-4xl">🌸</div>
            <h3 className="font-serif text-xl">Plant a Flower</h3>
            <p className="mt-2 text-sm text-gray-400">
              {flowers} flowers planted
            </p>
          </button>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-10 md:grid-cols-2">
        <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
          <h2 className="mb-2 font-serif text-2xl text-[#d4af37]">
            Candle Room
          </h2>

          {candleReactions.length === 0 ? (
            <p className="text-gray-400">No candles lit yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {candleReactions.map((reaction: any) => (
                <div
                  key={reaction.id}
                  className="rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-center"
                >
                  <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#d4af37]/10 shadow-[0_0_30px_rgba(212,175,55,0.35)]">
                    <span className="animate-pulse text-5xl">🕯️</span>
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

        <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
          <h2 className="mb-2 font-serif text-2xl text-[#d4af37]">
            Flower Garden
          </h2>

          {flowerReactions.length === 0 ? (
            <p className="text-gray-400">No flowers planted yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
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
                      Planted by {reaction.guest_name}
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

      <FamilyTreeView token={token} />

      <ChatBox
        memorialId={memorial.id}
        guestName={messageName || guestName}
      />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="mb-6 rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
          <h2 className="mb-4 font-serif text-2xl text-[#d4af37]">
            Guestbook
          </h2>

          <input
            className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
            placeholder="Your Name"
            value={messageName}
            onChange={(e) => setMessageName(e.target.value)}
          />

          <textarea
            className="mb-3 min-h-[100px] w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
            placeholder="Write a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="mb-4 grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
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
            Post to Guestbook
          </button>
        </div>

        <div className="space-y-4">
          {entries.length === 0 ? (
            <p className="text-center text-gray-400">
              No guestbook messages yet.
            </p>
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
                    src={entry.image_url}
                    alt="Guestbook image"
                    className="mt-4 max-h-[420px] w-full rounded-xl object-cover"
                  />
                )}

                {entry.video_url && (
                  <video controls className="mt-4 w-full rounded-xl">
                    <source src={entry.video_url} />
                  </video>
                )}

                {entry.audio_url && (
                  <audio controls className="mt-4 w-full">
                    <source src={entry.audio_url} />
                  </audio>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}