import SiteHeader from "./components/SiteHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-[78vh] overflow-hidden bg-[#26447F]">
        <img
          src="/images/home-hero.jpg"
          alt="Family preserving memories"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#26447F]/95 via-[#26447F]/82 to-[#0b1320]/45" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(212,175,55,0.18),transparent_35%)]" />

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-7xl items-center px-6 py-20 sm:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
              ScanMy Legacy
            </p>

            <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-7xl">
              Their story deserves to live forever.
            </h1>

            <p className="mb-8 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              Preserve photos, videos, voice notes, stories, and heartfelt
              tributes in one private digital memorial your family can visit
              anytime.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <a
                href="/packages"
                className="rounded-full bg-[#d4af37] px-8 py-4 text-center font-semibold text-[#0b1320] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
              >
                Create a Legacy
              </a>

              <a
                href="/login"
                className="rounded-full border border-[#d4af37]/70 bg-white/5 px-8 py-4 text-center font-semibold text-[#f8f5ee] backdrop-blur transition hover:bg-[#d4af37]/15"
              >
                Login
              </a>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
              {["Stories", "Photos", "Tributes", "Forever"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#d4af37]/25 bg-black/20 p-4 text-center backdrop-blur"
                >
                  <p className="text-xl text-[#d4af37]">✦</p>
                  <p className="mt-2 text-sm font-semibold text-white/85">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            How It Works
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl">
            Create a lasting tribute in minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: "Choose a Package",
              text: "Select the memorial plan that fits your family’s needs.",
              img: "/images/how-hero.jpg",
            },
            {
              title: "Build the Memorial",
              text: "Add photos, videos, voice notes, life stories, and memories.",
              img: "/images/create-hero.jpg",
            },
            {
              title: "Invite Loved Ones",
              text: "Share a private invite link or QR code with family and friends.",
              img: "/images/welcome-hero.jpg",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="overflow-hidden rounded-2xl border border-[#d4af37]/15 bg-[#111a2e] shadow-xl"
            >
              <img
                src={item.img}
                alt={item.title}
                className="h-56 w-full object-cover"
              />

              <div className="p-6">
                <h3 className="mb-3 font-serif text-2xl text-[#d4af37]">
                  {item.title}
                </h3>

                <p className="leading-relaxed text-gray-300">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-[#111a2e] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              Features
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl">
              Everything families need to remember
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              "Stories & Tributes",
              "Guestbook",
              "Photo Uploads",
              "Video Memories",
              "Audio Messages",
              "Private Invite Links",
              "QR Code Access",
              "Memorial Garden",
            ].map((feature) => (
              <div
                key={feature}
                className="rounded-xl border border-[#d4af37]/30 bg-[#0b1320] p-5 text-center shadow-lg"
              >
                <p className="text-[#d4af37]">✦</p>
                <h3 className="mt-2 font-semibold">{feature}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2">
        <img
          src="/images/about-hero.jpg"
          alt="Family remembering a loved one"
          className="h-[320px] w-full rounded-2xl object-cover shadow-2xl sm:h-[420px]"
        />

        <div className="flex flex-col justify-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            Built For Families
          </p>

          <h2 className="mb-6 font-serif text-3xl sm:text-4xl">
            Because love should never be forgotten.
          </h2>

          <p className="mb-6 leading-relaxed text-gray-300">
            ScanMy Legacy gives Caribbean families and loved ones everywhere a
            private, beautiful place to keep memories alive. Invite family,
            share stories, post tributes, and preserve the legacy for future
            generations.
          </p>

          <a
            href="/packages"
            className="w-fit rounded-full bg-[#d4af37] px-8 py-4 font-semibold text-[#0b1320] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
          >
            View Packages
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#d4af37]/15 bg-[#08101f] px-4 py-16 text-center sm:px-6">
        <h2 className="mb-4 font-serif text-3xl sm:text-4xl">
          Start preserving a legacy today.
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-gray-400">
          Create a private memorial page your family can visit, share, and add
          to for years to come.
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