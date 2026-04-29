"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CreateMemorialPage() {
  const searchParams = useSearchParams();

  const packageSlug = searchParams.get("package") || "";
  const packagePrice = searchParams.get("price") || "0";

  const [loading, setLoading] = useState(false);

  const [creatorName, setCreatorName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [creatorPhone, setCreatorPhone] = useState("");
  const [creatorRelationship, setCreatorRelationship] =
    useState("");

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [biography, setBiography] = useState("");
  const [coverPhoto, setCoverPhoto] =
    useState<File | null>(null);

  const [enableFamilyTree, setEnableFamilyTree] =
    useState(false);

  const [enableReminders, setEnableReminders] =
    useState(false);

  const submitMemorial = async () => {
    if (!creatorName || !creatorEmail || !fullName) {
      alert(
        "Please complete all required fields."
      );
      return;
    }

    const formData = new FormData();

    formData.append("creator_name", creatorName);
    formData.append("creator_email", creatorEmail);
    formData.append("creator_phone", creatorPhone);
    formData.append(
      "creator_relationship",
      creatorRelationship
    );

    formData.append("full_name", fullName);
    formData.append("birth_date", birthDate);
    formData.append("death_date", deathDate);
    formData.append("biography", biography);

    formData.append("package_slug", packageSlug);
    formData.append(
      "package_name",
      packageSlug.replace(/-/g, " ")
    );
    formData.append("package_price", packagePrice);

    formData.append(
      "enable_family_tree",
      enableFamilyTree ? "1" : "0"
    );

    formData.append(
      "enable_reminders",
      enableReminders ? "1" : "0"
    );

    if (coverPhoto) {
      formData.append("cover_photo", coverPhoto);
    }

    try {
      setLoading(true);

      const res = await fetch("/api/memorials", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create memorial");
        return;
      }

      if (Number(packagePrice) > 0) {
        const paymentRes = await fetch(
          "/api/wipay-checkout",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              memorial_id: data.memorial.id,
              package_name:
                data.memorial.package_name,
              package_price:
                data.memorial.package_price,
              customer_name: creatorName,
            }),
          }
        );

        const paymentData =
          await paymentRes.json();

        if (!paymentRes.ok) {
          alert(
            paymentData.error ||
              "Payment setup failed"
          );
          return;
        }

        window.location.href =
          paymentData.checkout_url;
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-bold text-[#0b1320]">
            Begin the Journey
          </h1>

          <p className="mt-3 text-gray-600">
            Create a dedicated digital sanctuary
            for your loved one.
          </p>
        </div>

        <div className="space-y-8">
          {/* Selected Package */}
          <div className="rounded-xl border p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Selected Package
            </h2>

            <input
              readOnly
              value={packageSlug}
              className="w-full rounded border p-3"
            />

            <input
              readOnly
              value={`$${packagePrice}`}
              className="mt-3 w-full rounded border p-3"
            />
          </div>

          {/* Your Information */}
          <div className="rounded-xl border p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Your Information
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder="Owner / Creator Full Name"
                value={creatorName}
                onChange={(e) =>
                  setCreatorName(e.target.value)
                }
                className="rounded border p-3"
              />

              <input
                placeholder="Owner / Creator Email Address"
                value={creatorEmail}
                onChange={(e) =>
                  setCreatorEmail(
                    e.target.value
                  )
                }
                className="rounded border p-3"
              />

              <input
                placeholder="Phone / WhatsApp Number"
                value={creatorPhone}
                onChange={(e) =>
                  setCreatorPhone(
                    e.target.value
                  )
                }
                className="rounded border p-3"
              />

              <input
                placeholder="Relationship to Loved One"
                value={creatorRelationship}
                onChange={(e) =>
                  setCreatorRelationship(
                    e.target.value
                  )
                }
                className="rounded border p-3"
              />
            </div>
          </div>

          {/* Memorial Details */}
          <div className="rounded-xl border p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Memorial Details
            </h2>

            <input
              placeholder="Loved One’s Full Name"
              value={fullName}
              onChange={(e) =>
                setFullName(e.target.value)
              }
              className="mb-4 w-full rounded border p-3"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="date"
                value={birthDate}
                onChange={(e) =>
                  setBirthDate(
                    e.target.value
                  )
                }
                className="rounded border p-3"
              />

              <input
                type="date"
                value={deathDate}
                onChange={(e) =>
                  setDeathDate(
                    e.target.value
                  )
                }
                className="rounded border p-3"
              />
            </div>

            <textarea
              placeholder="Tell Their Story (Biography)"
              value={biography}
              onChange={(e) =>
                setBiography(e.target.value)
              }
              className="mt-4 w-full rounded border p-3"
              rows={5}
            />

            <input
              type="file"
              onChange={(e) =>
                setCoverPhoto(
                  e.target.files?.[0] || null
                )
              }
              className="mt-4 w-full rounded border p-3"
            />
          </div>

          {/* Additional Options */}
          <div className="rounded-xl border p-6">
            <h2 className="mb-4 text-xl font-semibold">
              Additional Options
            </h2>

            <label className="mb-4 flex items-center gap-3">
              <input
                type="checkbox"
                checked={enableFamilyTree}
                onChange={(e) =>
                  setEnableFamilyTree(
                    e.target.checked
                  )
                }
              />
              Enable Family Tree
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={enableReminders}
                onChange={(e) =>
                  setEnableReminders(
                    e.target.checked
                  )
                }
              />
              Enable Anniversary Reminders
            </label>
          </div>

          <button
            onClick={submitMemorial}
            disabled={loading}
            className="w-full rounded-lg bg-[#0b1320] py-4 font-semibold text-white"
          >
            {loading
              ? "Creating Memorial..."
              : "Continue to Payment"}
          </button>
        </div>
      </div>
    </main>
  );
}