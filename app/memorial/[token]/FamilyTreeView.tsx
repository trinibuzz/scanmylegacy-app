"use client";

import { useEffect, useState } from "react";

export default function FamilyTreeView({ token }: { token: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [treeOpen, setTreeOpen] = useState(true);
  const [horizontalOpen, setHorizontalOpen] = useState(true);
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({});
  const [openSpouses, setOpenSpouses] = useState<Record<string, boolean>>({});

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

  const toggleSpouse = (id: number) => {
    setOpenSpouses((prev) => ({
      ...prev,
      [id]: prev[id] === false,
    }));
  };

  const isBranchOpen = (id: number) => openBranches[id] !== false;
  const isSpouseOpen = (id: number) => openSpouses[id] !== false;

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

  const midPoint = Math.ceil(siblings.length / 2);
  const leftSiblings = siblings.slice(0, midPoint);
  const rightSiblings = siblings.slice(midPoint);

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
      className="absolute -bottom-2 left-1/2 z-20 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-[#d4af37]/70 bg-[#0b1320] text-xs text-[#d4af37] shadow-lg"
    >
      {isBranchOpen(id) ? "⌃" : "⌄"}
    </button>
  );

  const SpouseToggle = ({ id }: { id: number }) => (
    <button
      onClick={() => toggleSpouse(id)}
      className="absolute -right-2 top-1/2 z-30 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#d4af37]/70 bg-[#0b1320] text-xs text-[#d4af37] shadow-lg"
    >
      {isSpouseOpen(id) ? "‹" : "›"}
    </button>
  );

  const RowToggle = () => (
    <button
      onClick={() => setHorizontalOpen(!horizontalOpen)}
      className="absolute -right-2 top-1/2 z-30 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#d4af37]/70 bg-[#0b1320] text-xs text-[#d4af37] shadow-lg"
    >
      {horizontalOpen ? "‹" : "›"}
    </button>
  );

  const renderPerson = (m: any, canToggleDown = false) => {
    const isDeceased = m.relationship === "Deceased";

    return (
      <div
        className={`relative z-10 min-w-[130px] rounded-2xl border p-3 pb-5 text-center shadow-xl ${
          isDeceased
            ? "border-[#d4af37] bg-[#24385d] shadow-[0_0_25px_rgba(212,175,55,0.25)]"
            : "border-[#d4af37]/30 bg-[#111a2e]"
        }`}
      >
        {m.photo_url ? (
          <img
            src={m.photo_url}
            alt={m.name}
            className="mx-auto mb-2 h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-[#0b1320] text-2xl">
            👤
          </div>
        )}

        <h3 className="text-xs font-semibold text-white">{m.name}</h3>

        <p className="mt-1 text-[10px] text-[#d4af37]">{m.relationship}</p>

        {canToggleDown && <DownToggle id={m.id} />}
      </div>
    );
  };

  const renderCouple = (person: any, partner?: any, canToggleDown = false) => {
    const spouseVisible = partner && isSpouseOpen(person.id);

    return (
      <div className="relative inline-flex items-center justify-center gap-2">
        <div className="relative">
          {renderPerson(person, canToggleDown)}
          {partner && <SpouseToggle id={person.id} />}
        </div>

        {spouseVisible && (
          <>
            <span className="text-[#d4af37]">—</span>
            {renderPerson(partner)}
          </>
        )}
      </div>
    );
  };

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
      <div className="mt-6 text-center">
        <div className="mx-auto mb-3 h-6 w-px bg-[#d4af37]/40" />

        <p className="mb-3 text-[10px] uppercase tracking-widest text-gray-400">
          {firstLabel}
        </p>

        <div className="flex justify-center gap-3">
          {children.map((child) => {
            const lowerChildren = getChildrenFor(child);

            return (
              <div key={child.id} className="text-center">
                {renderPerson(child, lowerChildren.length > 0)}

                {lowerChildren.length > 0 && isBranchOpen(child.id) && (
                  <div className="mt-6">
                    <div className="mx-auto mb-3 h-6 w-px bg-[#d4af37]/40" />

                    <p className="mb-3 text-[10px] uppercase tracking-widest text-gray-400">
                      {secondLabel}
                    </p>

                    <div className="flex justify-center gap-3">
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
      <div key={sibling.id} className="min-w-[240px] text-center">
        {renderCouple(sibling, spouse, children.length > 0)}
        {renderDescendants(sibling, "Nephews / Nieces", "Cousins")}
      </div>
    );
  };

  if (members.length === 0 || !deceased) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mb-3 text-3xl text-[#d4af37]">⌘</div>

        <h2 className="font-serif text-4xl text-white">Family Lineage</h2>

        <p className="mx-auto mt-3 max-w-xl text-xs italic text-gray-400">
          Honoring the roots and branches of this life.
        </p>
      </div>

      <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-6 shadow-2xl">
        <div className="mb-4 flex justify-start">
          <button
            onClick={() => setTreeOpen(!treeOpen)}
            className="rounded-xl border border-[#d4af37]/40 bg-[#0b1320] px-4 py-2 text-sm text-[#d4af37]"
          >
            {treeOpen ? "Hide Family Tree" : "Show Family Tree"}
          </button>
        </div>

        {treeOpen && (
          <div className="overflow-x-auto">
            <div className={horizontalOpen ? "min-w-max" : "mx-auto w-fit"}>
              <div className="text-center">
                <div className="flex justify-center gap-3">
                  {parents.map((parent) => (
                    <div key={parent.id}>{renderPerson(parent)}</div>
                  ))}
                </div>
              </div>

              <div className="mx-auto h-6 w-px bg-[#d4af37]/40" />

              <div className="relative">
                <div
                  className={
                    horizontalOpen
                      ? "absolute left-0 right-0 top-[70px] h-px bg-[#d4af37]/40"
                      : "absolute left-1/2 top-[70px] h-px w-[180px] -translate-x-1/2 bg-[#d4af37]/40"
                  }
                />

                <div className="relative flex w-fit items-start justify-center gap-4 px-3 py-2">
                  <RowToggle />

                  {horizontalOpen && leftSiblings.map(renderSiblingBranch)}

                  <div className="min-w-[260px] text-center">
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

                  {horizontalOpen && rightSiblings.map(renderSiblingBranch)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}