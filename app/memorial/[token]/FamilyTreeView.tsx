"use client";

import { useEffect, useState } from "react";

export default function FamilyTreeView({ token }: { token: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    fetch(`/api/public-family-tree?token=${token}`)
      .then((res) => res.json())
      .then((data) => setMembers(data.members || []));
  }, [token]);

  const byGeneration = (gen: number) =>
    members.filter((m) => Number(m.generation) === gen);

  const renderPerson = (m: any) => (
    <div
      key={m.id}
      className="min-w-[180px] rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-4 text-center"
    >
      {m.photo_url ? (
        <img
          src={m.photo_url}
          alt={m.name}
          className="mx-auto mb-3 h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-[#0b1320] text-3xl">
          👤
        </div>
      )}

      <h3 className="font-semibold">{m.name}</h3>
      <p className="text-sm text-[#d4af37]">{m.relationship}</p>
    </div>
  );

  if (members.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-3xl text-[#d4af37]">
          Family Tree
        </h2>

        <button
          onClick={() => setOpen(!open)}
          className="rounded border border-[#d4af37] px-4 py-2 text-[#d4af37]"
        >
          {open ? "Collapse Tree" : "Expand Tree"}
        </button>
      </div>

      {open && (
        <div className="space-y-10 overflow-x-auto rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-6">
          <div>
            <p className="mb-4 text-center text-sm uppercase tracking-widest text-gray-400">
              Grandparents
            </p>
            <div className="flex justify-center gap-4">
              {byGeneration(-2).map(renderPerson)}
            </div>
          </div>

          <div className="mx-auto h-8 w-px bg-[#d4af37]/40" />

          <div>
            <p className="mb-4 text-center text-sm uppercase tracking-widest text-gray-400">
              Parents
            </p>
            <div className="flex justify-center gap-4">
              {byGeneration(-1).map(renderPerson)}
            </div>
          </div>

          <div className="mx-auto h-8 w-px bg-[#d4af37]/40" />

          <div>
            <p className="mb-4 text-center text-sm uppercase tracking-widest text-gray-400">
              Deceased, Spouse & Siblings
            </p>
            <div className="flex justify-center gap-4">
              {byGeneration(0).map(renderPerson)}
            </div>
          </div>

          <div className="mx-auto h-8 w-px bg-[#d4af37]/40" />

          <div>
            <p className="mb-4 text-center text-sm uppercase tracking-widest text-gray-400">
              Children / Nieces / Nephews
            </p>
            <div className="flex justify-center gap-4">
              {byGeneration(1).map(renderPerson)}
            </div>
          </div>

          <div className="mx-auto h-8 w-px bg-[#d4af37]/40" />

          <div>
            <p className="mb-4 text-center text-sm uppercase tracking-widest text-gray-400">
              Grandchildren
            </p>
            <div className="flex justify-center gap-4">
              {byGeneration(2).map(renderPerson)}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}