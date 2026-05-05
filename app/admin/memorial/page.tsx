"use client";

import { useEffect, useState } from "react";

export default function AdminMemorialPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [workingId, setWorkingId] = useState<number | null>(null);

  const loadMemorials = async (searchValue = search) => {
    try {
      setLoading(true);

      const url = searchValue
        ? `/api/admin/memorials?search=${encodeURIComponent(searchValue)}`
        : "/api/admin/memorials";

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to load memorials.");
        return;
      }

      setRecords(data.records || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemorials("");
  }, []);

  const updateMemorial = async (memorialId: number, action: string) => {
    const confirmed = confirm("Are you sure you want to update this memorial?");
    if (!confirmed) return;

    try {
      setWorkingId(memorialId);

      const res = await fetch("/api/admin/memorials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memorial_id: memorialId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Update failed.");
        return;
      }

      alert(data.message || "Memorial updated.");
      await loadMemorials();
    } finally {
      setWorkingId(null);
    }
  };

  const safeMediaPath = (pathValue: any) => {
    if (!pathValue) return "";

    let cleanPath = String(pathValue).trim();
    cleanPath = cleanPath.replace(/\\/g, "/");

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    cleanPath = cleanPath.replace(/^public\//, "");
    cleanPath = cleanPath.replace(/^\/public\//, "/");

    if (!cleanPath.startsWith("/")) {
      cleanPath = `/${cleanPath}`;
    }

    return encodeURI(cleanPath);
  };

  const formatDateTime = (dateValue: string) => {
    if (!dateValue) return "Not set";

    return new Date(dateValue).toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusClass = (status: string) => {
    if (status === "paid") return "border-green-400/30 bg-green-500/20 text-green-300";
    if (status === "free") return "border-blue-400/30 bg-blue-500/20 text-blue-300";
    if (status === "pending_bank_transfer") return "border-yellow-400/30 bg-yellow-500/20 text-yellow-200";
    if (status === "deactivated" || status === "expired_bank_transfer" || status === "rejected_bank_transfer") {
      return "border-red-400/30 bg-red-500/20 text-red-300";
    }

    return "border-gray-400/30 bg-gray-500/20 text-gray-300";
  };

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              Admin Control
            </p>

            <h1 className="font-serif text-4xl font-bold">
              Memorial Manager
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              View all memorials, check owners, payment status, packages, and activate or deactivate access.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin"
              className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold text-[#d4af37]"
            >
              Back to Admin
            </a>

            <a
              href="/admin/payments"
              className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold text-[#d4af37]"
            >
              Bank Transfers
            </a>

            <button
              type="button"
              onClick={() => loadMemorials()}
              className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search memorial name, owner, or email..."
              className="min-h-[48px] flex-1 rounded-xl border border-[#2a3550] bg-[#0b1320] px-4 text-white outline-none focus:border-[#d4af37]"
            />

            <button
              type="button"
              onClick={() => loadMemorials(search)}
              className="rounded-xl bg-[#d4af37] px-6 py-3 font-semibold text-black"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                loadMemorials("");
              }}
              className="rounded-xl border border-[#d4af37]/40 px-6 py-3 font-semibold text-[#d4af37]"
            >
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center text-gray-300">
            Loading memorials...
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center text-gray-300">
            No memorials found.
          </div>
        ) : (
          <div className="space-y-5">
            {records.map((item) => {
              const memorialUrl = `/memorial/${item.invite_token}`;
              const dashboardUrl = `/dashboard/memorial/${item.id}`;
              const familyTreeUrl = `/family-tree/${item.id}`;
              const isWorking = workingId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5 shadow-xl"
                >
                  <div className="grid gap-5 lg:grid-cols-[170px_1.3fr_0.9fr_1fr]">
                    <div className="overflow-hidden rounded-xl border border-[#1f2a44] bg-[#0b1320]">
                      {item.cover_photo ? (
                        <img
                          src={safeMediaPath(item.cover_photo)}
                          alt={item.full_name}
                          className="h-44 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-44 w-full items-center justify-center text-5xl">
                          🕯️
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                            item.payment_status
                          )}`}
                        >
                          {item.payment_status || "unknown"}
                        </span>

                        {Number(item.enable_family_tree) === 1 && (
                          <span className="rounded-full border border-[#d4af37]/30 bg-[#0b1320] px-3 py-1 text-xs text-[#d4af37]">
                            Family Tree
                          </span>
                        )}
                      </div>

                      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Memorial
                      </p>

                      <h2 className="font-serif text-2xl text-white">
                        {item.full_name}
                      </h2>

                      <p className="mt-3 text-sm text-gray-400">
                        Created by{" "}
                        <span className="text-white">
                          {item.creator_name || item.owner_name || "Unknown"}
                        </span>
                      </p>

                      <p className="text-sm text-gray-400">
                        {item.creator_email || item.owner_email || "No email"}
                      </p>

                      {item.creator_phone && (
                        <p className="text-sm text-gray-400">
                          Phone: {item.creator_phone}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-gray-500">
                        Created: {formatDateTime(item.created_at)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#1f2a44] bg-[#0b1320] p-4">
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Package
                      </p>

                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-500">Plan:</span>{" "}
                          <span className="text-white">
                            {item.package_name || item.package_slug || "N/A"}
                          </span>
                        </p>

                        <p>
                          <span className="text-gray-500">Price:</span>{" "}
                          <span className="text-white">
                            {item.package_price ? `$${item.package_price} USD` : "Free / N/A"}
                          </span>
                        </p>

                        <p>
                          <span className="text-gray-500">Method:</span>{" "}
                          <span className="text-white">
                            {item.payment_method || "N/A"}
                          </span>
                        </p>

                        <p>
                          <span className="text-gray-500">Reference:</span>{" "}
                          <span className="break-all text-[#d4af37]">
                            {item.payment_reference || "N/A"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#1f2a44] bg-[#0b1320] p-4">
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Actions
                      </p>

                      <div className="grid gap-3">
                        <a
                          href={memorialUrl}
                          target="_blank"
                          className="rounded-lg border border-[#d4af37]/40 px-4 py-3 text-center text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
                        >
                          View Memorial
                        </a>

                        <a
                          href={dashboardUrl}
                          target="_blank"
                          className="rounded-lg border border-blue-400/40 px-4 py-3 text-center text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20"
                        >
                          Owner Manager
                        </a>

                        {Number(item.enable_family_tree) === 1 && (
                          <a
                            href={familyTreeUrl}
                            target="_blank"
                            className="rounded-lg border border-purple-400/40 px-4 py-3 text-center text-sm font-semibold text-purple-200 transition hover:bg-purple-500/20"
                          >
                            Family Tree
                          </a>
                        )}

                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => updateMemorial(item.id, "activate_paid")}
                          className="rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                        >
                          Activate Paid
                        </button>

                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => updateMemorial(item.id, "mark_free")}
                          className="rounded-lg border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Free
                        </button>

                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() =>
                            updateMemorial(
                              item.id,
                              "reactivate_pending_bank_transfer"
                            )
                          }
                          className="rounded-lg border border-[#d4af37]/40 px-4 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reopen Bank Review
                        </button>

                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => updateMemorial(item.id, "deactivate")}
                          className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Deactivate
                        </button>
                      </div>

                      {isWorking && (
                        <p className="mt-3 text-center text-xs text-gray-400">
                          Updating...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}