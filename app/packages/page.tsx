import SiteHeader from "../components/SiteHeader";

export default function PackagesPage({
  searchParams,
}: {
  searchParams?: { ref?: string; expired?: string };
}) {
  const refCode = searchParams?.ref || "";
  const expiredTrial = searchParams?.expired === "1";

  const packages = [
    {
      name: "Starter Tribute",
      usd: "Free",
      ttd: "Free",
      years: "14 Days",
      slug: "starter-tribute",
      amount: 0,
      features: [
        "Guest Book",
        "Life Timeline",
        "Stories & Tributes",
        "Family Tree",
      ],
    },
    {
      name: "Standard Legacy",
      usd: "$59.00 USD",
      ttd: "TTD $400.00",
      years: "3 Years",
      slug: "standard-legacy",
      amount: 59,
      features: [
        "Secure Hosting",
        "Sharable Memorial Page",
        "Photo Upload",
        "Guest Access",
      ],
    },
    {
      name: "Premium Legacy",
      usd: "$89.00 USD",
      ttd: "TTD $600.00",
      years: "5 Years",
      slug: "premium-legacy",
      amount: 89,
      features: [
        "Priority Support",
        "Extended Storage",
        "Photo/Video/Audio Memories",
        "Guestbook",
      ],
    },
    {
      name: "Eternal Legacy",
      usd: "$129.00 USD",
      ttd: "TTD $875.00",
      years: "Lifetime",
      slug: "eternal-legacy",
      amount: 129,
      features: [
        "Lifetime Access",
        "Permanent Hosting",
        "Unlimited Memory Preservation",
        "Premium Legacy Page",
      ],
    },
  ];

  const buildPackageLink = (pkg: any) => {
    const base = `/create-memorial?package=${pkg.slug}&price=${pkg.amount}`;

    if (!refCode) {
      return base;
    }

    return `${base}&ref=${encodeURIComponent(refCode)}`;
  };

  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <SiteHeader />

      {/* HERO */}
      <section className="relative min-h-[68vh] overflow-hidden bg-[#26447F]">
        <img
          src="/images/packages-hero.jpg"
          alt="ScanMyLegacy packages"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#26447F]/95 via-[#26447F]/84 to-[#0b1320]/50" />

        <div className="relative z-10 mx-auto flex min-h-[68vh] max-w-7xl items-center px-6 py-20 sm:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
              Pricing & Packages
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-7xl">
              Choose the legacy plan that honors your loved one.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              Start with a free tribute or choose a lasting memorial package
              designed to preserve photos, stories, tributes, and family
              memories for years to come.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {expiredTrial && (
          <div className="mx-auto mb-10 max-w-3xl rounded-2xl border border-[#d4af37]/50 bg-[#111a2e] p-8 text-center shadow-2xl">
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              Keep Their Story Alive
            </p>

            <h2 className="mb-4 font-serif text-3xl text-white">
              Your Free Memorial Trial Has Ended
            </h2>

            <p className="mx-auto max-w-2xl text-gray-300">
              Your free memorial trial has ended, but the memories don’t have
              to stop here. Choose a package to continue celebrating,
              preserving, and sharing your loved one’s legacy.
            </p>
          </div>
        )}

        {refCode && (
          <div className="mx-auto mb-10 max-w-xl rounded-xl border border-[#d4af37]/40 bg-[#111a2e] p-4 text-center">
            <p className="text-sm text-gray-400">Referral code applied:</p>

            <p className="font-mono text-[#d4af37]">{refCode}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <div
              key={pkg.slug}
              className="flex min-h-[520px] flex-col rounded-2xl border border-[#d4af37]/40 bg-[#111a2e] p-8 shadow-xl transition hover:-translate-y-1 hover:border-[#d4af37]"
            >
              <div className="text-center">
                <h2 className="mb-3 font-serif text-2xl text-white">
                  {pkg.name}
                </h2>

                <div className="text-3xl font-bold text-[#d4af37]">
                  {pkg.usd}
                </div>

                <div className="mt-1 text-lg text-gray-300">{pkg.ttd}</div>

                <div className="mt-2 text-sm uppercase tracking-widest text-gray-400">
                  {pkg.years}
                </div>
              </div>

              <ul className="mt-8 flex-1 space-y-3 text-gray-300">
                {pkg.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <a
                href={buildPackageLink(pkg)}
                className="mt-8 block rounded-full bg-[#d4af37] px-6 py-4 text-center font-semibold text-[#0b1320] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}