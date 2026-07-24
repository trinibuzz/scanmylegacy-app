import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (!adminSession || adminSession.value !== "active") {
    redirect("/admin/login");
  }

  const cards = [
    {
      href: "/admin/living-legacy",
      icon: "✍️",
      title: "Living Legacy Pages",
      description:
        "Pages created by people who are alive and want to preserve their story, wishes, family messages, memories, and instructions for future generations.",
      button: "Open Living Legacy Pages →",
      wide: true,
    },
    {
      href: "/admin/memorial",
      icon: "🕊️",
      title: "Memorial Pages",
      description:
        "Pages created to honor loved ones who have passed away with photos, videos, tributes, candles, flowers, guestbook messages, and family memories.",
      button: "Open Memorial Pages →",
      wide: true,
    },
    {
      href: "/admin/affiliates",
      icon: "🤝",
      title: "Affiliates",
      description:
        "Manage affiliate partners, referral codes, referred customers, referral activity, and commission tracking.",
      button: "Open Affiliates →",
    },
    {
      href: "/admin/trusted-contact-requests",
      icon: "🛡️",
      title: "Trusted Contact Requests",
      description:
        "Review trusted contact requests for legacy release, conversion to memorial, and ownership transfer before anything is approved.",
      button: "Review Requests →",
    },
    {
      href: "/admin/trials",
      icon: "⏳",
      title: "Trial Manager",
      description:
        "View free users, expired trials, living legacy pages, memorial pages, and activate packages after cash or manual payment.",
      button: "Open Trial Manager →",
    },
    {
      href: "/admin/legacy-pages",
      icon: "📖",
      title: "Legacy Pages",
      description:
        "Manage all living legacy and memorial pages, review content, view public links, and see page type badges.",
      button: "Open Legacy Pages →",
    },
    {
      href: "/admin/payments",
      icon: "💳",
      title: "Payments",
      description:
        "Review bank transfer and WiPay payment status for Living Legacy and Memorial packages.",
      button: "Open Payments →",
    },
    {
      href: "/admin/reports",
      icon: "🚩",
      title: "Reports",
      description:
        "Review reported content, flagged chats, and platform activity when this section is enabled.",
      button: "Open Reports →",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            ScanMyLegacy Admin
          </p>

          <h1 className="font-serif text-4xl font-bold">Admin Dashboard</h1>

          <p className="mt-3 max-w-2xl text-sm text-white/70">
            Manage living legacy pages, memorial pages, affiliates, free trials,
            trusted contact requests, manual cash payments, package activations,
            and account status.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {cards.slice(0, 2).map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="block rounded-2xl border border-[#d4af37]/30 bg-white/10 p-6 transition hover:-translate-y-1 hover:border-[#d4af37] hover:bg-white/15"
            >
              <div className="text-3xl">{card.icon}</div>

              <h2 className="mt-4 font-serif text-2xl font-bold text-[#d4af37]">
                {card.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/75">
                {card.description}
              </p>

              <p className="mt-5 text-sm font-semibold text-[#d4af37]">
                {card.button}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {cards.slice(2).map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="block rounded-2xl border border-[#d4af37]/30 bg-white/10 p-6 transition hover:-translate-y-1 hover:border-[#d4af37] hover:bg-white/15"
            >
              <div className="text-3xl">{card.icon}</div>

              <h2 className="mt-4 font-serif text-xl font-bold text-[#d4af37]">
                {card.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/75">
                {card.description}
              </p>

              <p className="mt-5 text-sm font-semibold text-[#d4af37]">
                {card.button}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}