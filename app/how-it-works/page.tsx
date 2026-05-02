import SiteHeader from "../components/SiteHeader";

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-[70vh] overflow-hidden bg-[#26447F]">
        <img
          src="/images/how-hero.jpg"
          alt="How ScanMyLegacy Works"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#26447F]/95 via-[#26447F]/82 to-[#0b1320]/45" />

        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl items-center px-6 py-20 sm:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
              How It Works
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-7xl">
              Preserve a legacy in 3 simple steps.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              Create a meaningful digital memorial, add precious memories, and
              invite loved ones to honor, remember, and celebrate together.
            </p>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            Simple Process
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl">
            From memory to memorial in minutes
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Choose Your Package",
              text: "Select the memorial plan that best fits your family&apos;s needs.",
            },
            {
              step: "02",
              title: "Build The Memorial",
              text: "Upload photos, videos, stories, voice notes, and special moments.",
            },
            {
              step: "03",
              title: "Invite Loved Ones",
              text: "Share private memorial links and keep family and friends connected.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-8 shadow-xl transition hover:-translate-y-1 hover:border-[#d4af37]"
            >
              <p className="mb-4 text-5xl font-bold text-[#d4af37]">
                {item.step}
              </p>

              <h2 className="mb-4 font-serif text-2xl">{item.title}</h2>

              <p className="leading-relaxed text-gray-300">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EXTRA DETAILS */}
      <section className="bg-[#111a2e] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center">
          <img
            src="/images/create-hero.jpg"
            alt="Create Memorial"
            className="h-full min-h-[320px] w-full rounded-2xl object-cover shadow-2xl"
          />

          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              Private & Meaningful
            </p>

            <h2 className="mb-6 font-serif text-3xl sm:text-4xl">
              A private digital memorial for your family
            </h2>

            <p className="leading-relaxed text-gray-300">
              Every memorial can include photos, videos, audio messages,
              tributes, guestbook entries, family connections, and more — all
              preserved in one beautiful place for generations to come.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                "Photo Memories",
                "Video Tributes",
                "Voice Notes",
                "Guestbook Messages",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-[#d4af37]/25 bg-[#0b1320] p-4"
                >
                  <p className="font-semibold text-[#d4af37]">✦ {item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="mb-4 font-serif text-3xl sm:text-4xl">
          Ready to begin?
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-gray-400">
          Choose a package and start creating a lasting tribute your family can
          visit, share, and add to over time.
        </p>

        <a
          href="/packages"
          className="rounded-full bg-[#d4af37] px-8 py-4 font-semibold text-[#0b1320] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
        >
          Choose a Package
        </a>
      </section>
    </main>
  );
}