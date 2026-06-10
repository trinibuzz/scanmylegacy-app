"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const paymentFor = searchParams.get("payment_for") || "memorial";
  const memorialId = searchParams.get("memorial_id");
  const giftOrderId = searchParams.get("gift_order_id");

  const isGiftPayment = paymentFor === "gift";

  const [message, setMessage] = useState("Confirming your payment...");
  const [buttonHref, setButtonHref] = useState("/dashboard");
  const [buttonText, setButtonText] = useState("Go To Dashboard");

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        if (isGiftPayment) {
          if (!giftOrderId) {
            setMessage("Payment was successful, but the gift order ID is missing.");
            return;
          }

          const res = await fetch("/api/gift-orders/mark-paid", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              gift_order_id: giftOrderId,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            setMessage(data.error || "Payment was successful, but the gift order could not be updated.");
            return;
          }

          setMessage(
            "Your Legacy Gift payment was successful. Your gift order is now marked for activation."
          );
          setButtonHref("/gift/start");
          setButtonText("Create Another Gift");
          return;
        }

        if (!memorialId) {
          setMessage("Payment was successful, but the memorial ID is missing.");
          return;
        }

        const res = await fetch("/api/memorials/activate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            memorial_id: memorialId,
          }),
        });

        if (!res.ok) {
          setMessage("Payment was successful, but the memorial could not be activated automatically.");
          return;
        }

        setMessage("Your memorial has been activated successfully.");
        setButtonHref("/dashboard");
        setButtonText("Go To Dashboard");
      } catch {
        setMessage("Payment was successful, but there was an issue updating the order.");
      }
    };

    confirmPayment();
  }, [giftOrderId, memorialId, isGiftPayment]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
      <div className="w-full max-w-xl rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center shadow-2xl">
        <div className="mb-6 text-6xl">✅</div>

        <h1 className="mb-4 font-serif text-4xl text-[#d4af37]">
          Payment Successful
        </h1>

        <p className="mb-6 text-gray-300">{message}</p>

        {isGiftPayment && giftOrderId && (
          <div className="mb-6 rounded-xl border border-[#d4af37]/25 bg-[#0b1320] p-4 text-sm text-gray-300">
            Gift Order Reference:{" "}
            <span className="font-semibold text-[#d4af37]">
              #{giftOrderId}
            </span>
          </div>
        )}

        {!isGiftPayment && memorialId && (
          <div className="mb-6 rounded-xl border border-[#d4af37]/25 bg-[#0b1320] p-4 text-sm text-gray-300">
            Memorial Reference:{" "}
            <span className="font-semibold text-[#d4af37]">
              #{memorialId}
            </span>
          </div>
        )}

        <a
          href={buttonHref}
          className="inline-block rounded bg-[#d4af37] px-6 py-3 font-semibold text-black"
        >
          {buttonText}
        </a>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8">
            Loading payment confirmation...
          </div>
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}