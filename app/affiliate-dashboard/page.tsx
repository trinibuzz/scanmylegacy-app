import { db } from "../../lib/db";
import { cookies } from "next/headers";

export default async function AffiliateDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie =
    cookieStore.get("affiliate_session");

  if (!sessionCookie) {
    return (
      <main className="min-h-screen bg-[#0b1320] p-8 text-white">
        <h1 className="font-serif text-4xl text-[#d4af37]">
          Affiliate Dashboard
        </h1>

        <p className="mt-4 text-red-400">
          You must log in first.
        </p>
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
    .filter(
      (ref: any) =>
        ref.payment_status === "pending"
    )
    .reduce(
      (sum: number, ref: any) =>
        sum + Number(ref.commission_amount),
      0
    );

  const paidCommission = referrals
    .filter(
      (ref: any) =>
        ref.payment_status === "paid"
    )
    .reduce(
      (sum: number, ref: any) =>
        sum + Number(ref.commission_amount),
      0
    );

  const referralLink = `${
    process.env.NEXT_PUBLIC_SITE_URL || ""
  }/packages?ref=${affiliate.referral_code}`;

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 font-serif text-4xl text-[#d4af37]">
          Affiliate Dashboard
        </h1>

        <p className="mb-8 text-gray-400">
          Welcome back, {affiliate.full_name}
        </p>

        <div className="mb-10 rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
          <p className="mb-2 text-sm text-gray-400">
            Your Referral Link
          </p>

          <div className="break-all font-mono text-[#d4af37]">
            {referralLink}
          </div>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <p className="text-sm text-gray-400">
              Total Referrals
            </p>

            <h2 className="mt-2 text-3xl font-bold text-[#d4af37]">
              {totalReferrals}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <p className="text-sm text-gray-400">
              Pending Commission
            </p>

            <h2 className="mt-2 text-3xl font-bold text-yellow-400">
              ${pendingCommission.toFixed(2)}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
            <p className="text-sm text-gray-400">
              Paid Commission
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-400">
              ${paidCommission.toFixed(2)}
            </h2>
          </div>
        </div>

        <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
          <h2 className="mb-6 font-serif text-2xl text-[#d4af37]">
            Referral History
          </h2>

          {referrals.length === 0 ? (
            <p className="text-gray-400">
              No referrals yet.
            </p>
          ) : (
            <div className="space-y-4">
              {referrals.map((ref: any) => (
                <div
                  key={ref.id}
                  className="rounded-xl border border-[#2a3550] bg-[#0b1320] p-4"
                >
                  <p className="font-semibold">
                    {ref.customer_name}
                  </p>

                  <p className="text-sm text-gray-400">
                    {ref.package_name}
                  </p>

                  <p className="mt-2 text-[#d4af37]">
                    Commission: $
                    {Number(
                      ref.commission_amount
                    ).toFixed(2)}
                  </p>

                  <p className="text-sm text-gray-400">
                    Status: {ref.payment_status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}