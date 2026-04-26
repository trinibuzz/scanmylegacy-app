"use client";

import { useEffect, useState } from "react";

export default function FamilyTreeView({ token }: { token: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [open, setOpen] = useState(true);
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/public-family-tree?token=${token}`)
      .then((res) => res.json())
      .then((data) => setMembers(data.members || []));
  }, [token]);

  const toggleBranch = (id: number) => {
    setOpenBranches((prev) => ({
      ...prev,
      [id]: prev[id] === false,
    }));
  };

  const isBranchOpen = (id: number) => openBranches[id] !== false;

  const parents = members.filter(
    (m) => m.relationship === "Mother" || m.relationship === "Father"
  );

  const deceased = members.find((m) => m.relationship === "Deceased");

  const deceasedSpouse = members.find(
    (m) => m.relationship === "Spouse" && Number(m.spouse_id) === Number(deceased?.id)
  );

  const siblings = members.filter(
    (m) => m.relationship === "Brother" || m.relationship === "Sister"
  );

  const leftSiblings = siblings.filter((_, index) => index % 2 === 0);
  const rightSiblings = siblings.filter((_, index) => index % 2 !== 0);

  const getSpouseFor = (person: any) =>
    members.find(
      (m) =>
        m.relationship === "Sibling Spouse" &&
        Number(m.spouse_id) === Number(person.id)
    );

  const getChildrenFor = (person: any) =>
    members.filter((m) => Number(m.parent_id) === Number(person.id));

  const renderPerson = (m: any) => (
    <div className="relative z-10 min-w-[150px] rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-4 text-center shadow-xl">
      {m.photo_url ? (
        <img
          src={m.photo_url}
          alt={m.name}
          className="mx-auto mb-3 h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[#0b1320] text-3xl">
          👤
        </div>
      )}

      <h3 className="text-sm font-semibold">{m.name}</h3>
      <p className="text-xs text-[#d4af37]">{m.relationship}</p>
    </div>
  );

  const renderCouple = (person: any, partner?: any) => (
    <div className="flex items-center justify-center gap-3">
      {renderPerson(person)}
      {partner && (
        <>
          <span className="text-[#d4af37]">—</span>
          {renderPerson(partner)}
        </>
      )}
    </div>
  );

  const renderArrow = (id: number, label: string) => (
    <button
      onClick={() => toggleBranch(id)}
      className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d4af37]/50 px-3 py-1 text-xs text-[#d4af37]"
    >
      <span>{isBranchOpen(id) ? "▼" : "▶"}</span>
      <span>{label}</span>
    </button>
  );

  const renderDescendants = (
    person: any,
    label: string,
    lowerLabel: string
  ) => {
    const children = getChildrenFor(person);

    if (children.length === 0) return null;

    return (
      <div className="mt-6 text-center">
        {renderArrow(person.id, label)}

        {isBranchOpen(person.id) && (
          <div className="mt-5">
            <div className="mx-auto mb-4 h-8 w-px bg-[#d4af37]/40" />

            <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
              {label}
            </p>

            <div className="flex justify-center gap-4">
              {children.map((child) => {
                const lowerChildren = getChildrenFor(child);

                return (
                  <div key={child.id} className="text-center">
                    {renderPerson(child)}

                    {lowerChildren.length > 0 && (
                      <div className="mt-4">
                        {renderArrow(child.id, lowerLabel)}

                        {isBranchOpen(child.id) && (
                          <div className="mt-5">
                            <div className="mx-auto mb-4 h-6 w-px bg-[#d4af37]/40" />

                            <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
                              {lowerLabel}
                            </p>

                            <div className="flex justify-center gap-3">
                              {lowerChildren.map((lower) => (
                                <div key={lower.id}>{renderPerson(lower)}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSiblingBranch = (sibling: any) => {
    const spouse = getSpouseFor(sibling);

    return (
      <div key={sibling.id} className="min-w-[340px] text-center">
        {renderCouple(sibling, spouse)}
        {renderDescendants(sibling, "Nephews / Nieces", "Cousins")}
      </div>
    );
  };

  if (members.length === 0 || !deceased) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-3xl text-[#d4af37]">Family Tree</h2>

        <button
          onClick={() => setOpen(!open)}
          className="rounded border border-[#d4af37] px-4 py-2 text-[#d4af37]"
        >
          {open ? "▼ Collapse Tree" : "▶ Expand Tree"}
        </button>
      </div>

      {open && (
        <div className="overflow-x-auto rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-6">
          <div className="min-w-[1100px]">
            <div className="text-center">
              <p className="mb-4 text-sm uppercase tracking-widest text-gray-400">
                Parents
              </p>

              <div className="flex justify-center gap-4">
                {parents.map((p) => (
                  <div key={p.id}>{renderPerson(p)}</div>
                ))}
              </div>
            </div>

            <div className="mx-auto h-10 w-px bg-[#d4af37]/40" />

            <div className="relative">
              <div className="absolute left-16 right-16 top-[85px] h-px bg-[#d4af37]/40" />

              <div className="grid grid-cols-3 items-start gap-10">
                <div className="flex flex-col items-end gap-10">
                  {leftSiblings.map(renderSiblingBranch)}
                </div>

                <div className="text-center">
                  <p className="mb-4 text-sm uppercase tracking-widest text-gray-400">
                    Deceased / Spouse
                  </p>

                  {renderCouple(deceased, deceasedSpouse)}

                  {renderDescendants(deceased, "Children", "Grandchildren")}
                </div>

                <div className="flex flex-col items-start gap-10">
                  {rightSiblings.map(renderSiblingBranch)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}