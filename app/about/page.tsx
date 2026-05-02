import SiteHeader from "../components/SiteHeader";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-[70vh] overflow-hidden bg-[#26447F]">
        <img
          src="/images/about-hero.jpg"
          alt="About ScanMyLegacy"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#26447F]/95 via-[#26447F]/82 to-[#0b1320]/45" />

        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl items-center px-6 py-20 sm:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
              About Us
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-7xl">
              Preserving legacies for generations.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              ScanMyLegacy was created to help families preserve stories,
              voices, milestones, and cherished memories in one beautiful
              digital space that can be shared for years to come.
            </p>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              Our Mission
            </p>

            <h2 className="mb-6 font-serif text-3xl sm:text-4xl">
              A dignified place for memories to live on.
            </h2>

            <p className="mb-6 leading-relaxed text-gray-300">
              At ScanMy Legacy, we believe memories should never fade.
              Families deserve a place where stories, voices, laughter,
              and milestones can live on forever.
            </p>

            <p className="leading-relaxed text-gray-300">
              We built this platform to help families preserve, celebrate,
              and share the lives of those who mattered most in a private,
              meaningful, and elegant digital memorial.
            </p>
          </div>

          <img
            src="/images/about-hero.jpg"
            alt="Family memories"
            className="h-full min-h-[320px] w-full rounded-2xl object-cover shadow-2xl"
          />
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-[#111a2e] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              What We Stand For
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl">
              The heart behind ScanMyLegacy
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Preservation",
                text: "Keeping precious stories, voices, and memories safe for future generations.",
              },
              {
                title: "Connection",
                text: "Helping families and loved ones stay connected through shared remembrance.",
              },
              {
                title: "Legacy",
                text: "Creating timeless digital spaces that honor the lives of those we love.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#d4af37]/30 bg-[#0b1320] p-6 shadow-xl"
              >
                <h3 className="mb-4 font-serif text-2xl text-[#d4af37]">
                  {item.title}
                </h3>

                <p className="leading-relaxed text-gray-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="mb-4 font-serif text-3xl sm:text-4xl">
          Honor a life. Preserve a story.
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-gray-400">
          Give your loved one a beautiful memorial space where family and
          friends can gather, remember, and celebrate their legacy.
        </p>

        <a
          href="/packages"
          className="rounded-full bg-[#d4af37] px-8 py-4 font-semibold text-[#0b1320] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
        >
          View Packages
        </a>
      </section>
    </main>
  );
}