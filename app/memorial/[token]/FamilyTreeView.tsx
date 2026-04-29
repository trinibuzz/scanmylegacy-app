"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Member = {
  id: number;
  name: string;
  relation?: string;
  birth_year?: string;
  death_year?: string;
  spouse?: Member;
  children?: Member[];
};

type TreeData = {
  mother?: Member;
  father?: Member;
  deceased: Member;
  siblings?: Member[];
};

function TreeNode({
  member,
  onClick,
  isMain = false,
  hasChildren = false,
  isCollapsed = false,
  onToggleCollapse,
  hasSpouse = false,
  isSpouseCollapsed = false,
  onToggleSpouseCollapse,
  spousePosition = "right",
}: any) {
  if (!member) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onClick={() => onClick(member)}
      className={`relative p-4 rounded-xl border cursor-pointer min-w-[160px] text-center
      ${
        isMain
          ? "bg-[#1b2c4d] border-[#d4af37]"
          : "bg-[#111a2e] border-[#2b3c5d]"
      }`}
    >
      <h3 className="text-white font-semibold">{member.name}</h3>

      {(member.birth_year || member.death_year) && (
        <p className="text-xs text-gray-400 mt-1">
          {member.birth_year || "?"} — {member.death_year || "Present"}
        </p>
      )}

      {member.relation && (
        <p className="text-xs text-[#d4af37] mt-2">{member.relation}</p>
      )}

      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2"
        >
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-[#d4af37]" />
          ) : (
            <ChevronUp className="w-5 h-5 text-[#d4af37]" />
          )}
        </button>
      )}

      {hasSpouse && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSpouseCollapse();
          }}
          className={`absolute top-1/2 -translate-y-1/2 ${
            spousePosition === "left" ? "-left-3" : "-right-3"
          }`}
        >
          {spousePosition === "left" ? (
            isSpouseCollapsed ? (
              <ChevronLeft className="w-5 h-5 text-[#d4af37]" />
            ) : (
              <ChevronRight className="w-5 h-5 text-[#d4af37]" />
            )
          ) : isSpouseCollapsed ? (
            <ChevronRight className="w-5 h-5 text-[#d4af37]" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-[#d4af37]" />
          )}
        </button>
      )}
    </motion.div>
  );
}

function FamilyBranch({
  person,
  onClick,
  collapsedNodes,
  toggleCollapse,
  spouseCollapsedNodes,
  toggleSpouseCollapse,
  isMain = false,
  spousePosition = "right",
}: any) {
  if (!person) return null;

  const children = person.children || [];
  const hasChildren = children.length > 0;
  const isCollapsed = collapsedNodes.has(person.id);

  const hasSpouse = !!person.spouse;
  const spouseCollapsed = spouseCollapsedNodes.has(person.id);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-4">
        {spousePosition === "left" && hasSpouse && !spouseCollapsed && (
          <TreeNode member={person.spouse} onClick={onClick} />
        )}

        <TreeNode
          member={person}
          onClick={onClick}
          isMain={isMain}
          hasChildren={hasChildren}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => toggleCollapse(person.id)}
          hasSpouse={hasSpouse}
          isSpouseCollapsed={spouseCollapsed}
          onToggleSpouseCollapse={() => toggleSpouseCollapse(person.id)}
          spousePosition={spousePosition}
        />

        {spousePosition === "right" && hasSpouse && !spouseCollapsed && (
          <TreeNode member={person.spouse} onClick={onClick} />
        )}
      </div>

      {!isCollapsed && hasChildren && (
        <div className="mt-10 flex gap-8">
          {children.map((child: Member) => (
            <FamilyBranch
              key={child.id}
              person={child}
              onClick={onClick}
              collapsedNodes={collapsedNodes}
              toggleCollapse={toggleCollapse}
              spouseCollapsedNodes={spouseCollapsedNodes}
              toggleSpouseCollapse={toggleSpouseCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FamilyTreeView({
  familyTreeData,
}: {
  familyTreeData: TreeData;
}) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set<number>());
  const [spouseCollapsedNodes, setSpouseCollapsedNodes] = useState(
    new Set<number>()
  );

  if (!familyTreeData?.deceased) {
    return null;
  }

  const toggleCollapse = (id: number) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSpouseCollapse = (id: number) => {
    setSpouseCollapsedNodes((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section className="w-full overflow-x-auto py-10">
      <div className="min-w-max mx-auto flex flex-col items-center gap-10">

        <div className="flex gap-10">
          {familyTreeData.father && (
            <TreeNode
              member={familyTreeData.father}
              onClick={setSelectedMember}
            />
          )}

          {familyTreeData.mother && (
            <TreeNode
              member={familyTreeData.mother}
              onClick={setSelectedMember}
            />
          )}
        </div>

        <div className="flex gap-8">
          {familyTreeData.siblings?.map((sibling) => (
            <FamilyBranch
              key={sibling.id}
              person={sibling}
              onClick={setSelectedMember}
              collapsedNodes={collapsedNodes}
              toggleCollapse={toggleCollapse}
              spouseCollapsedNodes={spouseCollapsedNodes}
              toggleSpouseCollapse={toggleSpouseCollapse}
            />
          ))}

          <FamilyBranch
            person={familyTreeData.deceased}
            isMain={true}
            onClick={setSelectedMember}
            collapsedNodes={collapsedNodes}
            toggleCollapse={toggleCollapse}
            spouseCollapsedNodes={spouseCollapsedNodes}
            toggleSpouseCollapse={toggleSpouseCollapse}
          />
        </div>
      </div>

      {selectedMember && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#111a2e] border border-[#d4af37] rounded-xl p-6 w-[400px]">
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-[#d4af37]" />
              <h2 className="text-white text-xl">{selectedMember.name}</h2>
            </div>

            <p className="text-gray-300">
              Born: {selectedMember.birth_year || "Unknown"}
            </p>

            <p className="text-gray-300">
              Passed: {selectedMember.death_year || "Present"}
            </p>

            <button
              onClick={() => setSelectedMember(null)}
              className="mt-6 bg-[#d4af37] text-black px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}