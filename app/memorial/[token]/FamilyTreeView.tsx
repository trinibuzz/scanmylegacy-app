"use client";

import { useEffect, useState } from "react";

export default function FamilyTreeView({ token }: { token: string }) {
  const [members, setMembers] = useState<any[]>([]);
  const [pageType, setPageType] = useState<"living" | "memorial">("memorial");
  const [loading, setLoading] = useState(true);
  const [treeOpen, setTreeOpen] = useState(true);
  const [horizontalOpen, setHorizontalOpen] = useState(true);
  const [openBranches, setOpenBranches] = useState<Record<string, boolean>>({});
  const [openSpouses, setOpenSpouses] = useState<Record<string, boolean>>({});

  const isLivingLegacy = pageType === "living";


  const mainPersonLabel = isLivingLegacy ? "Main Person" : "Deceased";
  const mainTitle = isLivingLegacy ? "Family Legacy" : "Family Lineage";
  const mainSubtitle = isLivingLegacy
    ? "Honoring the roots, branches, and living legacy of this family."
    : "Honoring the roots and branches of this life.";

  const emptyDescription = isLivingLegacy
    ? "This Living Legacy page has family tree access enabled, but no family members have been added yet. The page owner can build the family tree from the dashboard."
    : "This memorial has family tree access enabled, but no family members have been added yet. The memorial owner can build the family tree from the dashboard.";

  const safeMediaPath = (pathValue: any) => {
    if (!pathValue) return "";

    let cleanPath = String(pathValue).trim();
    cleanPath = cleanPath.replace(/\\/g, "/");

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    cleanPath = cleanPath.replace(/^public\//, "");
    cleanPath = cleanPath.replace(/^\/public\//, "/");

    if (!cleanPath.startsWith("/")) {
      cleanPath = `/${cleanPath}`;
    }

    return encodeURI(cleanPath);
  };

  const displayRelationship = (relationship: string) => {
    if (isLivingLegacy && relationship === "Deceased") return "Main Person";
    if (isLivingLegacy && relationship === "Spouse") {
      return "Spouse of Main Person";
    }
    if (!isLivingLegacy && relationship === "Spouse") {
      return "Spouse of Deceased";
    }

    return relationship;
  };

  useEffect(() => {
    const loadFamilyTree = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/public-family-tree?token=${token}`);
        const data = await res.json();

        setMembers(data.members || []);

        const incomingPageType =
          data?.memorial?.page_type ||
          data?.page_type ||
          data?.memorial?.legacy_type ||
          "";

        if (
          incomingPageType === "living" ||
          incomingPageType === "living_legacy" ||
          incomingPageType === "living-legacy"
        ) {
          setPageType("living");
        } else {
          setPageType("memorial");
        }
      } catch {
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    loadFamilyTree();
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

  const mainPerson = members.find((m) => m.relationship === "Deceased");

  const mainPersonSpouse = members.find(
    (m) =>
      m.relationship === "Spouse" &&
      Number(m.spouse_id) === Number(mainPerson?.id)
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
      className="absolute -bottom-3 left-1/2 z-20 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-[#d4af37]/70 bg-[#0b1320] text-xs text-[#d4af37] shadow-lg transition hover:bg-[#d4af37] hover:text-[#0b1320]"
      aria-label="Toggle branch"
    >
      {isBranchOpen(id) ? "⌃" : "⌄"}
    </button>
  );

  const SpouseToggle = ({ id }: { id: number }) => (
    <button
      onClick={() => toggleSpouse(id)}
      className="absolute -right-3 top-1/2 z-30 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#d4af37]/70 bg-[#0b1320] text-xs text-[#d4af37] shadow-lg transition hover:bg-[#d4af37] hover:text-[#0b1320]"
      aria-label="Toggle spouse"
    >
      {isSpouseOpen(id) ? "‹" : "›"}
    </button>
  );

  const RowToggle = () => (
    <button
      onClick={() => setHorizontalOpen(!horizontalOpen)}
      className="absolute -right-3 top-1/2 z-30 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[#d4af37]/70 bg-[#0b1320] text-xs text-[#d4af37] shadow-lg transition hover:bg-[#d4af37] hover:text-[#0b1320]"
      aria-label="Toggle sibling row"
    >
      {horizontalOpen ? "‹" : "›"}
    </button>
  );

  const renderPerson = (m: any, canToggleDown = false) => {
    const isMainPerson = m.relationship === "Deceased";

    return (
      <div
        className={`relative z-10 min-w-[140px] rounded-2xl border p-4 pb-6 text-center shadow-xl ${
          isMainPerson
            ? "border-[#d4af37] bg-[#24385d] shadow-[0_0_30px_rgba(212,175,55,0.28)]"
            : "border-[#d4af37]/30 bg-[#111a2e]"
        }`}
      >
        {m.photo_url ? (
          <img
            src={safeMediaPath(m.photo_url)}
            alt={m.name}
            className="mx-auto mb-3 h-16 w-16 rounded-full border border-[#d4af37]/30 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-[#d4af37]/20 bg-[#0b1320] text-2xl">
            {isMainPerson ? (isLivingLegacy ? "✍️" : "🕊️") : "👤"}
          </div>
        )}

        <h3 className="text-xs font-semibold text-white">{m.name}</h3>

        <p className="mt-1 text-[10px] font-semibold text-[#d4af37]">
          {displayRelationship(m.relationship)}
        </p>

        {canToggleDown && <DownToggle id={m.id} />}
      </div>
    );
  };

  const renderCouple = (person: any, partner?: any, canToggleDown = false) => {
    const spouseVisible = partner && isSpouseOpen(person.id);

    return (
      <div className="relative inline-flex items-center justify-center gap-3">
        <div className="relative">
          {renderPerson(person, canToggleDown)}
          {partner && <SpouseToggle id={person.id} />}
        </div>

        {spouseVisible && (
          <>
            <span className="text-[#d4af37]/70">—</span>
            {renderPerson(partner)}
          </>
        )}
      </div>
    );
  };

  const renderDescendants = (person: any) => {
    const children = getChildrenFor(person);

    if (children.length === 0 || !isBranchOpen(person.id)) {
      return null;
    }

    return (
      <div className="mt-8 text-center">
        <div className="mx-auto mb-4 h-7 w-px bg-[#d4af37]/40" />

        <div className="inline-flex min-w-max justify-center gap-4">
          {children.map((child) => {
            const lowerChildren = getChildrenFor(child);

            return (
              <div key={child.id} className="text-center">
                {renderPerson(child, lowerChildren.length > 0)}

                {lowerChildren.length > 0 && isBranchOpen(child.id) && (
                  <div className="mt-8">
                    <div className="mx-auto mb-4 h-7 w-px bg-[#d4af37]/40" />

                    <div className="inline-flex min-w-max justify-center gap-4">
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
      <div key={sibling.id} className="min-w-[230px] text-center">
        {renderCouple(sibling, spouse, children.length > 0)}
        {renderDescendants(sibling)}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-8 text-center shadow-2xl">
          <p className="text-[#d4af37]">Loading family tree...</p>
        </div>
      </section>
    );
  }

  if (members.length === 0 || !mainPerson) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-8 text-center shadow-2xl">
          <div className="mb-4 text-5xl">🌳</div>

          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
            Family Tree
          </p>

          <h2 className="font-serif text-3xl text-white md:text-4xl">
            Family Tree Coming Soon
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-gray-300">
            {emptyDescription}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="mb-8 text-center">
        <div className="mb-3 text-3xl text-[#d4af37]">⌘</div>

        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d4af37]">
          Family Tree
        </p>

        <h2 className="font-serif text-4xl text-white">{mainTitle}</h2>

        <p className="mx-auto mt-3 max-w-xl text-xs italic text-gray-400">
          {mainSubtitle}
        </p>
      </div>

      <div className="rounded-3xl border border-[#d4af37]/20 bg-[#111a2e] p-4 shadow-2xl sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setTreeOpen(!treeOpen)}
            className="rounded-xl border border-[#d4af37]/40 bg-[#0b1320] px-4 py-2 text-sm text-[#d4af37] transition hover:bg-[#d4af37] hover:text-[#0b1320]"
          >
            {treeOpen ? "Hide Family Tree" : "Show Family Tree"}
          </button>

          <div className="rounded-full border border-[#d4af37]/20 bg-[#0b1320] px-4 py-2 text-xs text-gray-300">
            {mainPersonLabel}:{" "}
            <span className="font-semibold text-[#d4af37]">
              {mainPerson.name}
            </span>
          </div>
        </div>

        {treeOpen && (
          <div className="rounded-2xl border border-[#d4af37]/10 bg-[#0b1320]/35 p-3 sm:p-4">
            <p className="mb-3 text-center text-xs text-gray-400 md:hidden">
              Swipe left or right to explore the full family tree.
            </p>

            <div className="max-w-full overflow-x-auto overflow-y-visible overscroll-x-contain rounded-2xl px-2 py-8 [-webkit-overflow-scrolling:touch] sm:px-4">
              <div className="inline-flex min-w-full justify-start md:justify-center">
                <div className="inline-block min-w-max px-6 sm:px-8 md:px-0">
                {parents.length > 0 && (
                  <>
                    <div className="text-center">
                      <div className="inline-flex min-w-max justify-center gap-4">
                        {parents.map((parent) => (
                          <div key={parent.id}>{renderPerson(parent)}</div>
                        ))}
                      </div>
                    </div>

                    <div className="mx-auto h-8 w-px bg-[#d4af37]/40" />
                  </>
                )}

                <div className="relative mx-auto">
                  <div
                    className={
                      horizontalOpen
                        ? "absolute left-[8%] right-[8%] top-[76px] h-px bg-[#d4af37]/35"
                        : "absolute left-1/2 top-[76px] h-px w-[180px] -translate-x-1/2 bg-[#d4af37]/35"
                    }
                  />

                  <div className="relative mx-auto flex w-fit items-start justify-center gap-5 px-8 py-2">
                    <RowToggle />

                    {horizontalOpen && leftSiblings.map(renderSiblingBranch)}

                    <div className="min-w-[260px] text-center">
                      {renderCouple(
                        mainPerson,
                        mainPersonSpouse,
                        getChildrenFor(mainPerson).length > 0
                      )}

                      {renderDescendants(mainPerson)}
                    </div>

                    {horizontalOpen && rightSiblings.map(renderSiblingBranch)}
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}