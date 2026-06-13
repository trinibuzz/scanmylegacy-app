"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ReportRecord = {
  report_id: number;
  status?: string | null;
  content_type?: string | null;
  memorial_name?: string | null;
  reporter_name?: string | null;
  reported_at?: string | null;
  reason?: string | null;
  invite_token?: string | null;
  chat_is_deleted?: number | string | boolean | null;
  chat_guest_name?: string | null;
  chat_created_at?: string | null;
  chat_body?: string | null;
  chat_image_url?: string | null;
  chat_video_url?: string | null;
  chat_audio_url?: string | null;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [workingId, setWorkingId] = useState<number | null>(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await fetch("/api/admin/reports", {
        cache: "no-store",
      });

      const text = await res.text();

      let data: any = {};

      try {
        data = JSON.parse(text);
      } catch {
        setErrorMessage("The reports API did not return valid JSON.");
        setReports([]);
        return;
      }

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to load reports.");
        setReports([]);
        return;
      }

      const incomingReports = data.reports || data.records || data.items || [];

      if (Array.isArray(incomingReports)) {
        setReports(incomingReports);
      } else {
        setErrorMessage("The reports API response was not a list.");
        setReports([]);
      }
    } catch {
      setErrorMessage("Could not connect to the reports API.");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const summary = useMemo(() => {
    const total = reports.length;

    const pending = reports.filter(
      (report) => String(report.status || "").toLowerCase() === "pending"
    ).length;

    const reviewed = reports.filter(
      (report) => String(report.status || "").toLowerCase() === "reviewed"
    ).length;

    const resolved = reports.filter(
      (report) => String(report.status || "").toLowerCase() === "resolved"
    ).length;

    const dismissed = reports.filter(
      (report) => String(report.status || "").toLowerCase() === "dismissed"
    ).length;

    return { total, pending, reviewed, resolved, dismissed };
  }, [reports]);

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

      const text = await res.text();

      let data: any = {};

      try {
        data = JSON.parse(text);
      } catch {
        alert("The reports API did not return valid JSON.");
        return;
      }

      if (!res.ok) {
        alert(data.error || "Report update failed.");
        return;
      }

      alert(data.message || "Report updated.");
      await loadReports();
    } catch {
      alert("Report update failed.");
    } finally {
      setWorkingId(null);
    }
  };

  const safeMediaPath = (pathValue: unknown) => {
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

  const formatText = (value?: string | null) => {
    if (!value) return "N/A";

    return value
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusBadge = (statusValue?: string | null) => {
    const status = String(statusValue || "").toLowerCase();

    if (status === "pending") {
      return "bg-yellow-500/15 text-yellow-200 ring-yellow-500/30";
    }

    if (status === "resolved") {
      return "bg-green-500/15 text-green-300 ring-green-500/30";
    }

    if (status === "reviewed") {
      return "bg-blue-500/15 text-blue-300 ring-blue-500/30";
    }

    if (status === "dismissed") {
      return "bg-gray-500/15 text-gray-300 ring-gray-500/30";
    }

    return "bg-gray-500/15 text-gray-300 ring-gray-500/30";
  };

  const isChatDeleted = (report: ReportRecord) => {
    return (
      report.chat_is_deleted === true ||
      report.chat_is_deleted === "1" ||
      Number(report.chat_is_deleted) === 1
    );
  };

  const renderReportedContent = (report: ReportRecord) => {
    if (report.content_type !== "chat") {
      return (
        <p className="text-sm text-white/50">
          Unsupported content type: {report.content_type || "Unknown"}
        </p>
      );
    }

    if (isChatDeleted(report)) {
      return (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          This chat message has already been deleted.
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
        <p className="text-sm font-semibold text-white">
          {report.chat_guest_name || "Unknown Guest"}
        </p>

        <p className="mt-1 text-xs text-white/45">
          Posted: {formatDateTime(report.chat_created_at)}
        </p>

        {report.chat_body && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/70">
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
          <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-white/5 p-3">
            <p className="mb-2 text-xs font-semibold text-[#d4af37]">
              🎙️ Reported Voice Note / Audio
            </p>

            <audio controls className="w-full">
              <source src={safeMediaPath(report.chat_audio_url)} />
            </audio>
          </div>
        )}

        {!report.chat_body &&
          !report.chat_image_url &&
          !report.chat_video_url &&
          !report.chat_audio_url && (
            <p className="mt-3 text-sm text-white/50">
              No chat content was returned for this report.
            </p>
          )}
      </div>
    );
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
              Reports & Moderation
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
              Review reported chat messages, remove inappropriate content, mark
              reports reviewed, or dismiss reports that do not need action.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadReports}
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
            { label: "Total Reports", value: summary.total },
            { label: "Pending", value: summary.pending },
            { label: "Reviewed", value: summary.reviewed },
            { label: "Resolved", value: summary.resolved },
            { label: "Dismissed", value: summary.dismissed },
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
            Loading reports...
          </div>
        ) : errorMessage ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <h2 className="font-serif text-2xl text-red-300">
              Could Not Load Reports
            </h2>

            <p className="mt-3 text-sm text-white/70">{errorMessage}</p>

            <p className="mt-4 text-xs text-white/50">
              Next file to check: app/api/admin/reports/route.ts
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-3xl border border-[#d4af37]/20 bg-white/10 p-8 text-center">
            <h2 className="font-serif text-2xl text-[#d4af37]">
              No Reports Found
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/70">
              There are no reported chat messages or moderation items right now.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {reports.map((report) => {
              const memorialUrl = report.invite_token
                ? `/memorial/${report.invite_token}`
                : "#";

              const isWorking = workingId === report.report_id;
              const deleted = isChatDeleted(report);

              return (
                <div
                  key={report.report_id}
                  className="rounded-3xl border border-[#d4af37]/20 bg-white/10 p-5 shadow-2xl"
                >
                  <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr_0.75fr]">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusBadge(
                            report.status
                          )}`}
                        >
                          {formatText(report.status || "Unknown")}
                        </span>

                        <span className="inline-flex rounded-full bg-[#d4af37]/15 px-3 py-1 text-xs font-semibold text-[#d4af37] ring-1 ring-[#d4af37]/30">
                          {formatText(report.content_type || "Content")}
                        </span>
                      </div>

                      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Memorial
                      </p>

                      <h2 className="font-serif text-2xl text-white">
                        {report.memorial_name || "Unknown Memorial"}
                      </h2>

                      <p className="mt-2 text-sm text-white/60">
                        Reported by:{" "}
                        <span className="text-white">
                          {report.reporter_name || "Anonymous"}
                        </span>
                      </p>

                      <p className="mt-1 text-sm text-white/60">
                        Reported: {formatDateTime(report.reported_at)}
                      </p>

                      <div className="mt-4 rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4">
                        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                          Reason
                        </p>

                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/70">
                          {report.reason || "No reason provided."}
                        </p>
                      </div>

                      {report.invite_token && (
                        <Link
                          href={memorialUrl}
                          target="_blank"
                          className="mt-4 inline-flex rounded-lg border border-[#d4af37]/40 px-4 py-2 text-xs font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320]"
                        >
                          View Memorial
                        </Link>
                      )}
                    </div>

                    <div>
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Reported Content
                      </p>

                      {renderReportedContent(report)}
                    </div>

                    <div className="rounded-xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
                      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#d4af37]">
                        Actions
                      </p>

                      <div className="grid gap-3">
                        <button
                          type="button"
                          disabled={
                            isWorking ||
                            report.status === "resolved" ||
                            deleted
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
                          className="rounded-lg border border-[#d4af37]/40 px-4 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Dismiss Report
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
            <span className="font-semibold text-[#d4af37]">Note:</span> Reports
            are created when visitors flag public memorial chat content.
          </p>
        </div>
      </div>
    </main>
  );
}