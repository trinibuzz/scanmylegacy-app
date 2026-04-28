"use client";

import MemorialSlideshow from "./MemorialSlideshow";
import { useEffect, useState } from "react";
import FamilyTreeView from "./FamilyTreeView";

export default function GuestAccess({ memorial, token }: any) {
  const [allowed, setAllowed] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

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
    setAllowed(true);
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
      <section className="px-6 py-16 text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
          In Loving Memory
        </p>

        <h1 className="mb-4 font-serif text-5xl">{memorial.full_name}</h1>

        <p className="mb-8 text-gray-400">
          {memorial.birth_date
            ? new Date(memorial.birth_date).toLocaleDateString()
            : ""}
          {" — "}
          {memorial.death_date
            ? new Date(memorial.death_date).toLocaleDateString()
            : ""}
        </p>

        <div className="mx-auto h-px max-w-xl bg-[#d4af37]/40" />
      </section>

      {memorial.cover_photo && (
        <div className="mx-auto mb-10 max-w-3xl px-6">
          <img
            src={memorial.cover_photo}
            alt={memorial.full_name}
            className="h-[380px] w-full rounded-2xl border border-[#1f2a44] object-cover shadow-2xl"
          />
        </div>
      )}

      <MemorialSlideshow token={token} />

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-10 md:grid-cols-3">
        <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 md:col-span-2">
          <h2 className="mb-4 font-serif text-2xl text-[#d4af37]">
            Life Story
          </h2>

          <p className="leading-relaxed text-gray-300">{memorial.biography}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={openCandleModal}
            className="w-full rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6"
          >
            🕯️ Light a Candle ({candles})
          </button>

          <button
            onClick={openFlowerModal}
            className="w-full rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6"
          >
            🌸 Plant a Flower ({flowers})
          </button>
        </div>
      </section>

      <FamilyTreeView token={token} />
    </main>
  );
}