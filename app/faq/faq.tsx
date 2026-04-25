export default function FAQPage() {
  const faqs = [
    {
      q: "How does ScanMyLegacy work?",
      a: "Choose a package, create the memorial, upload memories, and share with loved ones.",
    },
    {
      q: "Can family members contribute?",
      a: "Yes. Family and friends can leave tributes, guestbook messages, photos, videos, and audio.",
    },
    {
      q: "Is the memorial private?",
      a: "Yes. Memorials are private and accessible only by invite link or QR code.",
    },
    {
      q: "Can I edit the memorial later?",
      a: "Yes. You can update stories, photos, and details anytime.",
    },
    {
      q: "How long does the memorial stay online?",
      a: "It depends on the package selected — from trial to lifetime access.",
    },
    {
      q: "Can I upgrade my package later?",
      a: "Yes. Upgrades can be done at any time.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <section className="relative h-[420px] overflow-hidden">
        <img
          src="/images/faq-hero.jpg"
          alt="Frequently Asked Questions"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />

        <div className="absolute inset-0 bg-[#0b1320]/70" />

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-6">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#d4af37]">
              FAQ
            </p>

            <h1 className="font-serif text-5xl">
              Frequently Asked Questions
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-[#d4af37]/20 bg-[#111a2e] p-6"
            >
              <h2 className="mb-3 font-serif text-2xl text-[#d4af37]">
                {faq.q}
              </h2>

              <p className="leading-relaxed text-gray-300">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 text-center">
        <h2 className="mb-6 font-serif text-4xl">
          Still have questions?
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