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
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

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

  const loadMessages = async () => {
    try {
      const res = await fetch(`/api/memorial-chat?memorial_id=${memorialId}`);
      const data = await res.json();

      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch {
      // Keep chat from crashing the memorial page.
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
    if (!message.trim() && !selectedMedia) {
      alert("Please enter a message or attach a file.");
      return;
    }

    if (!guestName.trim()) {
      alert("Guest name missing.");
      return;
    }

    try {
      setSending(true);

      const formData = new FormData();
      formData.append("memorial_id", String(memorialId));
      formData.append("guest_name", guestName);
      formData.append("body", message.trim());

      if (selectedMedia) {
        formData.append("media", selectedMedia);
      }

      const res = await fetch("/api/memorial-chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to send message.");
        return;
      }

      setMessage("");
      setSelectedMedia(null);

      if (mediaInputRef.current) {
        mediaInputRef.current.value = "";
      }

      await loadMessages();
    } catch {
      alert("Something went wrong.");
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

  const selectedMediaLabel = () => {
    if (!selectedMedia) return "";

    if (selectedMedia.type.startsWith("image/")) {
      return `📷 ${selectedMedia.name}`;
    }

    if (selectedMedia.type.startsWith("video/")) {
      return `🎥 ${selectedMedia.name}`;
    }

    if (selectedMedia.type.startsWith("audio/")) {
      return `🎙️ ${selectedMedia.name}`;
    }

    return selectedMedia.name;
  };

  return (
    <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] shadow-2xl">
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

        <div className="h-[430px] overflow-y-auto bg-[#081827] bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_30%)] p-4 sm:p-5">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div className="max-w-sm rounded-3xl border border-[#d4af37]/15 bg-[#111a2e]/80 p-6 shadow-xl">
                <div className="mb-3 text-4xl">🕊️</div>

                <p className="font-serif text-2xl text-[#d4af37]">
                  Start the conversation
                </p>

                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Share a message, a photo, a video, or a voice note with
                  family and friends.
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

                      {msg.body && (
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.body}
                        </p>
                      )}

                      {msg.image_url && (
                        <img
                          src={safeMediaPath(msg.image_url)}
                          alt="Chat photo"
                          className="mt-3 max-h-[340px] w-full rounded-2xl object-cover"
                        />
                      )}

                      {msg.video_url && (
                        <video controls className="mt-3 w-full rounded-2xl">
                          <source src={safeMediaPath(msg.video_url)} />
                          Your browser does not support the video tag.
                        </video>
                      )}

                      {msg.audio_url && (
                        <div
                          className={`mt-3 rounded-2xl p-3 ${
                            isMe ? "bg-black/10" : "bg-black/25"
                          }`}
                        >
                          <div
                            className={`mb-2 text-xs font-semibold ${
                              isMe ? "text-black/70" : "text-[#d4af37]"
                            }`}
                          >
                            🎙️ Voice Note
                          </div>

                          <audio controls className="w-full">
                            <source src={safeMediaPath(msg.audio_url)} />
                            Your browser does not support the audio tag.
                          </audio>
                        </div>
                      )}

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

        {selectedMedia && (
          <div className="border-t border-[#d4af37]/10 bg-[#0b1320] px-4 py-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#d4af37]/20 bg-[#111a2e] px-4 py-3 text-sm text-gray-200">
              <span className="min-w-0 truncate">{selectedMediaLabel()}</span>

              <button
                type="button"
                onClick={() => {
                  setSelectedMedia(null);

                  if (mediaInputRef.current) {
                    mediaInputRef.current.value = "";
                  }
                }}
                className="rounded-full border border-red-400/40 px-3 py-1 text-xs text-red-200"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-[#d4af37]/10 bg-[#111a2e] p-3">
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setSelectedMedia(file);
            }}
          />

          <div className="flex items-end gap-2 rounded-full border border-[#d4af37]/20 bg-[#0b1320] p-2">
            <button
              type="button"
              onClick={() => mediaInputRef.current?.click()}
              title="Attach photo, video, or audio"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/30 text-xl text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
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
              onClick={() => mediaInputRef.current?.click()}
              title="Attach voice note"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/30 text-lg text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
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
            Text, photo, video, and audio chat are active. Keep uploads under
            50MB.
          </p>
        </div>
      </div>
    </section>
  );
}