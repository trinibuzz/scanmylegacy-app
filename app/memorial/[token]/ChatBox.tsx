"use client";

import { useEffect, useRef, useState } from "react";

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
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = async () => {
    const res = await fetch(`/api/memorial-chat?memorial_id=${memorialId}`);
    const data = await res.json();

    if (res.ok) {
      setMessages(data.messages || []);
    }
  };

  useEffect(() => {
    if (!memorialId) return;

    loadMessages();

    const interval = setInterval(loadMessages, 5000);

    return () => clearInterval(interval);
  }, [memorialId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      <div className="overflow-hidden rounded-2xl border border-[#1f2a44] bg-[#111a2e] shadow-2xl">
        <div className="border-b border-[#1f2a44] bg-[#0b1320] px-6 py-4">
          <h2 className="font-serif text-2xl text-[#d4af37]">
            Family Chat
          </h2>

          <p className="text-sm text-gray-400">
            A private room for family and friends to share memories.
          </p>
        </div>

        <div className="h-[360px] overflow-y-auto bg-[#0b1320] p-5">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-gray-400">
              No messages yet. Start the conversation.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isMe = msg.guest_name === guestName;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isMe
                          ? "bg-[#d4af37] text-black"
                          : "bg-[#111a2e] text-white border border-[#1f2a44]"
                      }`}
                    >
                      <p
                        className={`mb-1 text-xs font-semibold ${
                          isMe ? "text-black/70" : "text-[#d4af37]"
                        }`}
                      >
                        {msg.guest_name}
                      </p>

                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.body}
                      </p>

                      <p
                        className={`mt-2 text-[10px] ${
                          isMe ? "text-black/60" : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="border-t border-[#1f2a44] bg-[#111a2e] p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message..."
            className="mb-3 h-20 w-full resize-none rounded-xl border border-[#2a3550] bg-[#0b1320] p-3 text-sm text-white outline-none placeholder:text-gray-500"
          />

          <div className="mb-3 grid gap-3 md:grid-cols-3">
            <label className="cursor-pointer rounded-xl border border-[#2a3550] bg-[#0b1320] p-3 text-center text-sm text-gray-300 hover:border-[#d4af37]">
              📷 Add Photo
              <input type="file" accept="image/*" className="hidden" />
            </label>

            <label className="cursor-pointer rounded-xl border border-[#2a3550] bg-[#0b1320] p-3 text-center text-sm text-gray-300 hover:border-[#d4af37]">
              🎥 Add Video
              <input type="file" accept="video/*" className="hidden" />
            </label>

            <label className="cursor-pointer rounded-xl border border-[#2a3550] bg-[#0b1320] p-3 text-center text-sm text-gray-300 hover:border-[#d4af37]">
              🎙️ Add Audio
              <input type="file" accept="audio/*" className="hidden" />
            </label>
          </div>

          <button
            onClick={sendMessage}
            disabled={sending}
            className="w-full rounded-xl bg-[#d4af37] py-3 font-semibold text-black disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </div>
    </section>
  );
}