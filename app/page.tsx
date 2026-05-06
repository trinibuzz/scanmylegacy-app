import SiteHeader from "./components/SiteHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#061b3a] text-white">
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-[86vh] overflow-hidden bg-[#061b3a]">
        <img
          src="/images/home-hero.jpg"
          alt="Family preserving memories"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#061b3a]/95 via-[#123b78]/88 to-[#061b3a]/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(212,175,55,0.20),transparent_34%),radial-gradient(circle_at_75%_20%,rgba(38,68,127,0.55),transparent_40%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#061b3a] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[86vh] max-w-7xl items-center px-6 py-24 sm:px-8">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex rounded-full border border-[#d4af37]/40 bg-[#061b3a]/35 px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#d4af37] backdrop-blur">
              Scan. Remember. Celebrate Life.
            </div>

            <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-7xl">
              Preserve memories.
              <span className="block text-[#d4af37]">Celebrate lives.</span>
              Keep their legacy alive forever.
            </h1>

            <p className="mb-8 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              Create a private digital memorial where family and friends can
              share photos, videos, voice notes, stories, tributes, candles,
              flowers, and memories that live on for generations.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <a
                href="/packages"
                className="rounded-full bg-[#d4af37] px-8 py-4 text-center font-semibold text-[#061b3a] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
              >
                Book a Spot
              </a>

              <a
                href="/login"
                className="rounded-full border border-[#d4af37]/70 bg-white/5 px-8 py-4 text-center font-semibold text-[#f8f5ee] backdrop-blur transition hover:bg-[#d4af37]/15"
              >
                Register / View Memorial
              </a>

              <a
                href="/packages"
                className="rounded-full border border-white/20 bg-[#061b3a]/35 px-8 py-4 text-center font-semibold text-white/90 backdrop-blur transition hover:border-[#d4af37] hover:text-[#d4af37]"
              >
                See Packages
              </a>
            </div>

            <div className="mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Photos", icon: "📷" },
                { label: "Voice Notes", icon: "🎙️" },
                { label: "Tributes", icon: "🕯️" },
                { label: "Family Tree", icon: "🌳" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#d4af37]/25 bg-[#061b3a]/35 p-4 text-center backdrop-blur"
                >
                  <p className="text-2xl">{item.icon}</p>
                  <p className="mt-2 text-sm font-semibold text-white/85">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EMOTIONAL INTRO */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-20">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
          A Place For Remembrance
        </p>

        <h2 className="mb-6 font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
          When someone you love becomes a memory, that memory deserves a
          beautiful home.
        </h2>

        <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
          ScanMyLegacy gives families a dignified digital space to keep stories,
          photos, songs, messages, and family memories together — so loved ones
          can visit, remember, and feel connected anytime.
        </p>
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

          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Simple for families. Beautiful for visitors. Built to preserve the
            legacy of those who matter most.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Choose a Package",
              text: "Select the memorial plan that fits your family’s needs, from a free starter tribute to long-term legacy options.",
              img: "/images/how-hero.jpg",
            },
            {
              number: "02",
              title: "Build the Memorial",
              text: "Add the life story, cover photo, gallery images, memorial song, videos, voice notes, and family tree.",
              img: "/images/create-hero.jpg",
            },
            {
              number: "03",
              title: "Share With Loved Ones",
              text: "Invite family and friends through a private link or QR code so they can leave tributes, candles, flowers, and memories.",
              img: "/images/welcome-hero.jpg",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="overflow-hidden rounded-3xl border border-[#d4af37]/15 bg-[#082652] shadow-2xl transition hover:-translate-y-1 hover:border-[#d4af37]/40"
            >
              <div className="relative">
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-56 w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#082652] via-transparent to-transparent" />

                <div className="absolute bottom-4 left-4 rounded-full border border-[#d4af37]/40 bg-[#061b3a]/70 px-4 py-2 text-sm font-bold text-[#d4af37] backdrop-blur">
                  {item.number}
                </div>
              </div>

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
      <section className="bg-[#082652] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              Memorial Features
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl">
              Everything families need to remember beautifully
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-300">
              A complete digital memorial experience designed for love,
              remembrance, family connection, and legacy preservation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Life Story",
                desc: "Share the journey, achievements, personality, and treasured moments of your loved one.",
                icon: "📖",
              },
              {
                title: "Photo Slideshow",
                desc: "Create a beautiful tribute gallery with photos that play like a memorial film.",
                icon: "📷",
              },
              {
                title: "Memorial Music",
                desc: "Add a meaningful song or instrumental sound to create a peaceful viewing experience.",
                icon: "🎵",
              },
              {
                title: "Family Chat",
                desc: "Let family and friends share text, photos, videos, and voice notes in one private space.",
                icon: "💬",
              },
              {
                title: "Guestbook",
                desc: "Visitors can leave heartfelt messages of love, comfort, and remembrance.",
                icon: "🕊️",
              },
              {
                title: "Digital Candles",
                desc: "Loved ones can light a candle and leave a short tribute in memory.",
                icon: "🕯️",
              },
              {
                title: "Memorial Garden",
                desc: "Family and friends can plant digital flowers as a symbol of love and remembrance.",
                icon: "🌹",
              },
              {
                title: "Family Tree",
                desc: "Preserve family connections and relationships for future generations.",
                icon: "🌳",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-[#d4af37]/15 bg-[#061b3a]/90 p-6 shadow-lg transition hover:-translate-y-1 hover:border-[#d4af37]/40"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#d4af37]/15 text-xl text-[#d4af37]">
                  {feature.icon}
                </div>

                <h3 className="mb-3 font-serif text-xl text-white">
                  {feature.title}
                </h3>

                <p className="text-sm leading-relaxed text-gray-300">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-[#d4af37]/20 shadow-2xl">
          <img
            src="/images/about-hero.jpg"
            alt="Family remembering a loved one"
            className="h-[340px] w-full object-cover sm:h-[460px]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#061b3a]/85 via-[#061b3a]/20 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-[#d4af37]/25 bg-[#061b3a]/45 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              Private • Beautiful • Always Accessible
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            Built For Families
          </p>

          <h2 className="mb-6 font-serif text-3xl leading-tight sm:text-4xl">
            Because love should never be forgotten.
          </h2>

          <p className="mb-5 leading-relaxed text-gray-300">
            ScanMyLegacy gives Caribbean families and loved ones everywhere a
            private, beautiful place to keep memories alive. Invite family,
            share stories, post tributes, upload media, and preserve the legacy
            for future generations.
          </p>

          <p className="mb-8 leading-relaxed text-gray-300">
            Whether shared by link or accessed by QR code, each memorial becomes
            a lasting space where family can return on birthdays,
            anniversaries, and moments when they simply want to feel close
            again.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="/packages"
              className="rounded-full bg-[#d4af37] px-8 py-4 text-center font-semibold text-[#061b3a] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
            >
              View Packages
            </a>

            <a
              href="/about"
              className="rounded-full border border-[#d4af37]/50 px-8 py-4 text-center font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#061b3a]"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* PACKAGE TEASER */}
      <section className="border-y border-[#d4af37]/15 bg-[#082652] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              Packages
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl">
              Start simple. Upgrade when you are ready.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-300">
              Choose the memorial package that works best for your family.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                name: "Starter Tribute",
                price: "Free",
                detail: "14-day starter memorial",
              },
              {
                name: "Standard Legacy",
                price: "$59",
                detail: "A beautiful 3-year tribute",
              },
              {
                name: "Premium Legacy",
                price: "$89",
                detail: "Expanded features for 5 years",
              },
              {
                name: "Eternal Legacy",
                price: "$129",
                detail: "Lifetime memorial option",
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="rounded-3xl border border-[#d4af37]/20 bg-[#061b3a] p-6 text-center shadow-xl"
              >
                <h3 className="mb-3 font-serif text-xl text-[#d4af37]">
                  {plan.name}
                </h3>

                <p className="mb-2 text-3xl font-bold text-white">
                  {plan.price}
                </p>

                <p className="text-sm text-gray-300">{plan.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href="/packages"
              className="inline-block rounded-full bg-[#d4af37] px-8 py-4 font-semibold text-[#061b3a] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
            >
              Compare Packages
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#061b3a] px-4 py-16 text-center sm:px-6 sm:py-20">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
          Begin The Legacy
        </p>

        <h2 className="mb-4 font-serif text-3xl sm:text-4xl">
          Start preserving a legacy today.
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-gray-300">
          Create a private memorial page your family can visit, share, and add
          to for years to come.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="/packages"
            className="rounded-full bg-[#d4af37] px-8 py-4 font-semibold text-[#061b3a] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
          >
            Book a Spot
          </a>

          <a
            href="/login"
            className="rounded-full border border-[#d4af37]/50 px-8 py-4 font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#061b3a]"
          >
            Register / View Memorial
          </a>
        </div>
      </section>
    </main>
  );
}