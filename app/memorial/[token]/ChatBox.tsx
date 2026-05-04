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
    const chatContainer = bottomRef.current?.parentElement;

    if (!chatContainer) return;

    const isNearBottom =
      chatContainer.scrollHeight - chatContainer.scrollTop <=
      chatContainer.clientHeight + 120;

    if (isNearBottom) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
    }
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
          body: message.trim(),
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

  const formatTime = (dateValue: string) => {
    if (!dateValue) return "";

    return new Date(dateValue).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] shadow-2xl">
        {/* Header */}
        <div className="border-b border-[#d4af37]/10 bg-[#0b1320] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#111a2e] text-xl shadow-lg">
              💬
            </div>

            <div>
              <h2 className="font-serif text-2xl text-[#d4af37]">
                Family Chat
              </h2>

              <p className="text-sm text-gray-400">
                A private room for family and friends to share memories.
              </p>
            </div>
          </div>
        </div>

        {/* Chat body */}
        <div className="h-[430px] overflow-y-auto bg-[#081827] bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_30%)] p-4 sm:p-5">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="max-w-sm rounded-3xl border border-[#d4af37]/15 bg-[#111a2e]/80 p-6 shadow-xl">
                <div className="mb-3 text-4xl">🕊️</div>

                <p className="font-serif text-2xl text-[#d4af37]">
                  Start the conversation
                </p>

                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Share a message, a memory, or a comforting word with family
                  and friends.
                </p>
              </div>
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
                      className={`max-w-[86%] rounded-3xl px-4 py-3 shadow-lg sm:max-w-[76%] ${
                        isMe
                          ? "rounded-br-md bg-[#d4af37] text-black"
                          : "rounded-bl-md border border-[#1f2a44] bg-[#111a2e] text-white"
                      }`}
                    >
                      <p
                        className={`mb-1 text-xs font-bold ${
                          isMe ? "text-black/70" : "text-[#d4af37]"
                        }`}
                      >
                        {msg.guest_name}
                      </p>

                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.body}
                      </p>

                      <p
                        className={`mt-2 text-right text-[10px] ${
                          isMe ? "text-black/55" : "text-gray-500"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Bottom WhatsApp-style message bar */}
        <div className="border-t border-[#d4af37]/10 bg-[#111a2e] p-3">
          <div className="flex items-end gap-2 rounded-full border border-[#d4af37]/20 bg-[#0b1320] p-2">
            <button
              type="button"
              disabled
              title="Media uploads coming next"
              className="flex h-11 w-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-[#d4af37]/20 text-xl text-[#d4af37]/40"
            >
              +
            </button>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message..."
              rows={1}
              className="max-h-28 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-gray-500"
            />

            <button
              type="button"
              disabled
              title="Voice notes coming next"
              className="flex h-11 w-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full border border-[#d4af37]/20 text-lg text-[#d4af37]/40"
            >
              🎙️
            </button>

            <button
              type="button"
              onClick={sendMessage}
              disabled={sending}
              className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full bg-[#d4af37] px-4 font-semibold text-black transition hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Send message"
            >
              {sending ? "..." : "➤"}
            </button>
          </div>

          <p className="mt-2 text-center text-[11px] text-gray-500">
            Text chat is active. Photos, videos, and voice notes can be added
            after mobile testing.
          </p>
        </div>
      </div>
    </section>
  );
}