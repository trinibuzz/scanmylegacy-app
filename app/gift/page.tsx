import Link from "next/link";

export const metadata = {
  title: "Gift a Legacy Page | ScanMyLegacy",
  description:
    "Give the gift of memories that last forever with a ScanMyLegacy digital legacy page.",
};

export default function GiftPage() {
  return (
    <main className="min-h-screen bg-[#071426] text-white">
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(38,68,127,0.5),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-[#d4af37]">
              ScanMyLegacy
            </p>

            <h1 className="font-serif text-4xl leading-tight md:text-6xl">
              Gift a Legacy Page
            </h1>

            <p className="mt-6 text-xl leading-relaxed text-white/85">
              Give the gift of memories that last forever. A beautiful digital
              home where families can preserve photos, videos, stories, music,
              tributes, family history, and love.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/packages"
                className="rounded-full bg-[#d4af37] px-7 py-3 font-semibold text-[#071426] shadow-lg hover:opacity-90"
              >
                View Packages
              </Link>

              <Link
                href="/contact"
                className="rounded-full border border-[#d4af37]/70 px-7 py-3 font-semibold text-[#d4af37] hover:bg-[#d4af37]/10"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d4af37]/30 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="rounded-2xl bg-[#0b1f3a] p-6">
              <p className="text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Perfect For
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                {[
                  "Parents",
                  "Grandparents",
                  "Spouses",
                  "Elders",
                  "Birthdays",
                  "Anniversaries",
                  "Retirement",
                  "Family Reunions",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/90"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-5">
                <p className="font-serif text-2xl text-[#d4af37]">
                  A Digital Home For Every Memory
                </p>
                <p className="mt-3 text-white/80">
                  Do not wait until memories are gone. Preserve the story now,
                  while family voices, photos, and memories can still be shared.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-3xl md:text-4xl">
            How the Legacy Gift Works
          </h2>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "1. Choose a Package",
                text: "Select the gift package that best fits your family and the memories you want to preserve.",
              },
              {
                title: "2. Add Recipient Details",
                text: "Tell us who the gift is for, the occasion, and your personal message.",
              },
              {
                title: "3. Share the Legacy Link",
                text: "The recipient or family receives a private link to begin building their Legacy Page.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <h3 className="text-xl font-semibold text-[#d4af37]">
                  {step.title}
                </h3>
                <p className="mt-3 leading-relaxed text-white/75">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}