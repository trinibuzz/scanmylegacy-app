"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const packageNames: any = {
  "starter-tribute": "Starter Tribute",
  "standard-legacy": "Standard Legacy",
  "premium-legacy": "Premium Legacy",
  "eternal-legacy": "Eternal Legacy",
};

function CreateMemorialForm() {
  const searchParams = useSearchParams();

  const packageSlug = searchParams.get("package") || "starter-tribute";
  const packagePrice = searchParams.get("price") || "0";
  const packageName = packageNames[packageSlug] || "Starter Tribute";

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const saveMemorial = async () => {
    if (saving) return;

    if (!fullName.trim()) {
      alert("Please enter the full name");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("full_name", fullName);
      formData.append("birth_date", birthDate);
      formData.append("death_date", deathDate);
      formData.append("biography", biography);
      formData.append("package_slug", packageSlug);
      formData.append("package_name", packageName);
      formData.append("package_price", packagePrice);

      if (coverPhoto) {
        formData.append("cover_photo", coverPhoto);
      }

      // Step 1: Create memorial
      const res = await fetch("/api/memorials", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create memorial");
        return;
      }

      // Free package → go dashboard
      if (Number(packagePrice) === 0) {
        window.location.href = "/dashboard";
        return;
      }

      // Paid package → WiPay checkout
      const paymentRes = await fetch("/api/wipay-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memorial_id: data.memorial.id,
          package_name: packageName,
          package_price: packagePrice,
          customer_name: fullName,
        }),
      });

      const paymentData = await paymentRes.json();

      if (!paymentRes.ok) {
        alert(paymentData.error || "Payment initialization failed");
        return;
      }

      if (paymentData.checkout_url) {
        window.location.href = paymentData.checkout_url;
      } else {
        alert("Invalid payment link received");
      }
    } catch {
      alert("Failed to create memorial");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
      <div className="w-full max-w-2xl rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 shadow-2xl">
        <h1 className="mb-2 text-center font-serif text-3xl">
          Preserve a Legacy
        </h1>

        <p className="mb-6 text-center text-gray-400">
          Create a timeless memorial tribute.
        </p>

        <div className="mb-6 rounded-lg border border-[#d4af37]/40 bg-[#0b1320] p-4 text-center">
          <p className="text-sm text-gray-400">Selected Package</p>

          <p className="font-serif text-xl text-[#d4af37]">
            {packageName}
          </p>

          <p className="text-gray-300">
            {Number(packagePrice) === 0
              ? "Free"
              : `$${packagePrice} USD`}
          </p>
        </div>

        <input
          className="mb-3 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-3 text-white outline-none"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            type="date"
            className="rounded-lg border border-[#2a3550] bg-[#0b1320] p-3 text-white outline-none"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          <input
            type="date"
            className="rounded-lg border border-[#2a3550] bg-[#0b1320] p-3 text-white outline-none"
            value={deathDate}
            onChange={(e) => setDeathDate(e.target.value)}
          />
        </div>

        <input
          type="file"
          accept="image/*"
          className="mb-3 w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-3 text-white"
          onChange={(e) => setCoverPhoto(e.target.files?.[0] || null)}
        />

        <textarea
          className="mb-4 min-h-[120px] w-full rounded-lg border border-[#2a3550] bg-[#0b1320] p-3 text-white outline-none"
          placeholder="Write a life story, tribute, or memories..."
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
        />

        <button
          onClick={saveMemorial}
          disabled={saving}
          className="w-full rounded-lg bg-[#d4af37] py-3 font-semibold text-black disabled:opacity-60"
        >
          {saving
            ? "Creating Memorial..."
            : Number(packagePrice) === 0
            ? "Create Memorial"
            : "Continue To Payment"}
        </button>
      </div>
    </main>
  );
}

export default function CreateMemorial() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0b1320] p-6 text-white">
          <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center">
            Loading...
          </div>
        </main>
      }
    >
      <CreateMemorialForm />
    </Suspense>
  );
}