"use client";

import { useEffect, useState } from "react";

export default function ChatBox({
  memorialId,
  guestName,
}: {
  memorialId: number;
  guestName: string;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const loadMessages = async () => {
    const res = await fetch(
      `/api/memorial-chat?memorial_id=${memorialId}`
    );

    const data = await res.json();

    if (res.ok) {
      setMessages(data.messages || []);
    }
  };

  useEffect(() => {
    if (!memorialId) return;

    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, [memorialId]);

  const sendMessage = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }

    if (!guestName.trim()) {
      alert("Guest name missing");
      return;
    }

    try {
      setSending(true);

      const res = await fetch("/api/memorial-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memorial_id: memorialId,
          guest_name: guestName,
          body: message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to send message");
        return;
      }

      setMessage("");
      await loadMessages();
    } catch {
      alert("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-6 pb-10">
      <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
        <h2 className="mb-2 font-serif text-2xl text-[#d4af37]">
          Family Chat
        </h2>

        <p className="mb-6 text-sm text-gray-400">
          Share memories and speak with family in real time.
        </p>

        <div className="mb-6 max-h-[400px] space-y-4 overflow-y-auto rounded-xl border border-[#2a3550] bg-[#0b1320] p-4">
          {messages.length === 0 ? (
            <p className="text-gray-400">
              No chat messages yet.
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-xl border border-[#1f2a44] bg-[#111a2e] p-4"
              >
                <p className="font-semibold text-white">
                  {msg.guest_name}
                </p>

                <p className="mt-2 text-gray-300">
                  {msg.body}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {new Date(
                    msg.created_at
                  ).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        <textarea
          value={message}
          onChange={(e) =>
            setMessage(e.target.value)
          }
          placeholder="Write a message..."
          className="mb-4 min-h-[100px] w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-4 text-white"
        />

        <button
          onClick={sendMessage}
          disabled={sending}
          className="w-full rounded-lg bg-[#d4af37] py-3 font-semibold text-black"
        >
          {sending ? "Sending..." : "Send Message"}
        </button>
      </div>
    </section>
  );
}