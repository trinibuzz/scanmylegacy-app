import SiteHeader from "./components/SiteHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#061b3a] text-white">
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-[86vh] overflow-hidden bg-[#061b3a]">
        <img
          src="/images/home-hero.jpg"
          alt="Family preserving memories and legacy"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#061b3a]/95 via-[#123b78]/88 to-[#061b3a]/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(212,175,55,0.20),transparent_34%),radial-gradient(circle_at_75%_20%,rgba(38,68,127,0.55),transparent_40%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#061b3a] to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[86vh] max-w-7xl items-center px-6 py-24 sm:px-8">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex rounded-full border border-[#d4af37]/40 bg-[#061b3a]/35 px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#d4af37] backdrop-blur">
              Leave Your Story. Share Your Wishes. Preserve Your Legacy.
            </div>

            <h1 className="mb-6 font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-7xl">
              Preserve your story.
              <span className="block text-[#d4af37]">Guide your family.</span>
              Leave a legacy for generations.
            </h1>

            <p className="mb-8 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              ScanMyLegacy helps you create a secure digital legacy page where
              your life story, family memories, final wishes, personal messages,
              photos, videos, and important instructions can be preserved for
              the people you love — now and for generations to come.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <a
                href="/packages?type=living"
                className="rounded-full bg-[#d4af37] px-8 py-4 text-center font-semibold text-[#061b3a] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
              >
                Create My Legacy Page
              </a>

              <a
                href="/packages?type=memorial"
                className="rounded-full border border-[#d4af37]/70 bg-white/5 px-8 py-4 text-center font-semibold text-[#f8f5ee] backdrop-blur transition hover:bg-[#d4af37]/15"
              >
                Create a Memorial Page
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
                { label: "Life Story", icon: "📖" },
                { label: "Final Wishes", icon: "📝" },
                { label: "Family Messages", icon: "💌" },
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
          A Place For Legacy
        </p>

        <h2 className="mb-6 font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
          Your story, your wishes, and your love deserve to live on for the
          people who matter most.
        </h2>

        <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-300 sm:text-lg">
          ScanMyLegacy gives families a dignified digital space to preserve life
          stories, photos, videos, voice notes, final wishes, instructions,
          family history, and heartfelt messages — whether you are building your
          own legacy today or honoring someone who has passed.
        </p>
      </section>

      {/* CHOOSE YOUR PATH */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            Choose Your Path
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl">
            What would you like to create?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Build your own legacy while you are still here, or create a lasting
            memorial page for a loved one who has passed away.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#082652] p-7 shadow-2xl transition hover:-translate-y-1 hover:border-[#d4af37]/45">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/15 text-2xl">
              ✍️
            </div>

            <h3 className="mb-4 font-serif text-3xl text-[#d4af37]">
              Living Legacy Page
            </h3>

            <p className="mb-6 leading-relaxed text-gray-300">
              Create your own legacy page while you are still here. Share your
              story, leave messages for family, write down your wishes, thank
              the people who stood by you, and preserve memories for your
              children, grandchildren, and generations to come.
            </p>

            <ul className="mb-8 space-y-3 text-sm leading-relaxed text-gray-300">
              <li>• Share your life story and personal journey</li>
              <li>• Leave messages for family and loved ones</li>
              <li>• Record final wishes and important instructions</li>
              <li>• Thank the people who made a difference in your life</li>
              <li>• Preserve photos, videos, memories, and family history</li>
            </ul>

            <a
              href="/packages?type=living"
              className="inline-block rounded-full bg-[#d4af37] px-7 py-3 font-semibold text-[#061b3a] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
            >
              Start My Legacy Page
            </a>
          </div>

          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#082652] p-7 shadow-2xl transition hover:-translate-y-1 hover:border-[#d4af37]/45">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#d4af37]/15 text-2xl">
              🕊️
            </div>

            <h3 className="mb-4 font-serif text-3xl text-[#d4af37]">
              Memorial Page
            </h3>

            <p className="mb-6 leading-relaxed text-gray-300">
              Honor a loved one who has passed away with a beautiful digital
              memorial page filled with photos, videos, tributes, candles,
              music, family tree, guestbook messages, and memories family and
              friends can visit anytime.
            </p>

            <ul className="mb-8 space-y-3 text-sm leading-relaxed text-gray-300">
              <li>• Create a lasting digital tribute</li>
              <li>• Add photos, videos, music, and memories</li>
              <li>• Allow family and friends to leave messages</li>
              <li>• Light candles and plant flowers virtually</li>
              <li>• Share the page by QR code or private link</li>
            </ul>

            <a
              href="/packages?type=memorial"
              className="inline-block rounded-full border border-[#d4af37]/70 bg-white/5 px-7 py-3 font-semibold text-[#f8f5ee] backdrop-blur transition hover:bg-[#d4af37] hover:text-[#061b3a]"
            >
              Create a Memorial Page
            </a>
          </div>
        </div>
      </section>

      {/* GIFT A LEGACY */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="overflow-hidden rounded-3xl border border-[#d4af37]/25 bg-[#082652] shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr]">
            <div className="relative min-h-[340px] overflow-hidden">
              <img
                src="/images/welcome-hero.jpg"
                alt="Gift a legacy page to family"
                className="absolute inset-0 h-full w-full object-cover opacity-55"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#061b3a]/95 via-[#061b3a]/70 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(212,175,55,0.28),transparent_35%)]" />

              <div className="relative z-10 flex min-h-[340px] flex-col justify-center p-7 sm:p-10">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#061b3a]/70 text-3xl backdrop-blur">
                  🎁
                </div>

                <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
                  Gift A Legacy
                </p>

                <h2 className="max-w-xl font-serif text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
                  Give someone the gift of preserving their story.
                </h2>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-300">
                  Buy a Living Legacy or Memorial package for a parent,
                  grandparent, family elder, loved one, or friend. They can
                  create their page later, and the package will already be paid
                  for.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="mb-6 rounded-2xl border border-[#d4af37]/20 bg-[#061b3a]/75 p-5">
                <h3 className="mb-3 font-serif text-2xl text-[#d4af37]">
                  Perfect for:
                </h3>

                <div className="grid grid-cols-1 gap-3 text-sm text-gray-300 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#d4af37]/10 bg-[#082652] p-3">
                    ✓ Parents
                  </div>
                  <div className="rounded-xl border border-[#d4af37]/10 bg-[#082652] p-3">
                    ✓ Grandparents
                  </div>
                  <div className="rounded-xl border border-[#d4af37]/10 bg-[#082652] p-3">
                    ✓ Family elders
                  </div>
                  <div className="rounded-xl border border-[#d4af37]/10 bg-[#082652] p-3">
                    ✓ Memorial tributes
                  </div>
                </div>
              </div>

              <p className="mb-6 text-sm leading-relaxed text-gray-300">
                A gift order lets someone pay for the legacy page first. Once
                the recipient or family links the gift to their page, the page
                can be activated without asking them to pay again.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="/gift/start"
                  className="rounded-full bg-[#d4af37] px-8 py-4 text-center font-semibold text-[#061b3a] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
                >
                  Buy A Legacy Page As A Gift
                </a>

                <a
                  href="/packages"
                  className="rounded-full border border-[#d4af37]/60 px-8 py-4 text-center font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#061b3a]"
                >
                  View Packages First
                </a>
              </div>
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
            Create a lasting legacy in minutes
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-gray-300">
            Simple for families. Beautiful for visitors. Built to preserve
            stories, wishes, memories, and love for generations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              number: "01",
              title: "Choose Your Page Type",
              text: "Start a living legacy page for yourself or create a memorial page for a loved one who has passed away.",
              img: "/images/how-hero.jpg",
            },
            {
              number: "02",
              title: "Build The Legacy",
              text: "Add life story, photos, videos, voice notes, final wishes, family messages, important instructions, and family tree.",
              img: "/images/create-hero.jpg",
            },
            {
              number: "03",
              title: "Share With Loved Ones",
              text: "Invite family and friends through a private link or QR code so they can visit, contribute, remember, and stay connected.",
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
              Legacy Features
            </p>

            <h2 className="font-serif text-3xl sm:text-4xl">
              Everything families need to preserve a life beautifully
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-300">
              A complete digital legacy experience designed for memories, final
              wishes, family connection, personal messages, and remembrance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Life Story",
                desc: "Share your journey, achievements, personality, lessons, memories, and the moments that shaped your life.",
                icon: "📖",
              },
              {
                title: "Final Wishes",
                desc: "Leave personal wishes, service preferences, instructions, and guidance for your family.",
                icon: "📝",
              },
              {
                title: "Family Messages",
                desc: "Create heartfelt messages for children, grandchildren, spouse, siblings, friends, and loved ones.",
                icon: "💌",
              },
              {
                title: "Photo Slideshow",
                desc: "Create a beautiful gallery with photos that tell your story and preserve special memories.",
                icon: "📷",
              },
              {
                title: "Voice Notes",
                desc: "Record voice messages, blessings, thank-yous, memories, and words your family can keep forever.",
                icon: "🎙️",
              },
              {
                title: "Guestbook",
                desc: "Visitors can leave heartfelt messages of love, comfort, gratitude, and remembrance.",
                icon: "🕊️",
              },
              {
                title: "Digital Candles",
                desc: "Loved ones can light a candle and leave a short tribute in honor or memory.",
                icon: "🕯️",
              },
              {
                title: "Family Tree",
                desc: "Preserve family connections and relationships so future generations know where they came from.",
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
            alt="Family preserving legacy"
            className="h-[340px] w-full object-cover sm:h-[460px]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#061b3a]/85 via-[#061b3a]/20 to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-[#d4af37]/25 bg-[#061b3a]/45 p-5 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              Private • Meaningful • Always Accessible
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            Built For Families
          </p>

          <h2 className="mb-6 font-serif text-3xl leading-tight sm:text-4xl">
            Because every life has a story worth preserving.
          </h2>

          <p className="mb-5 leading-relaxed text-gray-300">
            ScanMyLegacy gives Caribbean families and loved ones everywhere a
            private, beautiful place to preserve stories, memories, wishes,
            instructions, family history, and personal messages for future
            generations.
          </p>

          <p className="mb-8 leading-relaxed text-gray-300">
            Whether shared by link or accessed by QR code, each legacy page
            becomes a lasting space where family can return on birthdays,
            anniversaries, special moments, or anytime they want to feel close
            and connected.
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
              Choose the legacy package that works best for you and your family.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                name: "Starter Tribute",
                price: "Free",
                detail: "14-day starter legacy page",
              },
              {
                name: "Standard Legacy",
                price: "$59",
                detail: "A beautiful 3-year legacy page",
              },
              {
                name: "Premium Legacy",
                price: "$89",
                detail: "Expanded features for 5 years",
              },
              {
                name: "Eternal Legacy",
                price: "$129",
                detail: "Lifetime legacy option",
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

      {/* IMPORTANT NOTICE */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-3xl border border-[#d4af37]/25 bg-[#082652] p-6 text-center shadow-xl">
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            Important Notice
          </p>

          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-300">
            ScanMyLegacy is a personal legacy and memory preservation platform.
            It does not replace a legal will, estate plan, financial advice, or
            legal advice. For legal matters, families should consult a qualified
            professional.
          </p>
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
          Create a private legacy page your family can visit, share, and add to
          for years to come.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <a
            href="/packages?type=living"
            className="rounded-full bg-[#d4af37] px-8 py-4 font-semibold text-[#061b3a] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
          >
            Create My Legacy Page
          </a>

          <a
            href="/login"
            className="rounded-full border border-[#d4af37]/50 px-8 py-4 font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#061b3a]"
          >
            Register / View Legacy
          </a>
        </div>
      </section>
    </main>
  );
}