"use client";

import { useState, useEffect } from "react";

export default function Guestbook({ token }: any) {
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [entries, setEntries] = useState<any[]>([]);

  // 🔥 Load messages
  useEffect(() => {
    fetch(`/api/guestbook?token=${token}`)
      .then((res) => res.json())
      .then((data) => setEntries(data.entries || []));
  }, [token]);

  // 🔥 Submit guestbook
  const submitEntry = async () => {
    const formData = new FormData();

    formData.append("token", token);
    formData.append("guest_name", guestName);
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

    alert("Message posted ❤️");

    setGuestName("");
    setMessage("");
    setImage(null);
    setVideo(null);
    setAudio(null);

    // reload entries
    const reload = await fetch(`/api/guestbook?token=${token}`);
    const reloadData = await reload.json();
    setEntries(reloadData.entries || []);
  };

  return (
    <section className="mx-auto max-w-5xl px-6 pb-16">
      <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 mb-6">
        <h2 className="mb-4 font-serif text-2xl text-[#d4af37]">
          Guestbook
        </h2>

        <input
          className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
          placeholder="Your Name"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
        />

        <textarea
          className="mb-3 w-full rounded border border-[#2a3550] bg-[#0b1320] p-3"
          placeholder="Write a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} className="mb-2" />
        <input type="file" onChange={(e) => setVideo(e.target.files?.[0] || null)} className="mb-2" />
        <input type="file" onChange={(e) => setAudio(e.target.files?.[0] || null)} className="mb-4" />

        <button
          onClick={submitEntry}
          className="w-full rounded bg-[#d4af37] py-3 font-semibold text-black"
        >
          Post Message
        </button>
      </div>

      {/* 🔥 Display entries */}
      <div className="space-y-4">
        {entries.map((e: any) => (
          <div
            key={e.id}
            className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-4"
          >
            <h3 className="font-semibold text-lg">{e.guest_name}</h3>
            <p className="text-gray-300 mb-2">{e.message}</p>

            {e.image_url && (
              <img src={e.image_url} className="mb-2 rounded-lg" />
            )}

            {e.video_url && (
              <video controls className="mb-2 w-full rounded-lg">
                <source src={e.video_url} />
              </video>
            )}

            {e.audio_url && (
              <audio controls className="mb-2 w-full">
                <source src={e.audio_url} />
              </audio>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}