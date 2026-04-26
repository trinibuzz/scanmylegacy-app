"use client";

import { useEffect, useState } from "react";

export default function FamilyTreeManager({ params }: any) {
  const memorialId = params.id;

  const [members, setMembers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [parentId, setParentId] = useState("");
  const [spouseId, setSpouseId] = useState("");
  const [generation, setGeneration] = useState("0");
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

  const addMember = async () => {
    const formData = new FormData();

    formData.append("memorial_id", memorialId);
    formData.append("name", name);
    formData.append("relationship", relationship);
    formData.append("parent_id", parentId);
    formData.append("spouse_id", spouseId);
    formData.append("generation", generation);
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
    setGeneration("0");
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

  const generationLabel = (gen: number) => {
    if (gen === -2) return "Grandparents";
    if (gen === -1) return "Parents";
    if (gen === 0) return "Deceased / Spouse / Siblings";
    if (gen === 1) return "Children / Nieces / Nephews";
    if (gen === 2) return "Grandchildren";
    return `Generation ${gen}`;
  };

  return (
    <main className="min-h-screen bg-[#0b1320] p-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl text-[#d4af37]">
              Family Tree Manager
            </h1>
            <p className="mt-2 text-gray-400">
              Add up to 5 generations and connect parents, spouses, siblings,
              children, and grandchildren.
            </p>
          </div>

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
              onChange={(e) => setRelationship(e.target.value)}
            >
              <option value="">Relationship</option>
              <option value="Deceased">Deceased</option>
              <option value="Spouse">Spouse</option>
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Grandmother">Grandmother</option>
              <option value="Grandfather">Grandfather</option>
              <option value="Sister">Sister</option>
              <option value="Brother">Brother</option>
              <option value="Daughter">Daughter</option>
              <option value="Son">Son</option>
              <option value="Granddaughter">Granddaughter</option>
              <option value="Grandson">Grandson</option>
              <option value="Niece">Niece</option>
              <option value="Nephew">Nephew</option>
              <option value="Other">Other</option>
            </select>

            <select
              className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
              value={generation}
              onChange={(e) => setGeneration(e.target.value)}
            >
              <option value="-2">Grandparents</option>
              <option value="-1">Parents</option>
              <option value="0">Deceased / Spouse / Siblings</option>
              <option value="1">Children / Nieces / Nephews</option>
              <option value="2">Grandchildren</option>
            </select>

            <select
              className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">Select Parent / Branch</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.relationship})
                </option>
              ))}
            </select>

            <select
              className="rounded border border-[#2a3550] bg-[#0b1320] p-3"
              value={spouseId}
              onChange={(e) => setSpouseId(e.target.value)}
            >
              <option value="">Select Spouse</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.relationship})
                </option>
              ))}
            </select>

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
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </div>

          <button
            onClick={addMember}
            className="mt-6 w-full rounded bg-[#d4af37] py-3 font-semibold text-black"
          >
            Add Family Member
          </button>
        </section>

        <section>
          <h2 className="mb-6 font-serif text-3xl">
            Current Family Members
          </h2>

          {members.length === 0 ? (
            <p className="text-gray-400">
              No family members added yet.
            </p>
          ) : (
            <div className="space-y-8">
              {[-2, -1, 0, 1, 2].map((gen) => {
                const genMembers = members.filter(
                  (m) => Number(m.generation) === gen
                );

                if (genMembers.length === 0) return null;

                return (
                  <div key={gen}>
                    <h3 className="mb-4 text-xl text-[#d4af37]">
                      {generationLabel(gen)}
                    </h3>

                    <div className="grid gap-4 md:grid-cols-3">
                      {genMembers.map((m) => {
                        const parent = members.find(
                          (p) => p.id === m.parent_id
                        );
                        const spouse = members.find(
                          (s) => s.id === m.spouse_id
                        );

                        return (
                          <div
                            key={m.id}
                            className="rounded-2xl border border-[#1f2a44] bg-[#111a2e] p-4"
                          >
                            {m.photo_url && (
                              <img
                                src={m.photo_url}
                                alt={m.name}
                                className="mb-4 h-40 w-full rounded-xl object-cover"
                              />
                            )}

                            <h4 className="text-lg font-semibold">
                              {m.name}
                            </h4>

                            <p className="text-sm text-[#d4af37]">
                              {m.relationship || "Family Member"}
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

                            {parent && (
                              <p className="mt-2 text-sm text-gray-400">
                                Parent/Branch: {parent.name}
                              </p>
                            )}

                            {spouse && (
                              <p className="text-sm text-gray-400">
                                Spouse: {spouse.name}
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
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}