"use client";

import { useEffect, useState } from "react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/reports");
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to load reports.");
        return;
      }

      setReports(data.reports || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const updateReport = async (reportId: number, action: string) => {
    let message = "Are you sure you want to update this report?";

    if (action === "delete_reported_chat") {
      message =
        "Delete the reported chat message? This will remove it from the public memorial chat.";
    }

    if (action === "dismiss_report") {
      message = "Dismiss this report without deleting the message?";
    }

    if (action === "mark_reviewed") {
      message = "Mark this report as reviewed?";
    }

    const confirmed = confirm(message);
    if (!confirmed) return;

    try {
      setWorkingId(reportId);

      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report_id: reportId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Report update failed.");
        return;
      }

      alert(data.message || "Report updated.");
      await loadReports();
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

  const getStatusBadge = (status: string) => {
    if (status === "pending") {
      return "bg-yellow-500/20 text-yellow-200 border-yellow-400/30";
    }

    if (status === "resolved") {
      return "bg-green-500/20 text-green-300 border-green-400/30";
    }

    if (status === "reviewed") {
      return "bg-blue-500/20 text-blue-300 border-blue-400/30";
    }

    if (status === "dismissed") {
      return "bg-gray-500/20 text-gray-300 border-gray-400/30";
    }

    return "bg-gray-500/20 text-gray-300 border-gray-400/30";
  };

  const renderReportedContent = (report: any) => {
    if (report.content_type !== "chat") {
      return (
        <p className="text-sm text-gray-400">
          Unsupported content type: {report.content_type}
        </p>
      );
    }

    if (Number(report.chat_is_deleted) === 1) {
      return (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          This chat message has already been deleted.
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-[#1f2a44] bg-[#0b1320] p-4">
        <p className="text-sm font-semibold text-white">
          {report.chat_guest_name || "Unknown Guest"}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Posted: {formatDateTime(report.chat_created_at)}
        </p>

        {report.chat_body && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {report.chat_body}
          </p>
        )}

        {report.chat_image_url && (
          <img
            src={safeMediaPath(report.chat_image_url)}
            alt="Reported chat image"
            className="mt-4 max-h-[320px] w-full rounded-xl object-cover"
          />
        )}

        {report.chat_video_url && (
          <video controls className="mt-4 w-full rounded-xl">
            <source src={safeMediaPath(report.chat_video_url)} />
          </video>
        )}

        {report.chat_audio_url && (
          <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#111a2e] p-3">
            <p className="mb-2 text-xs font-semibold text-[#d4af37]">
              🎙️ Reported Voice Note / Audio
            </p>

            <audio controls className="w-full">
              <source src={safeMediaPath(report.chat_audio_url)} />
            </audio>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
              Admin Moderation
            </p>

            <h1 className="font-serif text-4xl font-bold">
              Reports & Moderation
            </h1>

            <p className="mt-3 max-w-3xl text-gray-400">
              Review reported chat messages, remove inappropriate content, or
              dismiss reports that do not need action.
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
              onClick={loadReports}
              className="rounded-lg bg-[#d4af37] px-5 py-3 text-sm font-semibold text-black"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center text-gray-300">
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center text-gray-300">
            No reports found.
          </div>
        ) : (
          <div className="space-y-5">
            {reports.map((report) => {
              const memorialUrl = report.invite_token
                ? `/memorial/${report.invite_token}`
                : "#";

              const isWorking = workingId === report.report_id;

              return (
                <div
                  key={report.report_id}
                  className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5 shadow-xl"
                >
                  <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_0.75fr]">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>

                        <span className="rounded-full border border-[#d4af37]/30 bg-[#0b1320] px-3 py-1 text-xs text-[#d4af37]">
                          {report.content_type}
                        </span>
                      </div>

                      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Memorial
                      </p>

                      <h2 className="font-serif text-2xl text-white">
                        {report.memorial_name || "Unknown Memorial"}
                      </h2>

                      <p className="mt-2 text-sm text-gray-400">
                        Reported by:{" "}
                        <span className="text-white">
                          {report.reporter_name || "Anonymous"}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Reported: {formatDateTime(report.reported_at)}
                      </p>

                      <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                          Reason
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                          {report.reason || "No reason provided."}
                        </p>
                      </div>

                      {report.invite_token && (
                        <a
                          href={memorialUrl}
                          target="_blank"
                          className="mt-4 inline-block rounded-lg border border-[#d4af37]/40 px-4 py-2 text-xs font-semibold text-[#d4af37]"
                        >
                          View Memorial
                        </a>
                      )}
                    </div>

                    <div>
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Reported Content
                      </p>

                      {renderReportedContent(report)}
                    </div>

                    <div className="rounded-xl border border-[#1f2a44] bg-[#0b1320] p-4">
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Actions
                      </p>

                      <div className="grid gap-3">
                        <button
                          type="button"
                          disabled={
                            isWorking ||
                            report.status === "resolved" ||
                            Number(report.chat_is_deleted) === 1
                          }
                          onClick={() =>
                            updateReport(
                              report.report_id,
                              "delete_reported_chat"
                            )
                          }
                          className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                        >
                          Delete Chat Message
                        </button>

                        <button
                          type="button"
                          disabled={isWorking || report.status === "reviewed"}
                          onClick={() =>
                            updateReport(report.report_id, "mark_reviewed")
                          }
                          className="rounded-lg border border-blue-400/40 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Reviewed
                        </button>

                        <button
                          type="button"
                          disabled={isWorking || report.status === "dismissed"}
                          onClick={() =>
                            updateReport(report.report_id, "dismiss_report")
                          }
                          className="rounded-lg border border-[#d4af37]/40 px-4 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Dismiss Report
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