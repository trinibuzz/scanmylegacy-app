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

  const spouse = members.find(
    (m) => m.relationship === "Spouse" && m.spouse_id === deceased?.id
  );

  const siblings = members.filter(
    (m) => m.relationship === "Brother" || m.relationship === "Sister"
  );

  const children = members.filter(
    (m) => m.relationship === "Son" || m.relationship === "Daughter"
  );

  const grandchildren = members.filter(
    (m) => m.relationship === "Grandson" || m.relationship === "Granddaughter"
  );

  const getSpouseFor = (person: any) =>
    members.find((m) => m.relationship === "Sibling Spouse" && m.spouse_id === person.id);

  const getChildrenFor = (person: any) =>
    members.filter((m) => Number(m.parent_id) === Number(person.id));

  const renderPerson = (m: any) => (
    <div className="min-w-[160px] rounded-2xl border border-[#d4af37]/30 bg-[#111a2e] p-4 text-center">
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

  if (members.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-3xl text-[#d4af37]">Family Tree</h2>

        <button
          onClick={() => setOpen(!open)}
          className="rounded border border-[#d4af37] px-4 py-2 text-[#d4af37]"
        >
          {open ? "Collapse Tree" : "Expand Tree"}
        </button>
      </div>

      {open && (
        <div className="overflow-x-auto rounded-2xl border border-[#1f2a44] bg-[#0b1320] p-6">
          <div className="min-w-[900px] space-y-10">
            <div>
              <p className="mb-4 text-center text-sm uppercase tracking-widest text-gray-400">
                Parents
              </p>

              <div className="flex justify-center gap-4">
                {parents.map((p) => (
                  <div key={p.id}>{renderPerson(p)}</div>
                ))}
              </div>
            </div>

            <div className="mx-auto h-8 w-px bg-[#d4af37]/40" />

            <div>
              <p className="mb-4 text-center text-sm uppercase tracking-widest text-gray-400">
                Deceased • Spouse • Siblings
              </p>

              <div className="flex items-start justify-center gap-8">
                {deceased && (
                  <div className="text-center">
                    {renderCouple(deceased, spouse)}

                    <button
                      onClick={() => toggleBranch(deceased.id)}
                      className="mt-3 rounded border border-[#d4af37]/50 px-3 py-1 text-xs text-[#d4af37]"
                    >
                      {isBranchOpen(deceased.id) ? "Hide Children" : "Show Children"}
                    </button>

                    {isBranchOpen(deceased.id) && children.length > 0 && (
                      <div className="mt-6">
                        <div className="mx-auto mb-4 h-8 w-px bg-[#d4af37]/40" />

                        <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
                          Children
                        </p>

                        <div className="flex justify-center gap-4">
                          {children.map((child) => (
                            <div key={child.id} className="text-center">
                              {renderPerson(child)}

                              {getChildrenFor(child).length > 0 && (
                                <>
                                  <button
                                    onClick={() => toggleBranch(child.id)}
                                    className="mt-3 rounded border border-[#d4af37]/50 px-3 py-1 text-xs text-[#d4af37]"
                                  >
                                    {isBranchOpen(child.id)
                                      ? "Hide Grandchildren"
                                      : "Show Grandchildren"}
                                  </button>

                                  {isBranchOpen(child.id) && (
                                    <div className="mt-5">
                                      <div className="mx-auto mb-3 h-6 w-px bg-[#d4af37]/40" />

                                      <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
                                        Grandchildren
                                      </p>

                                      <div className="flex justify-center gap-3">
                                        {getChildrenFor(child).map((gc) => (
                                          <div key={gc.id}>{renderPerson(gc)}</div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {siblings.map((sibling) => {
                  const siblingSpouse = getSpouseFor(sibling);
                  const niecesNephews = getChildrenFor(sibling);

                  return (
                    <div key={sibling.id} className="text-center">
                      {renderCouple(sibling, siblingSpouse)}

                      {niecesNephews.length > 0 && (
                        <>
                          <button
                            onClick={() => toggleBranch(sibling.id)}
                            className="mt-3 rounded border border-[#d4af37]/50 px-3 py-1 text-xs text-[#d4af37]"
                          >
                            {isBranchOpen(sibling.id)
                              ? "Hide Branch"
                              : "Show Branch"}
                          </button>

                          {isBranchOpen(sibling.id) && (
                            <div className="mt-6">
                              <div className="mx-auto mb-4 h-8 w-px bg-[#d4af37]/40" />

                              <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
                                Nephews / Nieces
                              </p>

                              <div className="flex justify-center gap-4">
                                {niecesNephews.map((child) => (
                                  <div key={child.id} className="text-center">
                                    {renderPerson(child)}

                                    {getChildrenFor(child).length > 0 && (
                                      <>
                                        <button
                                          onClick={() => toggleBranch(child.id)}
                                          className="mt-3 rounded border border-[#d4af37]/50 px-3 py-1 text-xs text-[#d4af37]"
                                        >
                                          {isBranchOpen(child.id)
                                            ? "Hide Cousins"
                                            : "Show Cousins"}
                                        </button>

                                        {isBranchOpen(child.id) && (
                                          <div className="mt-5">
                                            <div className="mx-auto mb-3 h-6 w-px bg-[#d4af37]/40" />

                                            <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
                                              Cousins
                                            </p>

                                            <div className="flex justify-center gap-3">
                                              {getChildrenFor(child).map((cousin) => (
                                                <div key={cousin.id}>
                                                  {renderPerson(cousin)}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}