"use client";

import { useEffect, useState } from "react";

export default function FamilyTreeView({ token }: { token: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [treeOpen, setTreeOpen] = useState(true);
  const [horizontalOpen, setHorizontalOpen] = useState(true);
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
    (m) =>
      m.relationship === "Spouse" &&
      Number(m.spouse_id) === Number(deceased?.id)
  );

  const siblings = members.filter(
    (m) => m.relationship === "Brother" || m.relationship === "Sister"
  );

  const getSpouseFor = (person: any) =>
    members.find(
      (m) =>
        (m.relationship === "Brother-in-law" ||
          m.relationship === "Sister-in-law") &&
        Number(m.spouse_id) === Number(person.id)
    );

  const getChildrenFor = (person: any) =>
    members.filter((m) => Number(m.parent_id) === Number(person.id));

  const DownToggle = ({ id }: { id: number }) => (
    <button
      onClick={() => toggleBranch(id)}
      className="absolute -bottom-5 left-1/2 z-20 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-[#d4af37]/70 bg-[#0b1320] text-[#d4af37] shadow-lg transition hover:bg-[#111a2e]"
      title="Expand or collapse branch"
    >
      {isBranchOpen(id) ? "⌃" : "⌄"}
    </button>
  );

  const SideToggle = () => (
    <button
      onClick={() => setHorizontalOpen(!horizontalOpen)}
      className="absolute -right-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#d4af37]/70 bg-[#0b1320] text-[#d4af37] shadow-lg transition hover:bg-[#111a2e]"
      title="Expand or collapse siblings"
    >
      {horizontalOpen ? "‹" : "›"}
    </button>
  );

  const renderPerson = (m: any, canToggleDown = false) => (
    <div className="relative z-10 min-w-[150px] rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-4 pb-6 text-center shadow-xl">
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

      {canToggleDown && <DownToggle id={m.id} />}
    </div>
  );

  const renderCouple = (person: any, partner?: any, canToggleDown = false) => (
    <div className="relative flex items-center justify-center gap-3">
      {renderPerson(person, canToggleDown)}
      {partner && (
        <>
          <span className="text-[#d4af37]">—</span>
          {renderPerson(partner, false)}
        </>
      )}
    </div>
  );

  const renderDescendants = (
    person: any,
    firstLabel: string,
    secondLabel: string
  ) => {
    const children = getChildrenFor(person);

    if (children.length === 0 || !isBranchOpen(person.id)) {
      return null;
    }

    return (
      <div className="mt-10 text-center">
        <div className="mx-auto mb-4 h-8 w-px bg-[#d4af37]/40" />

        <p className="mb-4 text-xs uppercase tracking-widest text-gray-400">
          {firstLabel}
        </p>

        <div className="flex justify-center gap-6">
          {children.map((child) => {
            const lowerChildren = getChildrenFor(child);

            return (
              <div key={child.id} className="text-center">
                {renderPerson(child, lowerChildren.length > 0)}

                {lowerChildren.length > 0 && isBranchOpen(child.id) && (
                  <div className="mt-10">
                    <div className="mx-auto mb-4 h-8 w-px bg-[#d4af37]/40" />

                    <p className="mb-4 text-xs uppercase tracking-widest text-gray-400">
                      {secondLabel}
                    </p>

                    <div className="flex justify-center gap-4">
                      {lowerChildren.map((lower) => (
                        <div key={lower.id}>{renderPerson(lower)}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSiblingBranch = (sibling: any) => {
    const spouse = getSpouseFor(sibling);
    const children = getChildrenFor(sibling);

    return (
      <div key={sibling.id} className="min-w-[340px] text-center">
        {renderCouple(sibling, spouse, children.length > 0)}
        {renderDescendants(sibling, "Nephews / Nieces", "Cousins")}
      </div>
    );
  };

  if (members.length === 0 || !deceased) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-3xl text-[#d4af37]">
          Family Tree
        </h2>

        <button
          onClick={() => setTreeOpen(!treeOpen)}
          className="rounded border border-[#d4af37] px-4 py-2 text-[#d4af37]"
        >
          {treeOpen ? "⌃ Collapse Tree" : "⌄ Expand Tree"}
        </button>
      </div>

      {treeOpen && (
        <div className="overflow-x-auto rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-6">
          <div className="min-w-[1300px]">
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
              <p className="mb-4 text-center text-sm uppercase tracking-widest text-gray-400">
                Siblings • Deceased • Spouses
              </p>

              <div className="relative">
                <div className="absolute left-10 right-10 top-[86px] h-px bg-[#d4af37]/40" />

                <div className="relative mx-auto flex w-fit items-start justify-center gap-10 rounded-2xl px-8 py-2">
                  <SideToggle />

                  {horizontalOpen && siblings.map(renderSiblingBranch)}

                  <div className="min-w-[360px] text-center">
                    {renderCouple(
                      deceased,
                      deceasedSpouse,
                      getChildrenFor(deceased).length > 0
                    )}

                    {renderDescendants(
                      deceased,
                      "Children",
                      "Grandchildren"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}