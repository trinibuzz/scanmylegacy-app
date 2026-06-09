"use client";

import { FormEvent, ReactNode, useState } from "react";

type LegacyPackage = {
  name: string;
  label: string;
  usd: number;
  ttd: number;
};

const packages: LegacyPackage[] = [
  {
    name: "Starter Tribute",
    label: "Starter Tribute — Free 14 Days",
    usd: 0,
    ttd: 0,
  },
  {
    name: "Standard Legacy",
    label: "Standard Legacy — $59 USD / TTD $400",
    usd: 59,
    ttd: 400,
  },
  {
    name: "Premium Legacy",
    label: "Premium Legacy — $89 USD / TTD $600",
    usd: 89,
    ttd: 600,
  },
  {
    name: "Eternal Legacy",
    label: "Eternal Legacy — $129 USD / TTD $875",
    usd: 129,
    ttd: 875,
  },
];

export default function GiftStartForm() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const selectedPackage = packages.find(
      (pkg) => pkg.name === String(formData.get("package_name"))
    );

    const payload = {
      buyer_name: String(formData.get("buyer_name") || ""),
      buyer_email: String(formData.get("buyer_email") || ""),
      buyer_phone: String(formData.get("buyer_phone") || ""),

      recipient_name: String(formData.get("recipient_name") || ""),
      relationship: String(formData.get("relationship") || ""),
      recipient_status: String(formData.get("recipient_status") || "unknown"),
      occasion: String(formData.get("occasion") || ""),

      gift_message: String(formData.get("gift_message") || ""),
      delivery_method: String(formData.get("delivery_method") || "whatsapp"),

      package_name: selectedPackage?.name || "",
      package_price_usd: selectedPackage?.usd || 0,
      package_price_ttd: selectedPackage?.ttd || 0,
    };

    try {
      const res = await fetch("/api/gift-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();

      let data: any = null;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "The API returned a webpage instead of JSON. This usually means /api/gift-orders is not loading correctly. Response started with: " +
            text.slice(0, 120)
        );
      }

      if (!res.ok) {
        throw new Error(data?.details || data?.error || "Something went wrong.");
      }

      setStatus(
        `Gift order created successfully. Setup link: ${data.setup_link}`
      );

      form.reset();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 rounded-3xl border border-[#d4af37]/30 bg-white/5 p-6 md:p-8"
    >
      <SectionTitle title="Your Information" />

      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Your Name" name="buyer_name" required />
        <Input label="Your Email" name="buyer_email" type="email" required />
        <Input label="Phone / WhatsApp" name="buyer_phone" />
      </div>

      <SectionTitle title="Gift Recipient" />

      <div className="grid gap-5 md:grid-cols-2">
        <Input label="Recipient Full Name" name="recipient_name" required />
        <Input
          label="Relationship"
          name="relationship"
          placeholder="Mother, Father, Grandparent..."
        />

        <Select label="Is this person living or passed?" name="recipient_status">
          <option value="unknown">Select one</option>
          <option value="living">Living</option>
          <option value="passed">Passed</option>
        </Select>

        <Select label="Occasion" name="occasion">
          <option value="">Select occasion</option>
          <option>Birthday</option>
          <option>Mother’s Day</option>
          <option>Father’s Day</option>
          <option>Anniversary</option>
          <option>Retirement</option>
          <option>Memorial</option>
          <option>Family Reunion</option>
          <option>Other</option>
        </Select>
      </div>

      <SectionTitle title="Gift Details" />

      <Select label="Package" name="package_name" required>
        <option value="">Choose package</option>
        {packages.map((pkg) => (
          <option key={pkg.name} value={pkg.name}>
            {pkg.label}
          </option>
        ))}
      </Select>

      <Select label="Delivery Method" name="delivery_method">
        <option value="whatsapp">Send by WhatsApp</option>
        <option value="email">Send by Email</option>
        <option value="print">Print Certificate</option>
        <option value="private">Keep Private Until Ready</option>
      </Select>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-medium text-white/80">
          Personal Gift Message
        </span>
        <textarea
          name="gift_message"
          rows={5}
          className="w-full rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-white outline-none focus:border-[#d4af37]"
          placeholder="Write a message to the recipient or family..."
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 rounded-full bg-[#d4af37] px-8 py-3 font-semibold text-[#071426] disabled:opacity-60"
      >
        {loading ? "Creating Gift Order..." : "Create Gift Order"}
      </button>

      {status && (
        <p className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-white/85">
          {status}
        </p>
      )}
    </form>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="mb-5 mt-8 border-b border-white/10 pb-3 font-serif text-2xl text-[#d4af37] first:mt-0">
      {title}
    </h2>
  );
}

type InputProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
};

function Input({
  label,
  name,
  type = "text",
  required = false,
  placeholder = "",
}: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-white/80">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-white outline-none focus:border-[#d4af37]"
      />
    </label>
  );
}

type SelectProps = {
  label: string;
  name: string;
  required?: boolean;
  children: ReactNode;
};

function Select({ label, name, required = false, children }: SelectProps) {
  return (
    <label className="mt-5 block">
      <span className="mb-2 block text-sm font-medium text-white/80">
        {label}
      </span>
      <select
        name={name}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-[#071426] px-4 py-3 text-white outline-none focus:border-[#d4af37]"
      >
        {children}
      </select>
    </label>
  );
}