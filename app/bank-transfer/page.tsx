"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import SiteHeader from "../components/SiteHeader";

function BankTransferContent() {
  const searchParams = useSearchParams();

  const memorialId = searchParams.get("memorial_id") || "";
  const packageName = searchParams.get("package_name") || "Selected Package";
  const packagePrice = searchParams.get("package_price") || "0";

  const [transferReference, setTransferReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitReference = async () => {
    setErrorMessage("");

    if (!memorialId) {
      setErrorMessage("Missing memorial information. Please return to packages and try again.");
      return;
    }

    if (!transferReference.trim()) {
      setErrorMessage("Please enter your bank transfer reference number.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/bank-transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memorial_id: memorialId,
          transfer_reference: transferReference.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Could not save transfer reference.");
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <SiteHeader />

      <section className="relative min-h-[52vh] overflow-hidden bg-[#26447F]">
        <img
          src="/images/home-hero.jpg"
          alt="Bank transfer payment"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#26447F]/95 via-[#26447F]/84 to-[#0b1320]/50" />

        <div className="relative z-10 mx-auto flex min-h-[52vh] max-w-7xl items-center px-6 py-20 sm:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
              Online Banking Transfer
            </p>

            <h1 className="font-serif text-4xl font-bold leading-tight text-[#f8f5ee] sm:text-5xl md:text-6xl">
              Send your transfer and enter your reference number.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              Your memorial will remain pending while payment is reviewed.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        {submitted ? (
          <div className="rounded-3xl border border-green-400/30 bg-green-500/10 p-8 text-center shadow-2xl">
            <div className="mb-5 text-6xl">✅</div>

            <h2 className="mb-4 font-serif text-4xl text-green-200">
              Transfer Reference Submitted
            </h2>

            <p className="mx-auto max-w-2xl leading-relaxed text-gray-200">
              Thank you. Your memorial is pending payment review. Once payment
              is confirmed in the account, your memorial will be manually
              activated. If payment cannot be confirmed within 48 hours, the
              memorial may be deactivated until payment is verified.
            </p>

            <a
              href="/dashboard"
              className="mt-8 inline-block rounded-full bg-[#d4af37] px-8 py-4 font-semibold text-[#0b1320]"
            >
              Go To Dashboard
            </a>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-3xl border border-[#d4af37]/25 bg-[#111a2e] p-6 shadow-2xl sm:p-8">
              <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Bank Details
              </p>

              <h2 className="mb-6 font-serif text-3xl text-white">
                RBC Royal Bank
              </h2>

              <div className="space-y-4">
                <div className="rounded-2xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
                  <p className="text-sm text-gray-400">Account Name</p>
                  <p className="mt-1 text-xl font-semibold text-white">
                    Keith Guevara
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
                  <p className="text-sm text-gray-400">Account Number</p>
                  <p className="mt-1 font-mono text-xl font-semibold text-[#d4af37]">
                    110000005090248
                  </p>
                </div>

                <div className="rounded-2xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
                  <p className="text-sm text-gray-400">Account Type</p>
                  <p className="mt-1 text-xl font-semibold text-white">
                    Savings Account
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-4">
                <p className="text-sm leading-relaxed text-yellow-100">
                  Please send the transfer immediately. Bank transfers can take
                  1–2 business days to appear. Enter your transfer reference
                  number after sending the payment.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-[#d4af37]/25 bg-[#111a2e] p-6 shadow-2xl sm:p-8">
              <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Payment Review
              </p>

              <h2 className="mb-6 font-serif text-3xl text-white">
                Submit Transfer Reference
              </h2>

              <div className="mb-6 rounded-2xl border border-[#d4af37]/15 bg-[#0b1320] p-4">
                <p className="text-sm text-gray-400">Package</p>
                <p className="mt-1 font-semibold text-white">
                  {packageName.replace(/-/g, " ")}
                </p>

                <p className="mt-4 text-sm text-gray-400">Amount</p>
                <p className="mt-1 text-2xl font-bold text-[#d4af37]">
                  ${packagePrice} USD
                </p>

                <p className="mt-4 text-sm text-gray-400">Memorial ID</p>
                <p className="mt-1 font-mono text-white">#{memorialId}</p>
              </div>

              {errorMessage && (
                <div className="mb-5 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-red-100">
                  {errorMessage}
                </div>
              )}

              <label className="mb-2 block text-sm font-semibold text-[#d4af37]">
                Bank Transfer Reference Number
              </label>

              <input
                value={transferReference}
                onChange={(e) => setTransferReference(e.target.value)}
                placeholder="Enter transfer/reference number"
                className="mb-5 w-full rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37]"
              />

              <button
                type="button"
                onClick={submitReference}
                disabled={loading}
                className="w-full rounded-full bg-[#d4af37] px-6 py-4 font-semibold text-[#0b1320] shadow-xl transition hover:scale-105 hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting Reference..." : "Submit Transfer Reference"}
              </button>

              <p className="mt-5 text-sm leading-relaxed text-gray-400">
                Once payment is confirmed in the account, your memorial will be
                manually activated. If payment cannot be confirmed within 48
                hours, the memorial may be deactivated until payment is
                verified.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default function BankTransferPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
          Loading bank transfer page...
        </main>
      }
    >
      <BankTransferContent />
    </Suspense>
  );
}