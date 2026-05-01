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
            Manage memorial accounts, free trials, manual cash payments,
            package activations, and account status.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Link
            href="/admin/trials"
            className="rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-6 transition hover:border-[#d4af37]"
          >
            <div className="mb-4 text-4xl">⏳</div>
            <h2 className="mb-2 font-serif text-2xl text-[#d4af37]">
              Trial Manager
            </h2>
            <p className="text-sm text-gray-400">
              View free users, expired trials, and activate packages after
              cash or manual payment.
            </p>
          </Link>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 opacity-70">
            <div className="mb-4 text-4xl">🕯️</div>
            <h2 className="mb-2 font-serif text-2xl text-[#d4af37]">
              Memorials
            </h2>
            <p className="text-sm text-gray-400">
              Coming next: manage all memorials, review content, and view links.
            </p>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 opacity-70">
            <div className="mb-4 text-4xl">💳</div>
            <h2 className="mb-2 font-serif text-2xl text-[#d4af37]">
              Payments
            </h2>
            <p className="text-sm text-gray-400">
              Coming next: review bank transfer and WiPay payment status.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
