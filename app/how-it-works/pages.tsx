export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      {/* HERO */}
      <section className="relative h-[420px] overflow-hidden">
        <img
          src="/images/how-hero.jpg"
          alt="How ScanMyLegacy Works"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-[#0b1320]/70" />

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              How It Works
            </p>

            <h1 className="font-serif text-5xl">
              Preserve a legacy in 3 simple steps.
            </h1>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Choose Your Package",
              text: "Select the memorial plan that best fits your family's needs.",
            },
            {
              step: "02",
              title: "Build The Memorial",
              text: "Upload photos, videos, stories, and voice notes.",
            },
            {
              step: "03",
              title: "Invite Loved Ones",
              text: "Share private memorial links and keep everyone connected.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-8"
            >
              <p className="mb-4 text-5xl font-bold text-[#d4af37]">
                {item.step}
              </p>

              <h2 className="mb-4 font-serif text-2xl">
                {item.title}
              </h2>

              <p className="text-gray-300 leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* EXTRA DETAILS */}
      <section className="bg-[#111a2e] px-6 py-20">
        <div className="mx-auto max-w-6xl grid gap-12 md:grid-cols-2">
          <img
            src="/images/create-hero.jpg"
            alt="Create Memorial"
            className="rounded-2xl object-cover shadow-2xl"
          />

          <div className="flex flex-col justify-center">
            <h2 className="mb-6 font-serif text-4xl text-[#d4af37]">
              A private digital memorial for your family
            </h2>

            <p className="leading-relaxed text-gray-300">
              Every memorial can include photos, videos, audio messages,
              tributes, guestbook entries, and more — all preserved in one
              place for generations to come.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="mb-6 font-serif text-4xl">
          Ready to begin?
        </h2>

        <a
          href="/packages"
          className="rounded-lg bg-[#d4af37] px-8 py-3 font-semibold text-black"
        >
          Choose a Package
        </a>
      </section>
    </main>
  );
}