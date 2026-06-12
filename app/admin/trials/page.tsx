"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type TrialRecord = {
  user_id: number;
  owner_name: string;
  email: string;
  plan: string | null;
  trial_ends_at: string | null;
  is_active: number;
  created_at?: string | null;
  memorial_id: number | null;
  memorial_name: string | null;
  package_slug: string | null;
  package_name: string | null;
  package_price: number | null;
  payment_status: string | null;
};

export default function AdminTrialsPage() {
  const [records, setRecords] = useState<TrialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingKey, setWorkingKey] = useState<string | null>(null);

  const loadTrials = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/trials", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to load trials.");
        return;
      }

      setRecords(data.records || []);
    } catch (error) {
      alert("Could not load trial accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrials();
  }, []);

  const getTrialExpired = (item: TrialRecord) => {
    return (
      item.plan === "free" &&
      item.trial_ends_at &&
      new Date(item.trial_ends_at) < new Date()
    );
  };

  const getStatusLabel = (item: TrialRecord) => {
    const expired = getTrialExpired(item);

    if (Number(item.is_active) === 1 && !expired) {
      return "Active";
    }

    if (expired) {
      return "Expired";
    }

    return "Inactive";
  };

  const getStatusClass = (item: TrialRecord) => {
    const label = getStatusLabel(item);

    if (label === "Active") {
      return "bg-green-500/15 text-green-300 ring-green-500/30";
    }

    if (label === "Expired") {
      return "bg-red-500/15 text-red-300 ring-red-500/30";
    }

    return "bg-gray-500/15 text-gray-300 ring-gray-500/30";
  };

  const formatDate = (dateValue: string | null) => {
    if (!dateValue) return "No trial";

    return new Date(dateValue).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPlan = (plan: string | null) => {
    if (!plan) return "Free";

    return plan
      .replaceAll("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const summary = useMemo(() => {
    const total = records.length;

    const active = records.filter(
      (item) => Number(item.is_active) === 1 && !getTrialExpired(item)
    ).length;

    const expired = records.filter((item) => getTrialExpired(item)).length;

    const paid = records.filter(
      (item) =>
        item.payment_status === "paid" ||
        item.plan === "standard-legacy" ||
        item.plan === "premium-legacy" ||
        item.plan === "eternal-legacy"
    ).length;

    return { total, active, expired, paid };
  }, [records]);

  const updateAccount = async (
    item: TrialRecord,
    action: string,
    label: string
  ) => {
    let message = `Are you sure you want to ${label.toLowerCase()} for ${
      item.owner_name || item.email
    }?`;

    if (action === "delete_trial") {
      message =
        "Remove this free trial access?\n\nThis will NOT delete the user or memorial. It will clear the trial date and set the account inactive.";
    }

    if (action === "deactivate") {
      message =
        "Deactivate this account?\n\nThe user and memorial data will remain saved, but access will be turned off.";
    }

    const confirmed = confirm(message);
    if (!confirmed) return;

    const key = `${item.user_id}-${item.memorial_id || "none"}-${action}`;

    try {
      setWorkingKey(key);

      const res = await fetch("/api/admin/trials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: item.user_id,
          memorial_id: item.memorial_id,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Update failed.");
        return;
      }

      alert(data.message || "Account updated.");
      await loadTrials();
    } catch (error) {
      alert("Update failed.");
    } finally {
      setWorkingKey(null);
    }
  };

  const ActionButton = ({
    item,
    action,
    label,
    variant = "dark",
  }: {
    item: TrialRecord;
    action: string;
    label: string;
    variant?: "dark" | "gold" | "green" | "red" | "outline";
  }) => {
    const key = `${item.user_id}-${item.memorial_id || "none"}-${action}`;
    const isWorking = workingKey === key;

    const className =
      variant === "gold"
        ? "bg-[#d4af37] text-[#0b1320] hover:bg-[#f0c94a]"
        : variant === "green"
        ? "bg-green-600 text-white hover:bg-green-500"
        : variant === "red"
        ? "bg-red-900/70 text-red-100 hover:bg-red-800"
        : variant === "outline"
        ? "border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0b1320]"
        : "bg-white/10 text-white hover:bg-white/15";

    return (
      <button
        onClick={() => updateAccount(item, action, label)}
        disabled={Boolean(workingKey)}
        className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {isWorking ? "Working..." : label}
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-[#0b1320] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm uppercase tracking-[0.28em] text-[#d4af37]">
              ScanMyLegacy Admin
            </p>

            <h1 className="font-serif text-4xl font-bold">
              Trial & Package Manager
            </h1>

            <p className="mt-3 max-w-3xl text-white/70">
              Manage free trials, expired trials, package activation, manual
              payment access, and account status from one control panel.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="inline-flex rounded-full border border-[#d4af37]/50 px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320]"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Accounts", value: summary.total },
            { label: "Active Accounts", value: summary.active },
            { label: "Expired Trials", value: summary.expired },
            { label: "Paid Accounts", value: summary.paid },
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
          <div className="rounded-2xl border border-[#d4af37]/20 bg-white/10 p-8 text-center text-white/70">
            Loading trial accounts...
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-[#d4af37]/20 bg-white/10 p-8 text-center">
            <h2 className="font-serif text-2xl text-[#d4af37]">
              No accounts found
            </h2>
            <p className="mt-2 text-sm text-white/70">
              The Trial Manager page is working, but the API did not return any
              trial or package records.
            </p>
            <p className="mt-4 text-xs text-white/50">
              Next file to check: app/api/admin/trials/route.ts
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[#d4af37]/20 bg-white/10 shadow-2xl">
            <div className="border-b border-[#d4af37]/20 p-5">
              <h2 className="font-serif text-2xl text-[#d4af37]">
                Account List
              </h2>
              <p className="mt-1 text-sm text-white/70">
                Use trial actions for free trials, package actions for paid
                activation, and account actions for access control.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left text-sm">
                <thead className="bg-[#0b1320] text-xs uppercase tracking-[0.15em] text-[#d4af37]">
                  <tr>
                    <th className="p-4">Owner</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Memorial</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Trial Ends</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((item) => (
                    <tr
                      key={`${item.user_id}-${item.memorial_id || "none"}`}
                      className="border-t border-[#d4af37]/10 align-top transition hover:bg-white/[0.04]"
                    >
                      <td className="p-4">
                        <div className="font-semibold text-white">
                          {item.owner_name || "No name"}
                        </div>
                        <div className="mt-1 text-xs text-white/45">
                          User ID: {item.user_id}
                        </div>
                      </td>

                      <td className="p-4 text-white/70">{item.email}</td>

                      <td className="p-4">
                        <div className="font-semibold text-white">
                          {item.memorial_name || "No memorial"}
                        </div>

                        {item.memorial_id && (
                          <div className="mt-1 text-xs text-white/45">
                            Memorial ID: {item.memorial_id}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="rounded-full bg-[#d4af37]/15 px-3 py-1 text-xs font-semibold text-[#d4af37]">
                          {formatPlan(item.plan || item.package_slug)}
                        </span>
                      </td>

                      <td className="p-4 text-white/70">
                        {formatDate(item.trial_ends_at)}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClass(
                            item
                          )}`}
                        >
                          {getStatusLabel(item)}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="rounded-full bg-black/25 px-3 py-1 text-xs text-white/70">
                          {item.payment_status || "n/a"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="grid gap-4">
                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                              Trial
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <ActionButton
                                item={item}
                                action="extend_7"
                                label="Extend 7 Days"
                              />

                              <ActionButton
                                item={item}
                                action="extend_14"
                                label="Extend 14 Days"
                              />

                              <ActionButton
                                item={item}
                                action="delete_trial"
                                label="Delete Trial"
                                variant="red"
                              />
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                              Package
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <ActionButton
                                item={item}
                                action="standard"
                                label="Standard"
                                variant="gold"
                              />

                              <ActionButton
                                item={item}
                                action="premium"
                                label="Premium"
                                variant="gold"
                              />

                              <ActionButton
                                item={item}
                                action="eternal"
                                label="Eternal"
                                variant="gold"
                              />
                            </div>
                          </div>

                          <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                              Account
                            </p>

                            <div className="flex flex-wrap gap-2">
                              <ActionButton
                                item={item}
                                action="activate"
                                label="Activate"
                                variant="green"
                              />

                              <ActionButton
                                item={item}
                                action="deactivate"
                                label="Deactivate"
                                variant="outline"
                              />
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-[#d4af37]/20 bg-white/10 p-5 text-sm leading-relaxed text-white/70">
          <p>
            <span className="font-semibold text-[#d4af37]">Note:</span> Delete
            Trial only removes trial access. It does not delete the user,
            memorial, gallery, chat, family tree, or payment records.
          </p>
        </div>
      </div>
    </main>
  );
}