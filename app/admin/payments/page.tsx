"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PaymentRecord = {
  id: number;
  full_name?: string | null;
  creator_name?: string | null;
  creator_email?: string | null;
  creator_phone?: string | null;
  owner_name?: string | null;
  owner_email?: string | null;
  invite_token?: string | null;
  package_name?: string | null;
  package_slug?: string | null;
  package_price?: number | string | null;
  payment_status?: string | null;
  payment_method?: string | null;
  payment_reference?: string | null;
  payment_due_at?: string | null;
  created_at?: string | null;
};

export default function AdminPaymentsPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [workingId, setWorkingId] = useState<number | null>(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await fetch("/api/admin/payments", {
        cache: "no-store",
      });

      const text = await res.text();

      let data: any = {};

      try {
        data = JSON.parse(text);
      } catch {
        setErrorMessage("The payments API did not return valid JSON.");
        setRecords([]);
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to load payments.");
        setRecords([]);
        return;
      }

      const incomingRecords = data.records || data.payments || data.items || [];

      if (Array.isArray(incomingRecords)) {
        setRecords(incomingRecords);
      } else {
        setErrorMessage("The payments API response was not a list.");
        setRecords([]);
      }
    } catch {
      setErrorMessage("Could not connect to the payments API.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const summary = useMemo(() => {
    const total = records.length;

    const verified = records.filter((item) => {
      const status = String(item.payment_status || "").toLowerCase();
      return status === "paid" || status === "verified";
    }).length;

    const pending = records.filter((item) => {
      const status = String(item.payment_status || "").toLowerCase();
      return status.includes("pending");
    }).length;

    const expired = records.filter((item) => {
      const status = String(item.payment_status || "").toLowerCase();
      return status.includes("expired");
    }).length;

    const rejected = records.filter((item) => {
      const status = String(item.payment_status || "").toLowerCase();
      return status.includes("rejected");
    }).length;

    return { total, verified, pending, expired, rejected };
  }, [records]);

  const updatePayment = async (
    memorialId: number,
    action: string,
    pageName?: string | null
  ) => {
    let message = "Are you sure you want to update this payment?";

    if (action === "verify_payment") {
      message =
        "Verify this payment? This will mark the legacy page as paid and permanently active.";
    }

    if (action === "reject_payment") {
      message =
        "Reject this payment? This will mark the bank transfer as rejected.";
    }

    if (action === "mark_expired") {
      message =
        "Mark this payment as expired? The legacy page will be deactivated until payment is verified.";
    }

    if (action === "reactivate_pending") {
      message =
        "Reopen this payment review for 48 hours? The legacy page will become temporarily active again.";
    }

    if (action === "delete_legacy_page") {
      const confirmed = confirm(
        `Permanently delete this legacy page?\n\nPage: ${
          pageName || "Untitled Page"
        }\n\nThis will remove the page and related records. The owner account will NOT be deleted.\n\nThis cannot be undone.`
      );

      if (!confirmed) return;

      const typed = prompt(
        `To confirm deletion, type DELETE below.\n\nPage: ${
          pageName || "Untitled Page"
        }`
      );

      if (typed !== "DELETE") {
        alert("Delete cancelled. You did not type DELETE.");
        return;
      }
    } else {
      const confirmed = confirm(message);
      if (!confirmed) return;
    }

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

      const text = await res.text();

      let data: any = {};

      try {
        data = JSON.parse(text);
      } catch {
        alert("The payments API did not return valid JSON.");
        return;
      }

      if (!res.ok) {
        alert(data.error || "Payment update failed.");
        return;
      }

      alert(data.message || "Payment updated.");
      await loadPayments();
    } catch {
      alert("Payment update failed.");
    } finally {
      setWorkingId(null);
    }
  };

  const formatDateTime = (dateValue?: string | null) => {
    if (!dateValue) return "Not set";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not set";
    }

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (value?: string | null) => {
    if (!value) return "Unknown";

    return value
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatPrice = (value?: number | string | null) => {
    if (!value) return "N/A";

    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return String(value);
    }

    return `$${amount.toFixed(2)} USD`;
  };

  const getStatusBadge = (statusValue?: string | null) => {
    const status = String(statusValue || "").toLowerCase();

    if (status === "paid" || status === "verified") {
      return "bg-green-500/15 text-green-300 ring-green-500/30";
    }

    if (status.includes("pending")) {
      return "bg-yellow-500/15 text-yellow-200 ring-yellow-500/30";
    }

    if (status.includes("expired")) {
      return "bg-red-500/15 text-red-300 ring-red-500/30";
    }

    if (status.includes("rejected")) {
      return "bg-red-900/50 text-red-200 ring-red-400/30";
    }

    return "bg-gray-500/15 text-gray-300 ring-gray-500/30";
  };

  const getTimeStatus = (item: PaymentRecord) => {
    if (!item.payment_due_at) {
      return "No deadline";
    }

    const now = new Date();
    const due = new Date(item.payment_due_at);

    if (Number.isNaN(due.getTime())) {
      return "No deadline";
    }

    const paymentStatus = String(item.payment_status || "").toLowerCase();

    if (paymentStatus === "paid" || paymentStatus === "verified") {
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

  const getTimeBadgeClass = (item: PaymentRecord) => {
    const timeStatus = getTimeStatus(item).toLowerCase();

    if (timeStatus === "verified") {
      return "bg-green-500/15 text-green-300 ring-green-500/30";
    }

    if (timeStatus === "expired") {
      return "bg-red-500/15 text-red-300 ring-red-500/30";
    }

    return "bg-[#d4af37]/15 text-[#d4af37] ring-[#d4af37]/30";
  };

  return (
    <main className="min-h-screen bg-[#0b1320] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              ScanMyLegacy Admin
            </p>

            <h1 className="font-serif text-4xl font-bold">
              Payment Manager
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
              Review customer bank transfer references, verify payments, reject
              payments, expire unpaid records, reopen a 48-hour review window,
              or delete test legacy pages.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadPayments}
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

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total Payments", value: summary.total },
            { label: "Verified", value: summary.verified },
            { label: "Pending", value: summary.pending },
            { label: "Expired", value: summary.expired },
            { label: "Rejected", value: summary.rejected },
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
            Loading payments...
          </div>
        ) : errorMessage ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <h2 className="font-serif text-2xl text-red-300">
              Could Not Load Payments
            </h2>

            <p className="mt-3 text-sm text-white/70">{errorMessage}</p>

            <p className="mt-4 text-xs text-white/50">
              Next file to check: app/api/admin/payments/route.ts
            </p>
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-3xl border border-[#d4af37]/20 bg-white/10 p-8 text-center">
            <h2 className="font-serif text-2xl text-[#d4af37]">
              No Payment Records Found
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/70">
              There are no bank transfer or manual payment records waiting for
              review right now.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {records.map((item) => {
              const memorialUrl = item.invite_token
                ? `/memorial/${item.invite_token}`
                : "#";

              const isWorking = workingId === item.id;
              const isVerified =
                String(item.payment_status || "").toLowerCase() === "paid" ||
                String(item.payment_status || "").toLowerCase() === "verified";

              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-[#d4af37]/20 bg-white/10 p-5 shadow-2xl"
                >
                  <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr_1fr]">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusBadge(
                            item.payment_status
                          )}`}
                        >
                          {formatStatus(item.payment_status)}
                        </span>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getTimeBadgeClass(
                            item
                          )}`}
                        >
                          {getTimeStatus(item)}
                        </span>
                      </div>

                      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Memorial / Legacy Page
                      </p>

                      <h2 className="font-serif text-2xl text-white">
                        {item.full_name || "Untitled Page"}
                      </h2>

                      <p className="mt-2 text-sm text-white/60">
                        Created by{" "}
                        <span className="text-white">
                          {item.creator_name || item.owner_name || "Unknown"}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-white/60">
                        {item.creator_email || item.owner_email || "No email"}
                      </p>

                      {item.creator_phone && (
                        <p className="mt-1 text-sm text-white/60">
                          Phone: {item.creator_phone}
                        </p>
                      )}

                      {item.invite_token && (
                        <Link
                          href={memorialUrl}
                          target="_blank"
                          className="mt-4 inline-flex rounded-lg border border-[#d4af37]/40 px-4 py-2 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320]"
                        >
                          View Public Page
                        </Link>
                      )}
                    </div>

                    <div className="rounded-xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Payment Details
                      </p>

                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-white/45">Package:</span>{" "}
                          <span className="text-white">
                            {item.package_name || item.package_slug || "N/A"}
                          </span>
                        </p>

                        <p>
                          <span className="text-white/45">Price:</span>{" "}
                          <span className="text-white">
                            {formatPrice(item.package_price)}
                          </span>
                        </p>

                        <p>
                          <span className="text-white/45">Method:</span>{" "}
                          <span className="text-white">
                            {formatStatus(item.payment_method || "N/A")}
                          </span>
                        </p>

                        <p>
                          <span className="text-white/45">Reference:</span>{" "}
                          <span className="break-all text-[#d4af37]">
                            {item.payment_reference || "No reference"}
                          </span>
                        </p>

                        <p>
                          <span className="text-white/45">Submitted:</span>{" "}
                          <span className="text-white">
                            {formatDateTime(item.created_at)}
                          </span>
                        </p>

                        <p>
                          <span className="text-white/45">Due:</span>{" "}
                          <span className="text-white">
                            {formatDateTime(item.payment_due_at)}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Actions
                      </p>

                      <div className="grid gap-3">
                        <button
                          type="button"
                          disabled={isWorking || isVerified}
                          onClick={() =>
                            updatePayment(
                              item.id,
                              "verify_payment",
                              item.full_name
                            )
                          }
                          className="rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                        >
                          Verify Payment
                        </button>

                        <button
                          type="button"
                          disabled={isWorking || isVerified}
                          onClick={() =>
                            updatePayment(
                              item.id,
                              "reject_payment",
                              item.full_name
                            )
                          }
                          className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reject Payment
                        </button>

                        <button
                          type="button"
                          disabled={isWorking || isVerified}
                          onClick={() =>
                            updatePayment(
                              item.id,
                              "mark_expired",
                              item.full_name
                            )
                          }
                          className="rounded-lg border border-yellow-400/40 bg-yellow-500/10 px-4 py-3 text-sm font-semibold text-yellow-100 transition hover:bg-yellow-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Expired
                        </button>

                        <button
                          type="button"
                          disabled={isWorking || isVerified}
                          onClick={() =>
                            updatePayment(
                              item.id,
                              "reactivate_pending",
                              item.full_name
                            )
                          }
                          className="rounded-lg border border-[#d4af37]/40 px-4 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Reopen 48 Hours
                        </button>

                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() =>
                            updatePayment(
                              item.id,
                              "delete_legacy_page",
                              item.full_name
                            )
                          }
                          className="rounded-lg border border-red-500/50 bg-red-700/20 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-700/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete Legacy Page
                        </button>
                      </div>

                      {isWorking && (
                        <p className="mt-3 text-center text-xs text-white/50">
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

        <div className="mt-6 rounded-2xl border border-[#d4af37]/20 bg-white/10 p-5 text-sm leading-relaxed text-white/70">
          <p>
            <span className="font-semibold text-[#d4af37]">Note:</span> This
            page handles bank transfer and manual payment review. Gift payment
            verification is handled separately in the gift order flow. Delete
            Legacy Page removes the selected page and related page records only;
            it does not delete the user account.
          </p>
        </div>
      </div>
    </main>
  );
}