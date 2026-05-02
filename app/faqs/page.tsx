import SiteHeader from "../components/SiteHeader";

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
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-[70vh] overflow-hidden bg-[#26447F]">
        <img
          src="/images/faq-hero.jpg"
          alt="Frequently Asked Questions"
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#26447F]/95 via-[#26447F]/82 to-[#0b1320]/45" />

        <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-7xl items-center px-6 py-20 sm:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
              FAQ
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-7xl">
              Frequently Asked Questions
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              Find answers to the most common questions about creating,
              sharing, and managing a beautiful memorial on ScanMyLegacy.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ LIST */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl"
            >
              <h2 className="mb-3 font-serif text-2xl text-[#d4af37]">
                {faq.q}
              </h2>

              <p className="leading-relaxed text-gray-300">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 text-center">
        <h2 className="mb-4 font-serif text-3xl sm:text-4xl">
          Still have questions?
        </h2>

        <p className="mx-auto mb-8 max-w-2xl text-gray-400">
          Explore our packages and choose the memorial plan that best fits your
          family’s needs.
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