"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const memorialId = searchParams.get("memorial_id");

  useEffect(() => {
    const activateMemorial = async () => {
      if (!memorialId) return;

      await fetch("/api/memorials/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memorial_id: memorialId,
        }),
      });
    };

    activateMemorial();
  }, [memorialId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
      <div className="w-full max-w-xl rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center shadow-2xl">
        <div className="mb-6 text-6xl">✅</div>

        <h1 className="mb-4 font-serif text-4xl text-[#d4af37]">
          Payment Successful
        </h1>

        <p className="mb-6 text-gray-300">
          Your memorial has been activated successfully.
        </p>

        <a
          href="/dashboard"
          className="inline-block rounded bg-[#d4af37] px-6 py-3 font-semibold text-black"
        >
          Go To Dashboard
        </a>
      </div>
    </main>
  );
}