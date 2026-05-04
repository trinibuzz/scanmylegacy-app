"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteHeader from "../components/SiteHeader";

function PaymentOptionsContent() {
  const searchParams = useSearchParams();

  const memorialId = searchParams.get("memorial_id") || "";
  const packageName = searchParams.get("package_name") || "Selected Package";
  const packagePrice = searchParams.get("package_price") || "0";
  const customerName = searchParams.get("customer_name") || "";

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const startWiPay = async () => {
    setErrorMessage("");

    if (!memorialId || !packagePrice) {
      setErrorMessage("Missing payment information. Please return to packages and try again.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/wipay-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memorial_id: memorialId,
          package_name: packageName,
          package_price: packagePrice,
          customer_name: customerName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "WiPay payment setup failed. Please try again.");
        return;
      }

      window.location.href = data.checkout_url;
    } catch {
      setErrorMessage("Something went wrong starting WiPay. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const bankTransferUrl = `/bank-transfer?memorial_id=${encodeURIComponent(
    memorialId
  )}&package_name=${encodeURIComponent(packageName)}&package_price=${encodeURIComponent(
    packagePrice
  )}&customer_name=${encodeURIComponent(customerName)}`;

  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <SiteHeader />

      <section className="relative min-h-[62vh] overflow-hidden bg-[#26447F]">
        <img
          src="/images/home-hero.jpg"
          alt="Choose payment method"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#26447F]/95 via-[#26447F]/84 to-[#0b1320]/50" />

        <div className="relative z-10 mx-auto flex min-h-[62vh] max-w-7xl items-center px-6 py-20 sm:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
              Payment Options
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-7xl">
              Choose how you would like to pay.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
              Your memorial has been created and is waiting for payment
              confirmation. Choose WiPay or Online Banking / Money Transfer.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 rounded-3xl border border-[#d4af37]/25 bg-[#111a2e] p-6 shadow-2xl sm:p-8">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            Order Summary
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-gray-400">Package</p>
              <p className="mt-1 font-serif text-2xl text-white">
                {packageName.replace(/-/g, " ")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Amount</p>
              <p className="mt-1 text-2xl font-bold text-[#d4af37]">
                ${packagePrice} USD
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-400">Memorial ID</p>
              <p className="mt-1 font-mono text-lg text-gray-200">
                #{memorialId}
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-400/40 bg-red-500/10 p-5 text-center text-red-100">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-[#d4af37]/25 bg-[#111a2e] p-8 shadow-xl">
            <div className="mb-5 text-5xl">💳</div>

            <h2 className="mb-3 font-serif text-3xl text-[#d4af37]">
              Pay Online with WiPay
            </h2>

            <p className="mb-6 leading-relaxed text-gray-300">
              Pay securely online using WiPay. Once payment is successful, your
              memorial will be activated automatically.
            </p>

            <button
              type="button"
              onClick={startWiPay}
              disabled={loading}
              className="w-full rounded-full bg-[#d4af37] px-6 py-4 font-semibold text-[#0b1320] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Opening WiPay..." : "Pay with WiPay"}
            </button>
          </div>

          <div className="rounded-3xl border border-[#d4af37]/25 bg-[#111a2e] p-8 shadow-xl">
            <div className="mb-5 text-5xl">🏦</div>

            <h2 className="mb-3 font-serif text-3xl text-[#d4af37]">
              Online Banking / Money Transfer
            </h2>

            <p className="mb-6 leading-relaxed text-gray-300">
              Send the transfer immediately, then enter your bank transfer
              reference number. Your memorial will remain pending while payment
              is reviewed.
            </p>

            <a
              href={bankTransferUrl}
              className="block w-full rounded-full border border-[#d4af37]/50 px-6 py-4 text-center font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320]"
            >
              Use Bank Transfer
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PaymentOptionsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
          Loading payment options...
        </main>
      }
    >
      <PaymentOptionsContent />
    </Suspense>
  );
}