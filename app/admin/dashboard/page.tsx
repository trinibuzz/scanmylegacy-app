import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (!adminSession || adminSession.value !== "active") {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            ScanMyLegacy Admin
          </p>

          <h1 className="font-serif text-4xl font-bold">Admin Dashboard</h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            Manage living legacy pages, memorial pages, free trials, manual
            cash payments, package activations, and account status.
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
            <div className="mb-3 text-3xl">✍️</div>
            <h2 className="font-serif text-2xl text-emerald-200">
              Living Legacy Pages
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              Pages created by people who are alive and want to preserve their
              story, wishes, family messages, memories, and instructions for
              future generations.
            </p>
          </div>

          <div className="rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/10 p-5">
            <div className="mb-3 text-3xl">🕊️</div>
            <h2 className="font-serif text-2xl text-[#d4af37]">
              Memorial Pages
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">
              Pages created to honor loved ones who have passed away with
              photos, videos, tributes, candles, flowers, guestbook messages,
              and family memories.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Link
            href="/admin/trials"
            className="group rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-6 shadow-xl transition hover:-translate-y-1 hover:border-[#d4af37] hover:bg-[#18243d]"
          >
            <div className="mb-4 text-4xl transition group-hover:scale-110">
              ⏳
            </div>

            <h2 className="mb-2 font-serif text-2xl text-[#d4af37]">
              Trial Manager
            </h2>

            <p className="text-sm leading-relaxed text-gray-400">
              View free users, expired trials, living legacy pages, memorial
              pages, and activate packages after cash or manual payment.
            </p>

            <p className="mt-5 text-sm font-semibold text-[#d4af37]">
              Open Trial Manager →
            </p>
          </Link>

          <Link
            href="/admin/memorials"
            className="group rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-6 shadow-xl transition hover:-translate-y-1 hover:border-[#d4af37] hover:bg-[#18243d]"
          >
            <div className="mb-4 text-4xl transition group-hover:scale-110">
              📖
            </div>

            <h2 className="mb-2 font-serif text-2xl text-[#d4af37]">
              Legacy Pages
            </h2>

            <p className="text-sm leading-relaxed text-gray-400">
              Manage all living legacy and memorial pages, review content, view
              public links, and see page type badges.
            </p>

            <p className="mt-5 text-sm font-semibold text-[#d4af37]">
              Open Legacy Pages →
            </p>
          </Link>

          <Link
            href="/admin/bank-transfers"
            className="group rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-6 shadow-xl transition hover:-translate-y-1 hover:border-[#d4af37] hover:bg-[#18243d]"
          >
            <div className="mb-4 text-4xl transition group-hover:scale-110">
              💳
            </div>

            <h2 className="mb-2 font-serif text-2xl text-[#d4af37]">
              Payments
            </h2>

            <p className="text-sm leading-relaxed text-gray-400">
              Review bank transfer and WiPay payment status for Living Legacy
              and Memorial packages.
            </p>

            <p className="mt-5 text-sm font-semibold text-[#d4af37]">
              Open Payments →
            </p>
          </Link>

          <Link
            href="/admin/reports"
            className="group rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-6 shadow-xl transition hover:-translate-y-1 hover:border-[#d4af37] hover:bg-[#18243d]"
          >
            <div className="mb-4 text-4xl transition group-hover:scale-110">
              🛡️
            </div>

            <h2 className="mb-2 font-serif text-2xl text-[#d4af37]">
              Reports
            </h2>

            <p className="text-sm leading-relaxed text-gray-400">
              Review reported content, flagged chats, and platform activity
              when this section is enabled.
            </p>

            <p className="mt-5 text-sm font-semibold text-[#d4af37]">
              Open Reports →
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}