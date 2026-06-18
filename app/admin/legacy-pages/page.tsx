"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type LegacyRecord = {
  id?: number | string | null;
  memorial_id?: number | string | null;
  user_id?: number | string | null;
  owner_name?: string | null;
  name?: string | null;
  full_name?: string | null;
  memorial_name?: string | null;
  title?: string | null;
  email?: string | null;
  page_type?: string | null;
  legacy_type?: string | null;
  type?: string | null;
  status?: string | null;
  payment_status?: string | null;
  package_name?: string | null;
  package_slug?: string | null;
  plan?: string | null;
  is_active?: number | boolean | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  invite_token?: string | null;
  public_token?: string | null;
  token?: string | null;
  public_url?: string | null;
};

export default function AdminLegacyPagesPage() {
  const [records, setRecords] = useState<LegacyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const safeText = (value: unknown, fallback = "N/A") => {
    if (value === null || value === undefined || value === "") return fallback;

    return String(value)
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const safeDate = (value: unknown) => {
    if (!value) return "N/A";

    const date = new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRecordId = (item: LegacyRecord) => {
    return item.memorial_id || item.id || null;
  };

  const getTitle = (item: LegacyRecord) => {
    return (
      item.memorial_name ||
      item.full_name ||
      item.name ||
      item.title ||
      "Untitled Legacy Page"
    );
  };

  const getOwner = (item: LegacyRecord) => {
    return item.owner_name || item.email || "No owner listed";
  };

  const getPublicToken = (item: LegacyRecord) => {
    return (
      item.invite_token ||
      item.public_token ||
      item.token ||
      null
    );
  };

  const getPageType = (item: LegacyRecord) => {
    const pageType = String(
      item.page_type || item.legacy_type || item.type || ""
    ).toLowerCase();

    if (
      pageType.includes("living") ||
      pageType.includes("living legacy") ||
      pageType.includes("living_legacy") ||
      pageType.includes("living-legacy")
    ) {
      return "Living Legacy";
    }

    if (
      pageType.includes("memorial") ||
      pageType.includes("deceased") ||
      pageType.includes("tribute")
    ) {
      return "Memorial";
    }

    return "Memorial";
  };

  const getPageTypeClass = (item: LegacyRecord) => {
    const type = getPageType(item);

    if (type === "Living Legacy") {
      return "bg-blue-500/15 text-blue-200 ring-blue-500/30";
    }

    return "bg-[#d4af37]/15 text-[#d4af37] ring-[#d4af37]/30";
  };

  const isActive = (item: LegacyRecord) => {
    const status = String(item.status || "").toLowerCase();

    return (
      status === "active" ||
      item.is_active === true ||
      item.is_active === "1" ||
      Number(item.is_active) === 1
    );
  };

  const getStatusClass = (item: LegacyRecord) => {
    const status = String(item.status || "").toLowerCase();

    if (status.includes("active") || isActive(item)) {
      return "bg-green-500/15 text-green-300 ring-green-500/30";
    }

    if (status.includes("pending")) {
      return "bg-yellow-500/15 text-yellow-200 ring-yellow-500/30";
    }

    if (status.includes("expired") || status.includes("inactive")) {
      return "bg-red-500/15 text-red-300 ring-red-500/30";
    }

    return "bg-gray-500/15 text-gray-300 ring-gray-500/30";
  };

  const getPaymentClass = (item: LegacyRecord) => {
    const payment = String(item.payment_status || "").toLowerCase();

    if (payment.includes("paid") || payment.includes("verified")) {
      return "bg-green-500/15 text-green-300 ring-green-500/30";
    }

    if (payment.includes("pending")) {
      return "bg-yellow-500/15 text-yellow-200 ring-yellow-500/30";
    }

    if (payment.includes("expired") || payment.includes("failed")) {
      return "bg-red-500/15 text-red-300 ring-red-500/30";
    }

    return "bg-black/25 text-white/70 ring-white/10";
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await fetch("/api/admin/memorials", {
        cache: "no-store",
      });

      const text = await res.text();

      let data: any = {};

      try {
        data = JSON.parse(text);
      } catch {
        setErrorMessage("The API did not return valid JSON.");
        setRecords([]);
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to load legacy page records.");
        setRecords([]);
        return;
      }

      const incomingRecords =
        data.records || data.memorials || data.items || data.pages || data || [];

      if (Array.isArray(incomingRecords)) {
        setRecords(incomingRecords);
      } else {
        setErrorMessage("The API response was not a list of records.");
        setRecords([]);
      }
    } catch {
      setErrorMessage("Could not connect to the admin records API.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const summary = useMemo(() => {
    const total = records.length;

    const livingLegacy = records.filter(
      (item) => getPageType(item) === "Living Legacy"
    ).length;

    const memorials = records.filter(
      (item) => getPageType(item) === "Memorial"
    ).length;

    const active = records.filter((item) => isActive(item)).length;

    const pending = records.filter((item) => {
      const payment = String(item.payment_status || "").toLowerCase();
      const status = String(item.status || "").toLowerCase();

      return payment.includes("pending") || status.includes("pending");
    }).length;

    const paid = records.filter((item) => {
      const payment = String(item.payment_status || "").toLowerCase();

      return payment.includes("paid") || payment.includes("verified");
    }).length;

    return { total, livingLegacy, memorials, active, pending, paid };
  }, [records]);

  return (
    <main className="min-h-screen bg-[#0b1320] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              ScanMyLegacy Admin
            </p>

            <h1 className="font-serif text-4xl font-bold">Legacy Pages</h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
              View and manage all Living Legacy and Memorial pages in one place
              with page type, payment status, account status, and public page
              links.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={loadRecords}
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Refresh
            </button>

            <Link
              href="/admin/dashboard"
              className="rounded-full border border-[#d4af37]/50 px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {[
            { label: "Total Pages", value: summary.total },
            { label: "Living Legacy", value: summary.livingLegacy },
            { label: "Memorials", value: summary.memorials },
            { label: "Active", value: summary.active },
            { label: "Pending", value: summary.pending },
            { label: "Paid", value: summary.paid },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-[#d4af37]/20 bg-white/10 p-5 shadow-xl"
            >
              <p className="text-sm text-white/70">{card.label}</p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#d4af37]">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="rounded-3xl border border-[#d4af37]/20 bg-white/10 p-8 text-center text-white/70">
            Loading legacy page records...
          </div>
        ) : errorMessage ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <h2 className="font-serif text-2xl text-red-300">
              Could Not Load Records
            </h2>

            <p className="mt-3 text-sm text-white/70">{errorMessage}</p>

            <p className="mt-4 text-xs text-white/50">
              Next file to check: app/api/admin/memorials/route.ts
            </p>
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-3xl border border-[#d4af37]/20 bg-white/10 p-8 text-center">
            <h2 className="font-serif text-2xl text-[#d4af37]">
              No Legacy Pages Found
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/70">
              The page is working, but no records came back from the admin
              memorial API.
            </p>

            <p className="mt-4 text-xs text-white/50">
              Next file to check: app/api/admin/memorials/route.ts
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-white/10 shadow-2xl">
            <div className="border-b border-[#d4af37]/20 p-5">
              <h2 className="font-serif text-2xl text-[#d4af37]">
                All Legacy Pages
              </h2>

              <p className="mt-1 text-sm text-white/70">
                This list includes both Living Legacy pages and Memorial pages.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-[#0b1320] text-xs uppercase tracking-[0.15em] text-[#d4af37]">
                  <tr>
                    <th className="p-4">Page</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((item, index) => {
                    const recordId = getRecordId(item);
                    const token = getPublicToken(item);
                    const pageType = getPageType(item);

                    return (
                      <tr
                        key={`${recordId || "record"}-${index}`}
                        className="border-t border-[#d4af37]/10 align-top transition hover:bg-white/[0.04]"
                      >
                        <td className="p-4">
                          <div className="font-semibold text-white">
                            {getTitle(item)}
                          </div>

                          <div className="mt-1 text-xs text-white/45">
                            ID: {recordId || "N/A"}
                          </div>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPageTypeClass(
                              item
                            )}`}
                          >
                            {pageType}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="text-white/80">{getOwner(item)}</div>

                          {item.email && (
                            <div className="mt-1 text-xs text-white/45">
                              {item.email}
                            </div>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/75">
                            {safeText(
                              item.package_name ||
                                item.package_slug ||
                                item.plan ||
                                "Free"
                            )}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getPaymentClass(
                              item
                            )}`}
                          >
                            {safeText(item.payment_status || "N/A")}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClass(
                              item
                            )}`}
                          >
                            {safeText(
                              item.status ||
                                (isActive(item) ? "Active" : "Inactive")
                            )}
                          </span>
                        </td>

                        <td className="p-4 text-white/70">
                          {safeDate(item.created_at)}
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {token ? (
                              <Link
                                href={`/memorial/${token}`}
                                target="_blank"
                                className="rounded-lg bg-[#d4af37] px-3 py-2 text-xs font-semibold text-[#0b1320] transition hover:bg-[#f0c94a]"
                              >
                                Public View
                              </Link>
                            ) : (
                              <span className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/40">
                                No Public Token
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-[#d4af37]/20 bg-white/10 p-5 text-sm leading-relaxed text-white/70">
          <p>
            <span className="font-semibold text-[#d4af37]">Note:</span> This
            page reads from your existing admin memorial API and displays all
            legacy records together with badges. Public View opens the actual
            memorial link only; owner dashboards are not linked here.
          </p>
        </div>
      </div>
    </main>
  );
}