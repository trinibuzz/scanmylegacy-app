"use client";

import { useEffect, useMemo, useState } from "react";

export default function FamilyTreeManager({ params }: any) {
  const memorialId = params.id;

  const [members, setMembers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [parentId, setParentId] = useState("");
  const [spouseId, setSpouseId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const loadMembers = async () => {
    const res = await fetch(`/api/family-tree?memorial_id=${memorialId}`);
    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    setMembers(data.members || []);
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
      rel === "Sibling Spouse"
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
    "Sibling Spouse",
  ].includes(relationship);

  const parentOptions = useMemo(() => {
    if (
      relationship === "Son" ||
      relationship === "Daughter"
    ) {
      return members.filter(
        (m) =>
          m.relationship === "Deceased" ||
          m.relationship === "Spouse"
      );
    }

    if (
      relationship === "Nephew" ||
      relationship === "Niece"
    ) {
      return members.filter(
        (m) =>
          m.relationship === "Brother" ||
          m.relationship === "Sister"
      );
    }

    if (
      relationship === "Grandson" ||
      relationship === "Granddaughter"
    ) {
      return members.filter(
        (m) =>
          m.relationship === "Son" ||
          m.relationship === "Daughter"
      );
    }

    if (relationship === "Cousin") {
      return members.filter(
        (m) =>
          m.relationship === "Nephew" ||
          m.relationship === "Niece"
      );
    }

    return members;
  }, [members, relationship]);

  const spouseOptions = useMemo(() => {
    if (relationship === "Spouse") {
      return members.filter(
        (m) => m.relationship === "Deceased"
      );
    }

    if (relationship === "Sibling Spouse") {
      return members.filter(
        (m) =>
          m.relationship === "Brother" ||
          m.relationship === "Sister"
      );
    }

    return members;
  }, [members, relationship]);

  const addMember = async () => {
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }

    if (!relationship) {
      alert("Please choose a relationship");
      return;
    }

    if (needsParentBranch && !parentId) {
      alert("Please choose a parent branch");
      return;
    }

    if (needsSpouseLink && !spouseId) {
      alert("Please choose who this spouse belongs to");
      return;
    }

    const formData = new FormData();

    formData.append("memorial_id", memorialId);
    formData.append("name", name);
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
      alert(data.error);
      return;
    }

    setName("");
    setRelationship("");
    setParentId("");
    setSpouseId("");
    setBirthDate("");
    setDeathDate("");
    setPhoto(null);

    await loadMembers();
  };

  const deleteMember = async (id: number) => {
    const yes = confirm("Delete this family member?");

    if (!yes) return;

    const res = await fetch(
      `/api/family-tree?id=${id}&memorial_id=${memorialId}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    await loadMembers();
  };

  const getParentName = (id: number | null) => {
    const found = members.find((m) => m.id === id);
    return found ? found.name : "";
  };

  const getSpouseName = (id: number | null) => {
    const found = members.find((m) => m.id === id);
    return found ? found.name : "";
  };

  const parents = members.filter(
    (m) =>
      m.relationship === "Mother" ||
      m.relationship === "Father"
  );

  const mainLine = members.filter(
    (m) =>
      m.relationship === "Deceased" ||
      m.relationship === "Spouse" ||
      m.relationship === "Brother" ||
      m.relationship === "Sister" ||
      m.relationship === "Sibling Spouse"
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

  const renderMemberCard = (m: any) => (
    <div
      key={m.id}
      className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-4"
    >
      {m.photo_url ? (
        <img
          src={m.photo_url}
          alt={m.name}
          className="mb-4 h-36 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="mb-4 flex h-36 w-full items-center justify-center rounded-xl bg-[#0b1320] text-4xl">
          👤
        </div>
      )}

      <h4 className="text-lg font-semibold">{m.name}</h4>

      <p className="text-sm text-[#d4af37]">
        {m.relationship}
      </p>

      <p className="mt-2 text-sm text-gray-400">
        {m.birth_date
          ? new Date(m.birth_date).toLocaleDateString()
          : ""}
        {m.death_date ? " — " : ""}
        {m.death_date
          ? new Date(m.death_date).toLocaleDateString()
          : ""}
      </p>

      {m.parent_id && (
        <p className="mt-2 text-sm text-gray-400">
          Parent: {getParentName(m.parent_id)}
        </p>
      )}

      {m.spouse_id && (
        <p className="text-sm text-gray-400">
          Spouse Of: {getSpouseName(m.spouse_id)}
        </p>
      )}

      <button
        onClick={() => deleteMember(m.id)}
        className="mt-4 rounded bg-red-600 px-4 py-2 text-sm"
      >
        Delete
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0b1320] p-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-4xl text-[#d4af37]">
            Family Tree Manager
          </h1>

          <a
            href={`/admin/memorial/${memorialId}`}
            className="rounded border border-[#d4af37] px-4 py-2 text-[#d4af37]"
          >
            Back to Admin
          </a>
        </div>

        <section className="mb-10 rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-6">
          <h2 className="mb-6 font-serif text-2xl text-[#d4af37]">
            Add Family Member
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <select
              className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
              value={relationship}
              onChange={(e) => {
                setRelationship(e.target.value);
                setParentId("");
                setSpouseId("");
              }}
            >
              <option value="">Choose Relationship</option>
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Deceased">Deceased</option>
              <option value="Spouse">Spouse</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Sibling Spouse">Sibling Spouse</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Nephew">Nephew</option>
              <option value="Niece">Niece</option>
              <option value="Grandson">Grandson</option>
              <option value="Granddaughter">Granddaughter</option>
              <option value="Cousin">Cousin</option>
            </select>

            {needsParentBranch && (
              <select
                className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">Choose Parent Branch</option>

                {parentOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship})
                  </option>
                ))}
              </select>
            )}

            {needsSpouseLink && (
              <select
                className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
                value={spouseId}
                onChange={(e) => setSpouseId(e.target.value)}
              >
                <option value="">Choose Spouse Link</option>

                {spouseOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship})
                  </option>
                ))}
              </select>
            )}

            <input
              type="date"
              className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />

            <input
              type="date"
              className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
              value={deathDate}
              onChange={(e) => setDeathDate(e.target.value)}
            />

            <input
              type="file"
              accept="image/*"
              className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
              onChange={(e) =>
                setPhoto(e.target.files?.[0] || null)
              }
            />
          </div>

          <button
            onClick={addMember}
            className="mt-6 w-full rounded bg-[#d4af37] py-3 font-semibold text-black"
          >
            Add Family Member
          </button>
        </section>

        <section className="space-y-10">
          <div>
            <h3 className="mb-4 text-xl text-[#d4af37]">
              Parents
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              {parents.map(renderMemberCard)}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xl text-[#d4af37]">
              Deceased • Spouse • Siblings • Siblings’ Spouses
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              {mainLine.map(renderMemberCard)}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xl text-[#d4af37]">
              Children • Nephews • Nieces
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              {childrenLine.map(renderMemberCard)}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-xl text-[#d4af37]">
              Grandchildren • Cousins
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              {grandchildrenLine.map(renderMemberCard)}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}