"use client";

import { useEffect, useState } from "react";

type RequestStatus = "pending" | "approved" | "rejected";

export default function AdminTrustedContactRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [status, setStatus] = useState<RequestStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<number, string>>({});

  const requestTypeLabels: Record<string, string> = {
    convert_to_memorial: "Convert Living Legacy To Memorial",
    release_after_passing: "Release After Passing Messages",
    ownership_transfer: "Request Ownership Transfer",
    general_release_request: "General Family Release Request",
  };

  const loadRequests = async (selectedStatus: RequestStatus = status) => {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/admin/trusted-contact-requests?status=${selectedStatus}`
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Unable to load trusted contact requests.");
        setRequests([]);
        return;
      }

      setRequests(data.requests || []);
    } catch {
      alert("Unable to load trusted contact requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(status);
  }, [status]);

  const reviewRequest = async (requestId: number, action: "approve" | "reject") => {
    const label = action === "approve" ? "approve" : "reject";
    const confirmed = confirm(`Are you sure you want to ${label} this request?`);

    if (!confirmed) return;

    try {
      setReviewingId(requestId);

      const res = await fetch("/api/admin/trusted-contact-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: requestId,
          action,
          admin_note: adminNotes[requestId] || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Unable to update request.");
        return;
      }

      alert(data.message || "Request updated.");
      await loadRequests(status);
    } catch {
      alert("Unable to update request.");
    } finally {
      setReviewingId(null);
    }
  };

  const formatDateTime = (dateValue: string) => {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBadgeClass =
    status === "pending"
      ? "border-yellow-400/30 bg-yellow-500/10 text-yellow-100"
      : status === "approved"
      ? "border-green-400/30 bg-green-500/10 text-green-100"
      : "border-red-400/30 bg-red-500/10 text-red-100";

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            Admin Review
          </p>

          <h1 className="font-serif text-4xl font-bold">
            Trusted Contact Requests
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400">
            Review trusted contact requests before converting a Living Legacy,
            releasing after-passing messages, or beginning an ownership transfer.
            Nothing should be released without admin review.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <a
            href="/admin/dashboard"
            className="rounded-lg border border-[#d4af37]/40 px-5 py-3 text-sm font-semibold text-[#d4af37]"
          >
            Back To Admin Dashboard
          </a>

          <button
            type="button"
            onClick={() => setStatus("pending")}
            className={`rounded-lg px-5 py-3 text-sm font-semibold ${
              status === "pending"
                ? "bg-[#d4af37] text-black"
                : "border border-[#d4af37]/40 text-[#d4af37]"
            }`}
          >
            Pending
          </button>

          <button
            type="button"
            onClick={() => setStatus("approved")}
            className={`rounded-lg px-5 py-3 text-sm font-semibold ${
              status === "approved"
                ? "bg-[#d4af37] text-black"
                : "border border-[#d4af37]/40 text-[#d4af37]"
            }`}
          >
            Approved
          </button>

          <button
            type="button"
            onClick={() => setStatus("rejected")}
            className={`rounded-lg px-5 py-3 text-sm font-semibold ${
              status === "rejected"
                ? "bg-[#d4af37] text-black"
                : "border border-[#d4af37]/40 text-[#d4af37]"
            }`}
          >
            Rejected
          </button>

          <button
            type="button"
            onClick={() => loadRequests(status)}
            className="rounded-lg border border-gray-500/50 px-5 py-3 text-sm font-semibold text-gray-200"
          >
            Refresh
          </button>
        </div>

        <div className={`mb-6 w-fit rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${statusBadgeClass}`}>
          Showing {status} requests
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center text-gray-400">
            Loading trusted contact requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d4af37]/25 bg-[#111a2e] p-8 text-center text-gray-400">
            No {status} trusted contact requests found.
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => {
              const requestLabel =
                requestTypeLabels[request.request_type] || request.request_type;

              return (
                <article
                  key={request.id}
                  className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6 shadow-2xl"
                >
                  <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">
                        {requestLabel}
                      </p>

                      <h2 className="font-serif text-2xl text-white">
                        {request.full_name || "Unknown Legacy Page"}
                      </h2>

                      <p className="mt-2 text-sm text-gray-400">
                        Page ID: {request.memorial_id} · Page Type:{" "}
                        {request.page_type || "Unknown"} · Submitted:{" "}
                        {formatDateTime(request.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {request.invite_token && (
                        <a
                          href={`/memorial/${request.invite_token}`}
                          target="_blank"
                          className="rounded-lg border border-[#d4af37]/40 px-4 py-2 text-xs font-semibold text-[#d4af37]"
                        >
                          View Page
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
                      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                        Trusted Contact
                      </p>
                      <p className="font-semibold text-white">
                        {request.trusted_contact_name || "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
                      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                        Email
                      </p>
                      <p className="break-words text-sm text-gray-300">
                        {request.trusted_contact_email || "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
                      <p className="mb-1 text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                        Phone
                      </p>
                      <p className="break-words text-sm text-gray-300">
                        {request.trusted_contact_phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {request.request_note && (
                    <div className="mt-4 rounded-xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
                      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                        Request Note
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                        {request.request_note}
                      </p>
                    </div>
                  )}

                  {request.admin_note && (
                    <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-500/10 p-4">
                      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-blue-200">
                        Admin Note
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-blue-100">
                        {request.admin_note}
                      </p>

                      {request.reviewed_at && (
                        <p className="mt-2 text-xs text-blue-200/70">
                          Reviewed: {formatDateTime(request.reviewed_at)}
                        </p>
                      )}
                    </div>
                  )}

                  {status === "pending" && (
                    <div className="mt-5 rounded-2xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#d4af37]">
                        Admin Note Optional
                      </label>

                      <textarea
                        rows={3}
                        value={adminNotes[request.id] || ""}
                        onChange={(e) =>
                          setAdminNotes({
                            ...adminNotes,
                            [request.id]: e.target.value,
                          })
                        }
                        placeholder="Add a note about why this request was approved or rejected..."
                        className="mb-4 w-full rounded-xl border border-[#2a3550] bg-[#111a2e] p-3 text-white outline-none transition focus:border-[#d4af37]"
                      />

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => reviewRequest(request.id, "approve")}
                          disabled={reviewingId === request.id}
                          className="flex-1 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {reviewingId === request.id
                            ? "Reviewing..."
                            : "Approve Request"}
                        </button>

                        <button
                          type="button"
                          onClick={() => reviewRequest(request.id, "reject")}
                          disabled={reviewingId === request.id}
                          className="flex-1 rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {reviewingId === request.id
                            ? "Reviewing..."
                            : "Reject Request"}
                        </button>
                      </div>

                      <p className="mt-4 text-xs leading-relaxed text-gray-500">
                        Approving a conversion request will convert the Living
                        Legacy to a Memorial Page. Ownership transfers still
                        require manual account review.
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}