"use client";

import { useEffect, useState } from "react";

function money(value: any) {
  const amount = Number(value || 0);
  return `$${amount.toFixed(2)}`;
}

function statusBadge(status: string) {
  const cleanStatus = status || "unknown";

  if (cleanStatus === "active") {
    return "bg-green-500/15 text-green-300 border-green-400/20";
  }

  return "bg-red-500/15 text-red-300 border-red-400/20";
}

export default function AdminAffiliatesPage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<any>(null);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);

  const loadAffiliates = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/affiliates");
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Unable to load affiliate tracker.");
        return;
      }

      setTotals(data.totals || {});
      setAffiliates(data.affiliates || []);
      setReferrals(data.referrals || []);
    } catch {
      alert("Something went wrong loading affiliate tracker.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAffiliates();
  }, []);

  const copyReferralLink = async (code: string) => {
    const link = `https://scanmylegacy.com/packages?ref=${code}`;

    try {
      await navigator.clipboard.writeText(link);
      alert("Referral link copied.");
    } catch {
      alert(link);
    }
  };

  const affiliateAction = async (
    affiliateId: number,
    action: "activate" | "deactivate" | "delete"
  ) => {
    const labels: any = {
      activate: "activate this affiliate",
      deactivate: "deactivate this affiliate",
      delete: "delete this affiliate permanently",
    };

    const confirmed = confirm(`Are you sure you want to ${labels[action]}?`);

    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          affiliate_id: affiliateId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Affiliate action failed.");
        return;
      }

      alert(data.message || "Affiliate updated.");
      loadAffiliates();
    } catch {
      alert("Something went wrong.");
    }
  };

  return (
    <main className="min-h-screen bg-[#061b3a] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.28em] text-[#d4af37]">
              Admin Control
            </p>

            <h1 className="font-serif text-4xl font-bold">
              Affiliate Tracker
            </h1>

            <p className="mt-3 max-w-2xl text-gray-300">
              View every affiliate as a card, track their referral link, visits,
              sales, and commission totals.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadAffiliates}
              className="rounded-full border border-[#d4af37]/50 px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#061b3a]"
            >
              Refresh
            </button>

            <a
              href="/admin"
              className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-[#061b3a] transition hover:bg-[#f0c94a]"
            >
              Back to Admin
            </a>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#d4af37]/20 bg-[#082652] p-10 text-center text-gray-300">
            Loading affiliate tracker...
          </div>
        ) : (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#d4af37]/15 bg-[#082652] p-5">
                <p className="text-sm text-gray-300">Total Affiliates</p>
                <p className="mt-3 text-3xl font-bold text-[#d4af37]">
                  {totals?.total_affiliates || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-[#d4af37]/15 bg-[#082652] p-5">
                <p className="text-sm text-gray-300">Referral Visits</p>
                <p className="mt-3 text-3xl font-bold text-[#d4af37]">
                  {totals?.referral_visits || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-[#d4af37]/15 bg-[#082652] p-5">
                <p className="text-sm text-gray-300">Paid Referral Sales</p>
                <p className="mt-3 text-3xl font-bold text-[#d4af37]">
                  {totals?.paid_referrals || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-[#d4af37]/15 bg-[#082652] p-5">
                <p className="text-sm text-gray-300">Paid Commission</p>
                <p className="mt-3 text-3xl font-bold text-[#d4af37]">
                  {money(totals?.paid_commission)}
                </p>
              </div>
            </section>

            <section className="mb-10">
              <div className="mb-5">
                <h2 className="font-serif text-3xl text-[#d4af37]">
                  Affiliate List
                </h2>

                <p className="mt-2 text-sm text-gray-300">
                  Each affiliate appears below with their referral link and
                  performance summary.
                </p>
              </div>

              {affiliates.length === 0 ? (
                <div className="rounded-3xl border border-[#d4af37]/20 bg-[#082652] p-10 text-center text-gray-300">
                  No affiliates found.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {affiliates.map((affiliate) => {
                    const referralLink = `https://scanmylegacy.com/packages?ref=${affiliate.referral_code}`;

                    return (
                      <div
                        key={affiliate.id}
                        className="rounded-3xl border border-[#d4af37]/20 bg-[#082652] p-6 shadow-2xl"
                      >
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-[#d4af37]">
                              Affiliate
                            </p>

                            <h3 className="mt-2 font-serif text-2xl font-bold text-white">
                              {affiliate.full_name || "Unnamed Affiliate"}
                            </h3>

                            <p className="mt-1 text-sm text-gray-300">
                              {affiliate.email}
                            </p>
                          </div>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(
                              affiliate.status
                            )}`}
                          >
                            {affiliate.status || "unknown"}
                          </span>
                        </div>

                        <div className="mb-5 rounded-2xl border border-[#d4af37]/15 bg-[#061b3a] p-4">
                          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                            Referral Code
                          </p>

                          <p className="break-all font-mono text-sm text-white">
                            {affiliate.referral_code}
                          </p>

                          <p className="mt-3 break-all text-xs text-gray-400">
                            {referralLink}
                          </p>

                          <button
                            onClick={() =>
                              copyReferralLink(affiliate.referral_code)
                            }
                            className="mt-4 w-full rounded-full border border-[#d4af37]/50 px-4 py-2 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#061b3a]"
                          >
                            Copy Referral Link
                          </button>

                          <div className="mt-3 grid grid-cols-2 gap-3">
                            {affiliate.status === "active" ? (
                              <button
                                onClick={() =>
                                  affiliateAction(affiliate.id, "deactivate")
                                }
                                className="rounded-full border border-yellow-400/40 px-4 py-2 text-sm font-semibold text-yellow-300 transition hover:bg-yellow-400 hover:text-[#061b3a]"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  affiliateAction(affiliate.id, "activate")
                                }
                                className="rounded-full border border-green-400/40 px-4 py-2 text-sm font-semibold text-green-300 transition hover:bg-green-400 hover:text-[#061b3a]"
                              >
                                Activate
                              </button>
                            )}

                            <button
                              onClick={() =>
                                affiliateAction(affiliate.id, "delete")
                              }
                              className="rounded-full border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500 hover:text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-white/10 bg-[#061b3a]/70 p-4">
                            <p className="text-xs text-gray-400">Rate</p>
                            <p className="mt-1 text-xl font-bold text-[#d4af37]">
                              {Number(affiliate.commission_rate || 0)}%
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-[#061b3a]/70 p-4">
                            <p className="text-xs text-gray-400">Visits</p>
                            <p className="mt-1 text-xl font-bold text-white">
                              {affiliate.referral_visits || 0}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-[#061b3a]/70 p-4">
                            <p className="text-xs text-gray-400">Total Sales</p>
                            <p className="mt-1 text-xl font-bold text-white">
                              {affiliate.total_referrals || 0}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-[#061b3a]/70 p-4">
                            <p className="text-xs text-gray-400">Paid Sales</p>
                            <p className="mt-1 text-xl font-bold text-green-300">
                              {affiliate.paid_referrals || 0}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-[#061b3a]/70 p-4">
                            <p className="text-xs text-gray-400">Pending</p>
                            <p className="mt-1 text-xl font-bold text-yellow-300">
                              {affiliate.pending_referrals || 0}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-white/10 bg-[#061b3a]/70 p-4">
                            <p className="text-xs text-gray-400">Commission</p>
                            <p className="mt-1 text-xl font-bold text-[#d4af37]">
                              {money(affiliate.paid_commission)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-[#d4af37]/10 bg-[#061b3a]/60 p-4 text-xs text-gray-400">
                          Joined:{" "}
                          {affiliate.created_at
                            ? new Date(affiliate.created_at).toLocaleString()
                            : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-[#082652] shadow-2xl">
              <div className="border-b border-[#d4af37]/15 p-5">
                <h2 className="font-serif text-2xl text-[#d4af37]">
                  Recent Referral Sales
                </h2>
                <p className="mt-2 text-sm text-gray-300">
                  Latest referral records connected to memorial purchases.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-left text-sm">
                  <thead className="bg-[#061b3a] text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                    <tr>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Affiliate</th>
                      <th className="px-4 py-4">Customer</th>
                      <th className="px-4 py-4">Package</th>
                      <th className="px-4 py-4">Price</th>
                      <th className="px-4 py-4">Commission</th>
                      <th className="px-4 py-4">Payment</th>
                    </tr>
                  </thead>

                  <tbody>
                    {referrals.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-gray-300"
                        >
                          No referral sales found yet.
                        </td>
                      </tr>
                    ) : (
                      referrals.map((referral) => (
                        <tr
                          key={referral.id}
                          className="border-t border-[#d4af37]/10 text-gray-200"
                        >
                          <td className="px-4 py-4">
                            {referral.created_at
                              ? new Date(referral.created_at).toLocaleString()
                              : "—"}
                          </td>

                          <td className="px-4 py-4">
                            <div className="font-semibold text-white">
                              {referral.affiliate_name || "Unknown"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {referral.referral_code || ""}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {referral.customer_name || "—"}
                          </td>

                          <td className="px-4 py-4">
                            {referral.package_name || "—"}
                          </td>

                          <td className="px-4 py-4">
                            {money(referral.package_price)}
                          </td>

                          <td className="px-4 py-4 font-semibold text-[#d4af37]">
                            {money(referral.commission_amount)}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                referral.payment_status === "paid"
                                  ? "bg-green-500/15 text-green-300"
                                  : "bg-yellow-500/15 text-yellow-300"
                              }`}
                            >
                              {referral.payment_status || "pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}