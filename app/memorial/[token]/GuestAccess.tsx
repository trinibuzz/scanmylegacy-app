"use client";

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
    setAllowed(true);
  };

  const submitReaction = async (type: "candle" | "flower") => {
    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        reaction_type: type,
        guest_name: messageName || guestName,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    await loadReactions();

    if (type === "candle") {
      alert("Candle lit 🕯️");
    }

    if (type === "flower") {
      alert("Flower placed 🌹");
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

        <h1 className="mb-4 font-serif text-5xl">
          {memorial.full_name}
        </h1>

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

      <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-10 md:grid-cols-3">
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
            onClick={() => submitReaction("candle")}
            className="w-full rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 text-center transition hover:border-[#d4af37]"
          >
            <div className="mb-3 text-4xl">🕯️</div>
            <h3 className="font-serif text-xl">Light a Candle</h3>
            <p className="mt-2 text-sm text-gray-400">
              {candles} candles lit
            </p>
          </button>

          <button
            onClick={() => submitReaction("flower")}
            className="w-full rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 text-center transition hover:border-[#d4af37]"
          >
            <div className="mb-3 text-4xl">🌹</div>
            <h3 className="font-serif text-xl">Leave a Flower</h3>
            <p className="mt-2 text-sm text-gray-400">
              {flowers} flowers placed
            </p>
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-10">
        <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
          <h2 className="mb-6 font-serif text-2xl text-[#d4af37]">
            Memorial Garden
          </h2>

          {reactions.length === 0 ? (
            <p className="text-gray-400">
              No candles or flowers yet.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {reactions.map((reaction: any) => (
                <div
                  key={reaction.id}
                  className="rounded-xl border border-[#1f2a44] bg-[#0b1320] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {reaction.reaction_type === "candle"
                        ? "🕯️"
                        : "🌹"}
                    </div>

                    <div>
                      <p className="font-semibold">
                        {reaction.guest_name}
                      </p>

                      <p className="text-sm text-gray-400">
                        {reaction.reaction_type === "candle"
                          ? "lit a candle"
                          : "left a flower"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <FamilyTreeView token={token} />

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

          <div className="mb-4 grid gap-3 md:grid-cols-3">
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

                <p className="mt-2 text-gray-300">
                  {entry.message}
                </p>

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