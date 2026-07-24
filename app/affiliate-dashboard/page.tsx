import { db } from "../../lib/db";
import { cookies } from "next/headers";
import Link from "next/link";
import AffiliateTools from "./AffiliateTools";

export default async function AffiliateDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("affiliate_session");

  if (!sessionCookie) {
    return (
      <main className="min-h-screen bg-[#0b1320] p-8 text-white">
        <h1 className="font-serif text-4xl text-[#d4af37]">
          Affiliate Dashboard
        </h1>

        <p className="mt-4 text-red-400">You must log in first.</p>

        <Link
          href="/affiliate-login"
          className="mt-6 inline-block rounded-full bg-[#d4af37] px-6 py-3 font-semibold text-[#061b3a]"
        >
          Go to Affiliate Login
        </Link>
      </main>
    );
  }

  const [sessionRows]: any = await db.execute(
    "SELECT * FROM affiliate_sessions WHERE id = ? LIMIT 1",
    [sessionCookie.value]
  );

  if (sessionRows.length === 0) {
    return (
      <main className="min-h-screen bg-[#0b1320] p-8 text-white">
        <p>Invalid session.</p>

        <Link
          href="/affiliate-login"
          className="mt-6 inline-block rounded-full bg-[#d4af37] px-6 py-3 font-semibold text-[#061b3a]"
        >
          Login Again
        </Link>
      </main>
    );
  }

  const session = sessionRows[0];

  const [affiliateRows]: any = await db.execute(
    "SELECT * FROM affiliates WHERE id = ? LIMIT 1",
    [session.affiliate_id]
  );

  if (affiliateRows.length === 0) {
    return (
      <main className="min-h-screen bg-[#0b1320] p-8 text-white">
        <p>Affiliate not found.</p>
      </main>
    );
  }

  const affiliate = affiliateRows[0];

  const [referrals]: any = await db.execute(
    `SELECT * FROM affiliate_referrals
     WHERE affiliate_id = ?
     ORDER BY created_at DESC`,
    [affiliate.id]
  );

  const totalReferrals = referrals.length;

  const pendingCommission = referrals
    .filter((ref: any) => ref.payment_status === "pending")
    .reduce(
      (sum: number, ref: any) => sum + Number(ref.commission_amount || 0),
      0
    );

  const paidCommission = referrals
    .filter((ref: any) => ref.payment_status === "paid")
    .reduce(
      (sum: number, ref: any) => sum + Number(ref.commission_amount || 0),
      0
    );

  const activePaidReferrals = referrals.filter(
    (ref: any) => ref.payment_status === "paid"
  ).length;

  const balanceOwed = pendingCommission;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://scanmylegacy.com";

  const referralLink = `${siteUrl}/packages?ref=${affiliate.referral_code}`;

  const shareMessage = `Preserve your loved one's memory with ScanMyLegacy. Create a beautiful digital legacy page with photos, videos, stories, tributes, candles, flowers, family messages, and more. Start here: ${referralLink}`;

  return (
    <main className="min-h-screen bg-[#071120] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 rounded-3xl border border-[#d4af37]/20 bg-gradient-to-br from-[#111a2e] to-[#08101f] p-6 shadow-2xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
              ScanMyLegacy Partner Center
            </p>

            <h1 className="font-serif text-4xl font-bold text-[#f8f5ee]">
              Affiliate Dashboard
            </h1>

            <p className="mt-3 text-sm text-gray-400">
              Welcome back,{" "}
              <span className="font-semibold text-white">
                {affiliate.full_name}
              </span>
            </p>
          </div>

          <div className="rounded-full border border-green-400/30 bg-green-500/10 px-5 py-2 text-sm font-semibold text-green-300">
            Active Partner
          </div>
        </div>

        <div className="mb-8 rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#d4af37]">
                Your Referral Link
              </p>

              <div className="rounded-2xl border border-[#263757] bg-[#071120] p-4">
                <p className="break-all font-mono text-sm font-semibold text-[#d4af37]">
                  {referralLink}
                </p>
              </div>

              <AffiliateTools
                referralLink={referralLink}
                shareMessage={shareMessage}
              />
            </div>

            <div className="rounded-2xl border border-[#d4af37]/20 bg-[#071120] p-5 lg:w-80">
              <h2 className="mb-3 font-serif text-xl text-[#d4af37]">
                How To Earn
              </h2>

              <ol className="space-y-3 text-sm leading-relaxed text-gray-300">
                <li>1. Share your referral link.</li>
                <li>2. Customer signs up through your link.</li>
                <li>3. Customer activates a paid package.</li>
                <li>4. Your commission is added for payout.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 shadow-xl">
            <p className="text-sm text-gray-400">Total Referrals</p>
            <h2 className="mt-2 text-4xl font-bold text-[#d4af37]">
              {totalReferrals}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 shadow-xl">
            <p className="text-sm text-gray-400">Active Paid Referrals</p>
            <h2 className="mt-2 text-4xl font-bold text-green-400">
              {activePaidReferrals}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 shadow-xl">
            <p className="text-sm text-gray-400">Pending Commission</p>
            <h2 className="mt-2 text-4xl font-bold text-yellow-400">
              ${pendingCommission.toFixed(2)}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 shadow-xl">
            <p className="text-sm text-gray-400">Paid Commission</p>
            <h2 className="mt-2 text-4xl font-bold text-green-400">
              ${paidCommission.toFixed(2)}
            </h2>
          </div>
        </div>

        <div className="mb-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl">
            <h2 className="mb-5 font-serif text-2xl text-[#d4af37]">
              Commission Plan
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-[#263757] bg-[#071120] p-4">
                <div>
                  <p className="font-semibold text-white">Standard Package</p>
                  <p className="text-sm text-gray-400">3-year legacy page</p>
                </div>
                <p className="text-xl font-bold text-[#d4af37]">$10</p>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#263757] bg-[#071120] p-4">
                <div>
                  <p className="font-semibold text-white">Premium Package</p>
                  <p className="text-sm text-gray-400">5-year legacy page</p>
                </div>
                <p className="text-xl font-bold text-[#d4af37]">$15</p>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#263757] bg-[#071120] p-4">
                <div>
                  <p className="font-semibold text-white">Eternal Package</p>
                  <p className="text-sm text-gray-400">Lifetime legacy page</p>
                </div>
                <p className="text-xl font-bold text-[#d4af37]">$20</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4">
              <p className="text-sm text-yellow-100">
                Balance currently owed:
              </p>
              <p className="mt-1 text-3xl font-bold text-yellow-300">
                ${balanceOwed.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-xl">
            <h2 className="mb-3 font-serif text-2xl text-[#d4af37]">
              Quick Message To Share
            </h2>

            <p className="mb-5 text-sm leading-relaxed text-gray-400">
              Affiliates can copy this message and send it to families,
              funeral homes, churches, care homes, florists, or community
              groups.
            </p>

            <div className="rounded-2xl border border-[#263757] bg-[#071120] p-5 text-sm leading-7 text-gray-200">
              Preserve your loved one's memory with ScanMyLegacy. Create a
              beautiful digital legacy page with photos, videos, stories,
              tributes, candles, flowers, family messages, and more. Start
              here:{" "}
              <span className="break-all text-[#d4af37]">
                {referralLink}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-[#d4af37]/20 bg-[#071120] p-5">
              <h3 className="mb-3 font-semibold text-[#d4af37]">
                Best places to share
              </h3>

              <div className="grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
                <p>• Funeral homes</p>
                <p>• Churches</p>
                <p>• Florists</p>
                <p>• Care homes</p>
                <p>• Family groups</p>
                <p>• Community pages</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#1f2a44] bg-[#111a2e] p-6 shadow-xl">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl text-[#d4af37]">
                Referral History
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Track every referral, package, status, and commission.
              </p>
            </div>
          </div>

          {referrals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d4af37]/25 bg-[#071120] p-8 text-center">
              <p className="text-lg font-semibold text-white">
                No referrals yet.
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Share your link above to start earning commissions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[#263757] text-gray-400">
                    <th className="py-3 pr-4">Customer</th>
                    <th className="py-3 pr-4">Package</th>
                    <th className="py-3 pr-4">Commission</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {referrals.map((ref: any) => (
                    <tr
                      key={ref.id}
                      className="border-b border-[#263757]/70 text-gray-200"
                    >
                      <td className="py-4 pr-4 font-semibold">
                        {ref.customer_name || "Customer"}
                      </td>

                      <td className="py-4 pr-4 text-gray-300">
                        {ref.package_name || "Package"}
                      </td>

                      <td className="py-4 pr-4 font-bold text-[#d4af37]">
                        ${Number(ref.commission_amount || 0).toFixed(2)}
                      </td>

                      <td className="py-4 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                            ref.payment_status === "paid"
                              ? "bg-green-500/15 text-green-300"
                              : "bg-yellow-500/15 text-yellow-300"
                          }`}
                        >
                          {ref.payment_status || "pending"}
                        </span>
                      </td>

                      <td className="py-4 pr-4 text-gray-400">
                        {ref.created_at
                          ? new Date(ref.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}