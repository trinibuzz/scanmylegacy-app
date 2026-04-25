export default function PackagesPage() {
  const packages = [
    {
      name: "Starter Tribute",
      price: "Free",
      slug: "starter-tribute",
      amount: 0,
      features: [
        "14 Days Access",
        "Guest Book",
        "Life Timeline",
        "Stories & Tributes",
        "Family Tree",
      ],
    },
    {
      name: "Standard Legacy",
      price: "$59 USD",
      slug: "standard-legacy",
      amount: 59,
      features: [
        "3 Years Access",
        "Secure Hosting",
        "Sharable Memorial Page",
      ],
    },
    {
      name: "Premium Legacy",
      price: "$89 USD",
      slug: "premium-legacy",
      amount: 89,
      features: [
        "5 Years Access",
        "Priority Support",
        "Extended Memory Storage",
      ],
    },
    {
      name: "Eternal Legacy",
      price: "$129 USD",
      slug: "eternal-legacy",
      amount: 129,
      features: [
        "Lifetime Access",
        "Unlimited Memory Preservation",
        "Permanent Hosting",
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f8f8] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-12 text-center text-4xl font-serif">
          Pricing & Packages
        </h1>

        <div className="grid gap-8 md:grid-cols-4">
          {packages.map((pkg) => (
            <div
              key={pkg.slug}
              className="rounded-2xl border bg-white p-8 shadow-lg"
            >
              <h2 className="mb-4 text-2xl font-serif">{pkg.name}</h2>

              <div className="mb-6 text-4xl font-bold">
                {pkg.price}
              </div>

              <ul className="mb-8 space-y-3 text-gray-600">
                {pkg.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <a
                href={`/create-memorial?package=${pkg.slug}&price=${pkg.amount}`}
                className="block rounded bg-[#87CEEB] px-6 py-3 text-center font-semibold text-white"
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