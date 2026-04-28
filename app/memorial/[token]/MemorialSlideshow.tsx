"use client";

import { useEffect, useState } from "react";
"use client";

export default function MemorialSlideshow({ token }: { token: string }) {
  return null;
}
export default function MemorialSlideshow({ token }: { token: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    fetch(`/api/public-gallery?token=${token}`)
      .then((res) => res.json())
      .then((data) => setItems(data.gallery || []));
  }, [token]);

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [items]);

  if (items.length === 0) return null;

  const current = items[active];

  const mediaUrl =
    current.file_url ||
    current.image_url ||
    current.video_url ||
    current.media_url ||
    current.url;

  const isVideo =
    current.media_type === "video" ||
    current.type === "video" ||
    mediaUrl?.match(/\.(mp4|mov|webm)$/i);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-12">
      <div className="mb-6 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
          Memories
        </p>

        <h2 className="font-serif text-3xl text-white">
          Tribute Slideshow
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#1f2a44] bg-[#111a2e] shadow-2xl">
        <div className="relative flex h-[460px] items-center justify-center bg-black">
          {isVideo ? (
            <video
              src={mediaUrl}
              controls
              className="h-full w-full object-contain"
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Memorial memory"
              className="h-full w-full object-contain"
            />
          )}
        </div>

        {items.length > 1 && (
          <div className="flex gap-3 overflow-x-auto p-4">
            {items.map((item, index) => {
              const thumb =
                item.file_url ||
                item.image_url ||
                item.video_url ||
                item.media_url ||
                item.url;

              const videoThumb =
                item.media_type === "video" ||
                item.type === "video" ||
                thumb?.match(/\.(mp4|mov|webm)$/i);

              return (
                <button
                  key={item.id || index}
                  onClick={() => setActive(index)}
                  className={`h-20 min-w-[90px] overflow-hidden rounded-lg border ${
                    active === index
                      ? "border-[#d4af37]"
                      : "border-[#1f2a44]"
                  }`}
                >
                  {videoThumb ? (
                    <div className="flex h-full w-full items-center justify-center bg-[#0b1320] text-2xl">
                      ▶️
                    </div>
                  ) : (
                    <img
                      src={thumb}
                      alt="Thumbnail"
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}