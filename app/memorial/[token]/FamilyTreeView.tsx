"use client";

import { useEffect, useState } from "react";

export default function FamilyTreeView({ token }: { token: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [treeOpen, setTreeOpen] = useState(true);

  useEffect(() => {
    fetch(`/api/public-family-tree?token=${token}`)
      .then((res) => res.json())
      .then((data) => setMembers(data.members || []));
  }, [token]);

  const parents = members.filter(
    (m) => m.relationship === "Mother" || m.relationship === "Father"
  );

  const deceased = members.find((m) => m.relationship === "Deceased");

  const spouse = members.find(
    (m) =>
      m.relationship === "Spouse" &&
      Number(m.spouse_id) === Number(deceased?.id)
  );

  const siblings = members.filter(
    (m) => m.relationship === "Brother" || m.relationship === "Sister"
  );

  const children = members.filter(
    (m) => Number(m.parent_id) === Number(deceased?.id)
  );

  if (!deceased) return null;

  const renderPerson = (person: any, highlight = false) => (
    <div
      className={`min-w-[150px] rounded-2xl border p-4 text-center shadow-xl ${
        highlight
          ? "border-[#d4af37] bg-[#111a2e]"
          : "border-[#d4af37]/30 bg-[#111a2e]"
      }`}
    >
      {person.photo_url ? (
        <img
          src={person.photo_url}
          alt={person.name}
          className="mx-auto mb-3 h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#0b1320] text-3xl">
          👤
        </div>
      )}

      <h3 className="text-sm font-semibold text-white">{person.name}</h3>

      <p className="mt-1 text-xs text-[#d4af37]">
        {person.relationship}
      </p>
    </div>
  );

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 text-center">
        <div className="mb-4 text-4xl text-[#d4af37]">⌘</div>

        <h2 className="font-serif text-5xl text-white">
          Family Lineage
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm italic text-gray-400">
          Honoring the roots and branches of this life.
          Explore the generations that came before and those that follow.
        </p>
      </div>

      <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-8 shadow-2xl">
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => setTreeOpen(!treeOpen)}
            className="rounded-xl border border-[#d4af37]/40 bg-[#0b1320] px-4 py-2 text-sm text-[#d4af37]"
          >
            {treeOpen ? "Hide Family Tree" : "Show Family Tree"}
          </button>
        </div>

        {treeOpen && (
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Parents */}
              {parents.length > 0 && (
                <>
                  <div className="mb-8 flex justify-center gap-8">
                    {parents.map((parent) => (
                      <div key={parent.id}>
                        {renderPerson(parent)}
                      </div>
                    ))}
                  </div>

                  <div className="mx-auto mb-8 h-10 w-px bg-[#d4af37]/30" />
                </>
              )}

              {/* Siblings + Deceased */}
              <div className="relative mb-10 flex items-center justify-center gap-8">
                {siblings.map((sibling) => (
                  <div key={sibling.id}>
                    {renderPerson(sibling)}
                  </div>
                ))}

                <div>{renderPerson(deceased, true)}</div>

                {spouse && <div>{renderPerson(spouse)}</div>}
              </div>

              {/* Children */}
              {children.length > 0 && (
                <>
                  <div className="mx-auto mb-8 h-10 w-px bg-[#d4af37]/30" />

                  <div className="flex justify-center gap-8">
                    {children.map((child) => (
                      <div key={child.id}>
                        {renderPerson(child)}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}