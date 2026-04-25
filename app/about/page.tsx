export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      {/* HERO */}
      <section className="relative h-[420px] overflow-hidden">
        <img
          src="/images/about-hero.jpg"
          alt="About ScanMyLegacy"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-[#0b1320]/70" />

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              About Us
            </p>

            <h1 className="font-serif text-5xl">
              Preserving legacies for generations.
            </h1>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 font-serif text-4xl text-[#d4af37]">
              Our Mission
            </h2>

            <p className="mb-6 leading-relaxed text-gray-300">
              At ScanMy Legacy, we believe memories should never fade.
              Families deserve a place where stories, voices, laughter,
              and milestones can live on forever.
            </p>

            <p className="leading-relaxed text-gray-300">
              We built this platform to help families preserve, celebrate,
              and share the lives of those who mattered most.
            </p>
          </div>

          <img
            src="/images/about-hero.jpg"
            alt="Family memories"
            className="rounded-2xl object-cover shadow-2xl"
          />
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-[#111a2e] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-4xl">What We Stand For</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Preservation",
                text: "Keeping memories safe for future generations.",
              },
              {
                title: "Connection",
                text: "Helping families stay connected through shared remembrance.",
              },
              {
                title: "Legacy",
                text: "Building timeless digital spaces for loved ones.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#d4af37]/30 bg-[#0b1320] p-6"
              >
                <h3 className="mb-4 font-serif text-2xl text-[#d4af37]">
                  {item.title}
                </h3>

                <p className="text-gray-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="mb-6 font-serif text-4xl">
          Honor a life. Preserve a story.
        </h2>

        <a
          href="/packages"
          className="rounded-lg bg-[#d4af37] px-8 py-3 font-semibold text-black"
        >
          View Packages
        </a>
      </section>
    </main>
  );
}