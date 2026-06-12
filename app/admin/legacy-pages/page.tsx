import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLegacyPagesPage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (!adminSession || adminSession.value !== "active") {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              ScanMyLegacy Admin
            </p>

            <h1 className="font-serif text-4xl font-bold">Legacy Pages</h1>

            <p className="mt-3 max-w-2xl text-sm text-white/70">
              View and manage all Living Legacy and Memorial pages in one place.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="rounded-full border border-[#d4af37]/50 px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320]"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="rounded-3xl border border-[#d4af37]/20 bg-white/10 p-8">
          <h2 className="font-serif text-2xl text-[#d4af37]">
            All Legacy Pages
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/70">
            This page is ready. Next we will connect it to the database so it
            shows both Living Legacy and Memorial pages with badges.
          </p>
        </div>
      </div>
    </main>
  );
}