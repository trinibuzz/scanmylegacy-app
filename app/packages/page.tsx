"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SiteHeader from "../components/SiteHeader";

function PackagesContent() {
  const searchParams = useSearchParams();

  const rawRefCode = searchParams.get("ref") || "";
  const refCode = rawRefCode.trim();

  const expiredTrial = searchParams.get("expired") === "1";

  const rawPageType = searchParams.get("type") || "";
  const pageType =
    rawPageType === "living" || rawPageType === "memorial"
      ? rawPageType
      : "";

  const isLiving = pageType === "living";
  const isMemorial = pageType === "memorial";

  const pageTypeLabel = isLiving
    ? "Living Legacy Page"
    : isMemorial
    ? "Memorial Page"
    : "Legacy Page";

  const heroTitle = isLiving
    ? "Invest in a living legacy your family can keep forever."
    : isMemorial
    ? "Choose a memorial package worthy of their memory."
    : "Choose the legacy package that fits your family.";

  const heroText = isLiving
    ? "Preserve your life story, family wisdom, photos, videos, messages, wishes, and memories in one secure page your loved ones can visit for years to come."
    : isMemorial
    ? "Create a beautiful digital memorial where family and friends can visit, share memories, leave tributes, light candles, send flowers, and keep your loved one’s legacy alive."
    : "Build a living legacy page or a memorial page with photos, stories, messages, family history, and memories preserved in one beautiful place.";

  const cleanPackagesLink = pageType
    ? `/packages?type=${pageType}`
    : "/packages";

  const packages = [
    {
      name: "Starter Tribute",
      badge: "Free Trial",
      usd: "Free",
      ttd: "Free",
      years: "14 Days",
      slug: "starter-tribute",
      amount: 0,
      description:
        "A simple way to start building a legacy page and see how it works.",
      includesLine: "Starter includes:",
      bestFor: "Best for testing the service",
      features: [
        "Private legacy page",
        "Guest Access for family and friends",
        "Guestbook / Family Messages",
        "Life Story section",
        "Family Tree",
        "Slideshow preview",
      ],
    },
    {
      name: "Standard Legacy",
      badge: "Popular Start",
      usd: "$59.00 USD",
      ttd: "TTD $400.00",
      years: "3 Years",
      slug: "standard-legacy",
      amount: 59,
      description:
        "A stronger package for families who want a complete legacy page with sharing and core memory features.",
      includesLine: "Includes everything in Starter, plus:",
      bestFor: "Best for most families getting started",
      features: [
        "Everything in Starter Tribute",
        "Secure hosting for 3 years",
        "Shareable legacy page link",
        "Photo uploads",
        "Legacy music / voice note",
        "Blessings or candle feature",
        "Flower garden",
        "Family chatroom",
      ],
    },
    {
      name: "Premium Legacy",
      badge: "Best Value",
      usd: "$89.00 USD",
      ttd: "TTD $600.00",
      years: "5 Years",
      slug: "premium-legacy",
      amount: 89,
      description:
        "The better family package for preserving more memories, media, and heartfelt messages over a longer time.",
      includesLine: "Includes everything in Standard, plus:",
      bestFor: "Best for families sharing photos, videos, and audio",
      features: [
        "Everything in Standard Legacy",
        "5 years of legacy access",
        "Photo, video, and audio memories",
        "Full Guestbook / Family Messages with media",
        "Larger gallery storage",
        "Priority support",
        "Extended legacy storage",
        "Better for active family participation",
      ],
    },
    {
      name: "Eternal Legacy",
      badge: "Lifetime",
      usd: "$129.00 USD",
      ttd: "TTD $875.00",
      years: "Lifetime",
      slug: "eternal-legacy",
      amount: 129,
      description:
        "The long-term preservation package for families who want their legacy page kept as a lasting family archive.",
      includesLine: "Includes everything in Premium, plus:",
      bestFor: "Best for lifetime family preservation",
      features: [
        "Everything in Premium Legacy",
        "Lifetime access",
        "Permanent hosting",
        "Unlimited memory preservation",
        "Premium legacy page",
        "Long-term family history archive",
        "Best value for generations",
        "Maintenance only $25 USD every 5 years",
      ],
    },
  ];

  const clearReferral = () => {
    localStorage.removeItem("ref");
    localStorage.removeItem("referral");
    localStorage.removeItem("affiliate_ref");
    localStorage.removeItem("affiliateCode");
    localStorage.removeItem("referralCode");
    localStorage.removeItem("scanmylegacy_ref");

    sessionStorage.removeItem("scanmylegacy_ref");
    sessionStorage.removeItem("ref");
    sessionStorage.removeItem("referral");
    sessionStorage.removeItem("affiliate_ref");
    sessionStorage.removeItem("affiliateCode");
    sessionStorage.removeItem("referralCode");

    window.location.href = cleanPackagesLink;
  };

  const buildPackageLink = (pkg: { slug: string; amount: number }) => {
    const params = new URLSearchParams();

    params.set("package", pkg.slug);
    params.set("price", String(pkg.amount));

    if (pageType) {
      params.set("type", pageType);
    }

    if (refCode) {
      params.set("ref", refCode);
    }

    return `/create-memorial?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <SiteHeader />

      <section className="relative min-h-[68vh] overflow-hidden bg-[#26447F]">
        <img
          src="/images/home-hero.jpg"
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
              {heroTitle}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              {heroText}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex rounded-full border border-[#d4af37]/40 bg-[#0b1320]/45 px-5 py-3 text-sm font-semibold text-[#d4af37] backdrop-blur">
                Selected: {pageTypeLabel}
              </div>

              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white/85 backdrop-blur">
                Higher packages include all smaller package features
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {!pageType && (
          <div className="mx-auto mb-10 max-w-4xl rounded-2xl border border-[#d4af37]/40 bg-[#111a2e] p-6 text-center shadow-2xl">
            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              Choose Your Page Type
            </p>

            <h2 className="mb-4 font-serif text-3xl text-white">
              What would you like to create?
            </h2>

            <p className="mx-auto mb-6 max-w-2xl text-gray-300">
              You can build a living legacy page for yourself or create a
              memorial page for a loved one who has passed away.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="/packages?type=living"
                className="rounded-full bg-[#d4af37] px-7 py-3 font-semibold text-[#0b1320] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a]"
              >
                Living Legacy Page
              </a>

              <a
                href="/packages?type=memorial"
                className="rounded-full border border-[#d4af37]/60 px-7 py-3 font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320]"
              >
                Memorial Page
              </a>
            </div>
          </div>
        )}

        {expiredTrial && (
          <div className="mx-auto mb-10 max-w-3xl rounded-2xl border border-[#d4af37]/50 bg-[#111a2e] p-8 text-center shadow-2xl">
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              Keep Their Story Alive
            </p>

            <h2 className="mb-4 font-serif text-3xl text-white">
              Your Free Trial Has Ended
            </h2>

            <p className="mx-auto max-w-2xl text-gray-300">
              Your free trial has ended, but the memories do not have to stop
              here. Please choose a paid package to continue preserving and
              sharing this legacy page.
            </p>
          </div>
        )}

        {refCode && (
          <div className="mx-auto mb-10 max-w-xl rounded-xl border border-[#d4af37]/40 bg-[#111a2e] p-4 text-center">
            <p className="text-sm text-gray-400">Referral code applied:</p>
            <p className="font-mono text-[#d4af37]">{refCode}</p>

            <button
              type="button"
              onClick={clearReferral}
              className="mt-4 inline-flex rounded-full border border-red-400/40 px-4 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/20"
            >
              Remove Referral For Testing
            </button>
          </div>
        )}

        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            {pageTypeLabel}
          </p>

          <h2 className="font-serif text-3xl text-white sm:text-4xl">
            Select Your Package
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-gray-300">
            Each package builds on the one before it. Choose the plan that gives
            your family the level of preservation, access, and media support
            they need.
          </p>
        </div>

        <div className="mb-10 grid gap-4 rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-2xl md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-serif text-2xl text-[#d4af37]">
              What is Guest Access?
            </h3>

            <p className="text-sm leading-relaxed text-gray-300">
              Guest Access lets invited family and friends enter the private
              legacy page by typing their name. This allows them to view the
              page, slideshow, story, family tree, blessings, flowers, chat, and
              available memories.
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-serif text-2xl text-[#d4af37]">
              What is Guestbook / Family Messages?
            </h3>

            <p className="text-sm leading-relaxed text-gray-300">
              Guestbook or Family Messages lets visitors leave written
              memories, tributes, blessings, photos, videos, and audio messages
              on the page. It is where family members can contribute to the
              legacy, not just view it.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {packages.map((pkg) => {
            const freeTrialBlocked = expiredTrial && pkg.amount === 0;
            const isBestValue = pkg.slug === "premium-legacy";
            const isLifetime = pkg.slug === "eternal-legacy";

            return (
              <div
                key={pkg.slug}
                className={`relative flex min-h-[660px] flex-col rounded-3xl border p-7 shadow-xl transition ${
                  freeTrialBlocked
                    ? "border-gray-700 bg-[#111a2e]/40 opacity-50"
                    : isBestValue
                    ? "border-[#d4af37] bg-[#111a2e] shadow-[0_0_35px_rgba(212,175,55,0.2)] hover:-translate-y-1"
                    : "border-[#d4af37]/40 bg-[#111a2e] hover:-translate-y-1 hover:border-[#d4af37]"
                }`}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] ${
                      isBestValue
                        ? "bg-[#d4af37] text-[#0b1320]"
                        : isLifetime
                        ? "bg-white text-[#0b1320]"
                        : "border border-[#d4af37]/40 bg-[#0b1320] text-[#d4af37]"
                    }`}
                  >
                    {pkg.badge}
                  </span>
                </div>

                <div className="pt-4 text-center">
                  <h2
                    className={`mb-3 font-serif text-2xl ${
                      freeTrialBlocked ? "text-gray-400" : "text-white"
                    }`}
                  >
                    {pkg.name}
                  </h2>

                  <div
                    className={`text-3xl font-bold ${
                      freeTrialBlocked ? "text-gray-500" : "text-[#d4af37]"
                    }`}
                  >
                    {pkg.usd}
                  </div>

                  <div className="mt-1 text-lg text-gray-300">{pkg.ttd}</div>

                  <div className="mt-2 text-sm uppercase tracking-widest text-gray-400">
                    {pkg.years}
                  </div>

                  <p className="mx-auto mt-4 min-h-[72px] text-sm leading-relaxed text-gray-300">
                    {pkg.description}
                  </p>

                  <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] px-4 py-3 text-xs font-semibold text-[#d4af37]">
                    {pkg.bestFor}
                  </div>

                  {freeTrialBlocked && (
                    <div className="mt-4 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200">
                      Free Trial Already Used
                    </div>
                  )}
                </div>

                <div className="mt-7">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#d4af37]">
                    {pkg.includesLine}
                  </p>

                  <ul className="flex-1 space-y-3 text-sm leading-relaxed text-gray-300">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <span className="text-[#d4af37]">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {freeTrialBlocked ? (
                  <button
                    type="button"
                    disabled
                    className="mt-auto block cursor-not-allowed rounded-full bg-gray-700 px-6 py-4 text-center font-semibold text-gray-300"
                  >
                    Free Trial Used
                  </button>
                ) : (
                  <a
                    href={buildPackageLink(pkg)}
                    className={`mt-auto block rounded-full px-6 py-4 text-center font-semibold shadow-xl transition hover:scale-105 ${
                      isBestValue
                        ? "bg-[#f0c94a] text-[#0b1320] hover:bg-[#d4af37]"
                        : "bg-[#d4af37] text-[#0b1320] hover:bg-[#f0c94a]"
                    }`}
                  >
                    {pkg.amount === 0 ? "Start Free Trial" : "Get Started"}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
          Loading packages...
        </main>
      }
    >
      <PackagesContent />
    </Suspense>
  );
}