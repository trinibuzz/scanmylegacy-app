"use client";

import { useEffect, useState } from "react";

export default function AdminTrialsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/trials");
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to load trials.");
        return;
      }

      setRecords(data.records || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrials();
  }, []);

  const updateAccount = async (
    userId: number,
    memorialId: number,
    action: string
  ) => {
    const confirmed = confirm("Are you sure you want to update this account?");
    if (!confirmed) return;

    const res = await fetch("/api/admin/trials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, memorial_id: memorialId, action }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Update failed.");
      return;
    }

    alert("Account updated.");
    await loadTrials();
  };

  return (
    <main className="min-h-screen bg-[#0b1320] px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            Admin Control
          </p>

          <h1 className="font-serif text-4xl font-bold">
            Trial & Package Manager
          </h1>

          <p className="mt-3 max-w-3xl text-gray-400">
            Manage 14-day free trials, manually activate accounts after cash
            payments, extend trials, or deactivate access.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center text-gray-300">
            Loading trial accounts...
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center text-gray-300">
            No accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#1f2a44] bg-[#111a2e]">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#081827] text-[#d4af37]">
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
                {records.map((item) => {
                  const expired =
                    item.plan === "free" &&
                    item.trial_ends_at &&
                    new Date(item.trial_ends_at) < new Date();

                  return (
                    <tr
                      key={`${item.user_id}-${item.memorial_id}`}
                      className="border-t border-[#1f2a44]"
                    >
                      <td className="p-4">{item.owner_name}</td>
                      <td className="p-4 text-gray-300">{item.email}</td>
                      <td className="p-4">{item.memorial_name || "No memorial"}</td>
                      <td className="p-4">{item.plan || "free"}</td>
                      <td className="p-4 text-gray-300">
                        {item.trial_ends_at
                          ? new Date(item.trial_ends_at).toLocaleDateString()
                          : "No trial"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            item.is_active && !expired
                              ? "bg-green-500/20 text-green-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {item.is_active && !expired ? "Active" : "Expired"}
                        </span>
                      </td>
                      <td className="p-4">{item.payment_status || "n/a"}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => updateAccount(item.user_id, item.memorial_id, "extend_7")} className="rounded bg-[#0b1320] px-3 py-2 text-xs text-white hover:bg-[#1f2a44]">Extend 7 Days</button>
                          <button onClick={() => updateAccount(item.user_id, item.memorial_id, "extend_14")} className="rounded bg-[#0b1320] px-3 py-2 text-xs text-white hover:bg-[#1f2a44]">Extend 14 Days</button>
                          <button onClick={() => updateAccount(item.user_id, item.memorial_id, "standard")} className="rounded bg-[#d4af37] px-3 py-2 text-xs font-semibold text-black">Standard</button>
                          <button onClick={() => updateAccount(item.user_id, item.memorial_id, "premium")} className="rounded bg-[#d4af37] px-3 py-2 text-xs font-semibold text-black">Premium</button>
                          <button onClick={() => updateAccount(item.user_id, item.memorial_id, "eternal")} className="rounded bg-[#d4af37] px-3 py-2 text-xs font-semibold text-black">Eternal</button>
                          <button onClick={() => updateAccount(item.user_id, item.memorial_id, "deactivate")} className="rounded bg-red-900/60 px-3 py-2 text-xs text-red-100">Deactivate</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
