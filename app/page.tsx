export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <section className="relative min-h-[75vh] overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="Family preserving memories"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1320] via-[#0b1320]/80 to-transparent" />

        <div className="relative mx-auto flex min-h-[75vh] max-w-7xl items-center px-6">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              ScanMy Legacy
            </p>

            <h1 className="mb-6 font-serif text-5xl leading-tight md:text-6xl">
              Their story deserves to live forever.
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-gray-300">
              Preserve photos, videos, voice notes, stories, and heartfelt
              tributes in one private digital memorial your family can visit
              anytime.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/packages"
                className="rounded-lg bg-[#d4af37] px-6 py-3 font-semibold text-black"
              >
                Create a Legacy
              </a>

              <a
                href="/login"
                className="rounded-lg border border-[#d4af37] px-6 py-3 text-[#d4af37]"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            How It Works
          </p>
          <h2 className="font-serif text-4xl">Create a lasting tribute in minutes</h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Choose a Package",
              text: "Select the memorial plan that fits your family’s needs.",
              img: "/images/how-1.jpg",
            },
            {
              title: "Build the Memorial",
              text: "Add photos, videos, voice notes, life stories, and memories.",
              img: "/images/how-2.jpg",
            },
            {
              title: "Invite Loved Ones",
              text: "Share a private invite link or QR code with family and friends.",
              img: "/images/how-3.jpg",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="overflow-hidden rounded-2xl border border-[#1f2a44] bg-[#111a2e]"
            >
              <img src={item.img} alt={item.title} className="h-56 w-full object-cover" />
              <div className="p-6">
                <h3 className="mb-3 font-serif text-2xl text-[#d4af37]">
                  {item.title}
                </h3>
                <p className="text-gray-300">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#111a2e] px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              Features
            </p>
            <h2 className="font-serif text-4xl">Everything families need to remember</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
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
                className="rounded-xl border border-[#d4af37]/30 bg-[#0b1320] p-5 text-center"
              >
                <p className="text-[#d4af37]">✦</p>
                <h3 className="mt-2 font-semibold">{feature}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-2">
        <img
          src="/images/trust.jpg"
          alt="Family remembering a loved one"
          className="h-[420px] w-full rounded-2xl object-cover shadow-2xl"
        />

        <div className="flex flex-col justify-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
            Built For Families
          </p>

          <h2 className="mb-6 font-serif text-4xl">
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
            className="w-fit rounded-lg bg-[#d4af37] px-6 py-3 font-semibold text-black"
          >
            View Packages
          </a>
        </div>
      </section>

      <section className="border-t border-[#1f2a44] px-6 py-16 text-center">
        <h2 className="mb-4 font-serif text-4xl">
          Start preserving a legacy today.
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-gray-400">
          Create a private memorial page your family can visit, share, and add
          to for years to come.
        </p>

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