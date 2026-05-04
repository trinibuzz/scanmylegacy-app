"use client";

import { useEffect, useMemo, useState } from "react";

export default function FamilyTreeManager({ params }: any) {
  const memorialId = params.id;

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [parentId, setParentId] = useState("");
  const [spouseId, setSpouseId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const relationships = [
    "Mother",
    "Father",
    "Deceased",
    "Spouse",
    "Brother",
    "Sister",
    "Brother-in-law",
    "Sister-in-law",
    "Son",
    "Daughter",
    "Nephew",
    "Niece",
    "Grandson",
    "Granddaughter",
    "Cousin",
  ];

  const loadMembers = async () => {
    try {
      setPageLoading(true);

      const res = await fetch(`/api/family-tree?memorial_id=${memorialId}`);
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to load family tree.");
        return;
      }

      setMembers(data.members || []);
    } catch {
      setMessage("Failed to load family tree.");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const getGenerationFromRelationship = (rel: string) => {
    if (rel === "Mother" || rel === "Father") return -1;

    if (
      rel === "Deceased" ||
      rel === "Spouse" ||
      rel === "Brother" ||
      rel === "Sister" ||
      rel === "Brother-in-law" ||
      rel === "Sister-in-law"
    ) {
      return 0;
    }

    if (
      rel === "Son" ||
      rel === "Daughter" ||
      rel === "Nephew" ||
      rel === "Niece"
    ) {
      return 1;
    }

    if (
      rel === "Grandson" ||
      rel === "Granddaughter" ||
      rel === "Cousin"
    ) {
      return 2;
    }

    return 0;
  };

  const needsParentBranch = [
    "Son",
    "Daughter",
    "Nephew",
    "Niece",
    "Grandson",
    "Granddaughter",
    "Cousin",
  ].includes(relationship);

  const needsSpouseLink = [
    "Spouse",
    "Brother-in-law",
    "Sister-in-law",
  ].includes(relationship);

  const parentOptions = useMemo(() => {
    if (relationship === "Son" || relationship === "Daughter") {
      return members.filter(
        (m) => m.relationship === "Deceased" || m.relationship === "Spouse"
      );
    }

    if (relationship === "Nephew" || relationship === "Niece") {
      return members.filter(
        (m) => m.relationship === "Brother" || m.relationship === "Sister"
      );
    }

    if (relationship === "Grandson" || relationship === "Granddaughter") {
      return members.filter(
        (m) => m.relationship === "Son" || m.relationship === "Daughter"
      );
    }

    if (relationship === "Cousin") {
      return members.filter(
        (m) => m.relationship === "Nephew" || m.relationship === "Niece"
      );
    }

    return members;
  }, [members, relationship]);

  const spouseOptions = useMemo(() => {
    if (relationship === "Spouse") {
      return members.filter((m) => m.relationship === "Deceased");
    }

    if (relationship === "Brother-in-law" || relationship === "Sister-in-law") {
      return members.filter(
        (m) => m.relationship === "Brother" || m.relationship === "Sister"
      );
    }

    return members;
  }, [members, relationship]);

  const resetForm = () => {
    setName("");
    setRelationship("");
    setParentId("");
    setSpouseId("");
    setBirthDate("");
    setDeathDate("");
    setPhoto(null);

    const fileInput = document.getElementById("family-photo") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 4500);
  };

  const addMember = async () => {
    if (loading) return;

    if (!name.trim()) {
      showMessage("Please enter the family member’s full name.");
      return;
    }

    if (!relationship) {
      showMessage("Please choose a relationship.");
      return;
    }

    if (needsParentBranch && !parentId) {
      showMessage("Please choose the parent or branch this person belongs to.");
      return;
    }

    if (needsSpouseLink && !spouseId) {
      showMessage("Please choose who this spouse belongs to.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("memorial_id", memorialId);
      formData.append("name", name.trim());
      formData.append("relationship", relationship);
      formData.append("parent_id", parentId);
      formData.append("spouse_id", spouseId);
      formData.append(
        "generation",
        String(getGenerationFromRelationship(relationship))
      );
      formData.append("birth_date", birthDate);
      formData.append("death_date", deathDate);

      if (photo) {
        formData.append("photo", photo);
      }

      const res = await fetch("/api/family-tree", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.error || "Failed to add family member.");
        return;
      }

      showMessage("Family member added successfully.");
      resetForm();
      await loadMembers();
    } catch {
      showMessage("Failed to add family member.");
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id: number) => {
    const yes = confirm("Delete this family member?");
    if (!yes) return;

    try {
      const res = await fetch(
        `/api/family-tree?id=${id}&memorial_id=${memorialId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.error || "Delete failed.");
        return;
      }

      showMessage("Family member deleted.");
      await loadMembers();
    } catch {
      showMessage("Delete failed.");
    }
  };

  const getLinkedName = (id: number | null) => {
    const found = members.find((m) => Number(m.id) === Number(id));
    return found ? found.name : "";
  };

  const parents = members.filter(
    (m) => m.relationship === "Mother" || m.relationship === "Father"
  );

  const mainLine = members.filter(
    (m) =>
      m.relationship === "Deceased" ||
      m.relationship === "Spouse" ||
      m.relationship === "Brother" ||
      m.relationship === "Sister" ||
      m.relationship === "Brother-in-law" ||
      m.relationship === "Sister-in-law"
  );

  const childrenLine = members.filter(
    (m) =>
      m.relationship === "Son" ||
      m.relationship === "Daughter" ||
      m.relationship === "Nephew" ||
      m.relationship === "Niece"
  );

  const grandchildrenLine = members.filter(
    (m) =>
      m.relationship === "Grandson" ||
      m.relationship === "Granddaughter" ||
      m.relationship === "Cousin"
  );

  const inputClass =
    "w-full rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-white outline-none transition placeholder:text-gray-500 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/30 [color-scheme:dark]";

  const labelClass =
    "mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-[#d4af37]";

  const renderMemberCard = (m: any) => (
    <div
      key={m.id}
      className="group overflow-hidden rounded-2xl border border-[#d4af37]/20 bg-[#111a2e] shadow-xl transition hover:-translate-y-1 hover:border-[#d4af37]/60"
    >
      <div className="relative h-44 bg-[#081827]">
        {m.photo_url ? (
          <img
            src={m.photo_url}
            alt={m.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">
            👤
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        <div className="absolute bottom-4 left-4 right-4">
          <h4 className="font-serif text-xl font-semibold text-white">
            {m.name}
          </h4>

          <p className="mt-1 w-fit rounded-full border border-[#d4af37]/40 bg-black/40 px-3 py-1 text-xs text-[#d4af37] backdrop-blur">
            {m.relationship}
          </p>
        </div>
      </div>

      <div className="space-y-2 p-5">
        {m.birth_date && (
          <p className="text-xs text-gray-400">
            Born: {new Date(m.birth_date).toLocaleDateString()}
          </p>
        )}

        {m.death_date && (
          <p className="text-xs text-gray-400">
            Passed: {new Date(m.death_date).toLocaleDateString()}
          </p>
        )}

        {m.parent_id && (
          <p className="text-xs text-gray-400">
            Parent / Branch:{" "}
            <span className="text-gray-200">{getLinkedName(m.parent_id)}</span>
          </p>
        )}

        {m.spouse_id && (
          <p className="text-xs text-gray-400">
            Spouse Of:{" "}
            <span className="text-gray-200">{getLinkedName(m.spouse_id)}</span>
          </p>
        )}

        <button
          onClick={() => deleteMember(m.id)}
          className="mt-4 w-full rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
        >
          Delete Member
        </button>
      </div>
    </div>
  );

  const renderSection = (title: string, subtitle: string, list: any[]) => (
    <section className="rounded-3xl border border-[#1f2a44] bg-[#0f1b2f] p-5 shadow-xl sm:p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[#d4af37]">
          {subtitle}
        </p>

        <h3 className="mt-2 font-serif text-2xl text-white">{title}</h3>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d4af37]/25 bg-[#0b1320] p-6 text-center text-sm text-gray-400">
          No family members added in this section yet.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {list.map(renderMemberCard)}
        </div>
      )}
    </section>
  );

  return (
    <main className="min-h-screen bg-[#0b1320] text-white">
      <section className="relative overflow-hidden border-b border-[#d4af37]/20 bg-[#26447F]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.22),transparent_35%),linear-gradient(135deg,#26447F,#0b1320_70%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#d4af37]">
                Family Tree Manager
              </p>

              <h1 className="font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
                Build the roots and branches of this legacy.
              </h1>

              <p className="mt-4 max-w-2xl leading-relaxed text-white/80">
                Add parents, siblings, spouses, children, grandchildren, and
                extended family so future generations can understand where they
                came from.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/dashboard"
                className="rounded-full border border-[#d4af37]/50 px-5 py-3 text-sm font-semibold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320]"
              >
                Back to Dashboard
              </a>

              <a
                href={`/dashboard/memorial/${memorialId}`}
                className="rounded-full bg-[#d4af37] px-5 py-3 text-sm font-semibold text-[#0b1320] transition hover:bg-[#f0c94a]"
              >
                Manage Memorial
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {message && (
          <div className="mb-8 rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-5 text-center text-[#d4af37] shadow-xl">
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <aside className="h-fit rounded-3xl border border-[#d4af37]/25 bg-[#111a2e] p-6 shadow-2xl lg:sticky lg:top-6">
            <div className="mb-6">
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
                Add Member
              </p>

              <h2 className="font-serif text-3xl text-white">
                Family Details
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Start with the deceased, then add parents, spouse, siblings,
                children, and future generations.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  className={inputClass}
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Relationship</label>
                <select
                  className={inputClass}
                  value={relationship}
                  onChange={(e) => {
                    setRelationship(e.target.value);
                    setParentId("");
                    setSpouseId("");
                  }}
                >
                  <option value="">Choose relationship</option>
                  {relationships.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel === "Spouse" ? "Spouse of Deceased" : rel}
                    </option>
                  ))}
                </select>
              </div>

              {needsParentBranch && (
                <div>
                  <label className={labelClass}>Parent / Branch</label>
                  <select
                    className={inputClass}
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                  >
                    <option value="">Choose parent or branch</option>

                    {parentOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.relationship})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {needsSpouseLink && (
                <div>
                  <label className={labelClass}>Spouse Link</label>
                  <select
                    className={inputClass}
                    value={spouseId}
                    onChange={(e) => setSpouseId(e.target.value)}
                  >
                    <option value="">Choose spouse link</option>

                    {spouseOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.relationship})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <label className={labelClass}>Birth Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Passing Date</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Photo Optional</label>
                <input
                  id="family-photo"
                  type="file"
                  accept="image/*"
                  className="w-full cursor-pointer rounded-xl border border-[#d4af37]/20 bg-[#0b1320] p-4 text-sm text-gray-300 file:mr-4 file:rounded-full file:border-0 file:bg-[#d4af37] file:px-4 file:py-2 file:font-semibold file:text-[#0b1320]"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                />

                {photo && (
                  <p className="mt-2 text-xs text-[#d4af37]">
                    Selected: {photo.name}
                  </p>
                )}
              </div>

              <button
                onClick={addMember}
                disabled={loading}
                className="w-full rounded-full bg-[#d4af37] py-4 font-semibold text-[#0b1320] shadow-xl transition hover:scale-[1.01] hover:bg-[#f0c94a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Adding Member..." : "Add Family Member"}
              </button>
            </div>
          </aside>

          <div className="space-y-8">
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
                <p className="text-sm text-gray-400">Family Members</p>
                <h3 className="mt-2 text-3xl font-bold text-[#d4af37]">
                  {members.length}
                </h3>
              </div>

              <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
                <p className="text-sm text-gray-400">Main Person</p>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  {members.some((m) => m.relationship === "Deceased")
                    ? "Added"
                    : "Missing"}
                </h3>
              </div>

              <div className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-5">
                <p className="text-sm text-gray-400">Tree Status</p>
                <h3 className="mt-2 text-xl font-semibold text-green-300">
                  Enabled
                </h3>
              </div>
            </div>

            {pageLoading ? (
              <div className="rounded-3xl border border-[#1f2a44] bg-[#111a2e] p-8 text-center text-gray-300">
                Loading family members...
              </div>
            ) : (
              <>
                {renderSection(
                  "Parents",
                  "Generation Above",
                  parents
                )}

                {renderSection(
                  "Deceased, Spouse, Siblings & In-Laws",
                  "Main Generation",
                  mainLine
                )}

                {renderSection(
                  "Children, Nephews & Nieces",
                  "Next Generation",
                  childrenLine
                )}

                {renderSection(
                  "Grandchildren & Cousins",
                  "Future Branches",
                  grandchildrenLine
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}