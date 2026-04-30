"use client";

import { useEffect, useState } from "react";
import FamilyTreeView from "./FamilyTreeView";
import ChatBox from "./ChatBox";

export default function GuestAccess({ memorial, token }: any) {
  const [allowed, setAllowed] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [visitorCount, setVisitorCount] = useState(0);

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

          <h1 className="mb-6 font-serif text-5xl md:text-7xl">
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

      {/* keep the rest of your existing file unchanged below this point */}
    </main>
  );
}