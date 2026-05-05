"use client";

import { useEffect, useState } from "react";

export default function AdminPaymentsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);

  const loadPayments = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/payments");
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to load payments.");
        return;
      }

      setRecords(data.records || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const updatePayment = async (memorialId: number, action: string) => {
    let message = "Are you sure you want to update this payment?";

    if (action === "verify_payment") {
      message =
        "Verify this payment? This will mark the memorial as paid and permanently active.";
    }

    if (action === "reject_payment") {
      message =
        "Reject this payment? This will mark the bank transfer as rejected.";
    }

    if (action === "mark_expired") {
      message =
        "Mark this payment as expired? The memorial will be deactivated until payment is verified.";
    }

    if (action === "reactivate_pending") {
      message =
        "Reopen this payment review for 48 hours? The memorial will become temporarily active again.";
    }

    const confirmed = confirm(message);
    if (!confirmed) return;

    try {
      setWorkingId(memorialId);

      const res = await fetch("/api/admin/payments", {
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
        alert(data.error || "Payment update failed.");
        return;
      }

      alert(data.message || "Payment updated.");
      await loadPayments();
    } finally {
      setWorkingId(null);
    }
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

  const getStatusBadge = (status: string) => {
    if (status === "paid") {
      return "bg-green-500/20 text-green-300 border-green-400/30";
    }

    if (status === "pending_bank_transfer") {
      return "bg-yellow-500/20 text-yellow-200 border-yellow-400/30";
    }

    if (status === "expired_bank_transfer") {
      return "bg-red-500/20 text-red-300 border-red-400/30";
    }

    if (status === "rejected_bank_transfer") {
      return "bg-red-900/40 text-red-200 border-red-400/30";
    }

    return "bg-gray-500/20 text-gray-300 border-gray-400/30";
  };

  const getTimeStatus = (item: any) => {
    if (!item.payment_due_at) {
      return "No deadline";
    }

    const now = new Date();
    const due = new Date(item.payment_due_at);

    if (item.payment_status === "paid") {
      return "Verified";
    }

    if (now.getTime() > due.getTime()) {
      return "Expired";
    }

    const hoursLeft = Math.max(
      0,
      Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60))
    );

    return `${hoursLeft} hour${hoursLeft === 1 ? "" : "s"} left`;
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
              Bank Transfer Payments
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Review customer transfer references, verify payments, reject
              payments, or expire unpaid memorials.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin"
              className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold text-[#d4af37]"
            >
              Back to Admin
            </a>

            <button
              type="button"
              onClick={loadPayments}
              className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center text-gray-300">
            Loading bank transfers...
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center text-gray-300">
            No bank transfer records found.
          </div>
        ) : (
          <div className="space-y-5">
            {records.map((item) => {
              const memorialUrl = `/memorial/${item.invite_token}`;
              const isWorking = workingId === item.id;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5 shadow-xl"
                >
                  <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr_1fr]">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                            item.payment_status
                          )}`}
                        >
                          {item.payment_status || "unknown"}
                        </span>

                        <span className="rounded-full border border-[#d4af37]/30 bg-[#0b1320] px-3 py-1 text-xs text-[#d4af37]">
                          {getTimeStatus(item)}
                        </span>
                      </div>

                      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Memorial
                      </p>

                      <h2 className="font-serif text-2xl text-white">
                        {item.full_name}
                      </h2>

                      <p className="mt-2 text-sm text-gray-400">
                        Created by {item.creator_name || item.owner_name || "Unknown"}
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        {item.creator_email || item.owner_email || "No email"}
                      </p>

                      {item.creator_phone && (
                        <p className="mt-1 text-sm text-gray-400">
                          Phone: {item.creator_phone}
                        </p>
                      )}

                      <a
                        href={memorialUrl}
                        target="_blank"
                        className="mt-4 inline-block rounded-lg border border-[#d4af37]/40 px-4 py-2 text-xs font-semibold text-[#d4af37]"
                      >
                        View Memorial
                      </a>
                    </div>

                    <div className="rounded-xl border border-[#1f2a44] bg-[#0b1320] p-4">
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Payment Details
                      </p>

                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-500">Package:</span>{" "}
                          <span className="text-white">
                            {item.package_name || item.package_slug || "N/A"}
                          </span>
                        </p>

                        <p>
                          <span className="text-gray-500">Price:</span>{" "}
                          <span className="text-white">
                            {item.package_price
                              ? `$${item.package_price} USD`
                              : "N/A"}
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
                            {item.payment_reference || "No reference"}
                          </span>
                        </p>

                        <p>
                          <span className="text-gray-500">Submitted:</span>{" "}
                          <span className="text-white">
                            {formatDateTime(item.created_at)}
                          </span>
                        </p>

                        <p>
                          <span className="text-gray-500">Due:</span>{" "}
                          <span className="text-white">
                            {formatDateTime(item.payment_due_at)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#1f2a44] bg-[#0b1320] p-4">
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Actions
                      </p>

                      <div className="grid gap-3">
                        <button
                          type="button"
                          disabled={isWorking || item.payment_status === "paid"}
                          onClick={() =>
                            updatePayment(item.id, "verify_payment")
                          }
                          className="rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                        >
                          Verify Payment
                        </button>

                        <button
                          type="button"
                          disabled={isWorking || item.payment_status === "paid"}
                          onClick={() =>
                            updatePayment(item.id, "reject_payment")
                          }
                          className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject Payment
                        </button>

                        <button
                          type="button"
                          disabled={isWorking || item.payment_status === "paid"}
                          onClick={() =>
                            updatePayment(item.id, "mark_expired")
                          }
                          className="rounded-lg border border-yellow-400/40 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-100 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Expired
                        </button>

                        <button
                          type="button"
                          disabled={isWorking || item.payment_status === "paid"}
                          onClick={() =>
                            updatePayment(item.id, "reactivate_pending")
                          }
                          className="rounded-lg border border-[#d4af37]/40 px-4 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reopen 48 Hours
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