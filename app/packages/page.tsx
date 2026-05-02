import SiteHeader from "../components/SiteHeader";
<main className="min-h-screen bg-[#0b1320] text-white">
  </main>
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
    <main className="min-h-screen bg-[#0b1320] px-6 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-center font-serif text-4xl text-[#d4af37]">
          Pricing & Packages
        </h1>

        <p className="mb-6 text-center text-gray-400">
          Choose the legacy plan that best honors your loved one.
        </p>

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
            <p className="text-sm text-gray-400">
              Referral code applied:
            </p>

            <p className="font-mono text-[#d4af37]">
              {refCode}
            </p>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-4">
          {packages.map((pkg) => (
            <div
              key={pkg.slug}
              className="flex min-h-[520px] flex-col rounded-2xl border border-[#d4af37]/50 bg-[#111a2e] p-8 shadow-xl"
            >
              <div className="text-center">
                <h2 className="mb-3 font-serif text-2xl text-white">
                  {pkg.name}
                </h2>

                <div className="text-3xl font-bold text-[#d4af37]">
                  {pkg.usd}
                </div>

                <div className="mt-1 text-lg text-gray-300">
                  {pkg.ttd}
                </div>

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
                className="mt-8 block rounded-lg bg-[#d4af37] px-6 py-3 text-center font-semibold text-black"
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}