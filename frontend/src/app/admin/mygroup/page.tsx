"use client";

import { useEffect, useState } from "react";
import { fetchEmployees, fetchGroups, type EmployeeDto, type GroupDto } from "@/lib/api";
import { getSessionPayload } from "@/lib/session";

const DEPT_COLOR: Record<string, string> = {
  "開発Part1": "bg-yellow-100 text-yellow-700",
  "開発Part2": "bg-amber-100 text-amber-700",
  "技術グループ1": "bg-green-100 text-green-700",
  "技術グループ2": "bg-emerald-100 text-emerald-700",
  "技術本部": "bg-lime-100 text-lime-700",
  "サービスグループ": "bg-red-100 text-red-700",
  "営業１グループ": "bg-rose-100 text-rose-700",
  "管理部": "bg-orange-100 text-orange-700",
};

function resolveDepartmentColor(value: string) {
  const normalized = value.replace(/\s+/g, "").trim();
  return DEPT_COLOR[normalized] ?? "bg-slate-100 text-slate-700";
}

const GROUP_ACCENT: Record<string, { border: string; leaderBg: string; leaderLabel: string; leaderPos: string; memberTag: string }> = {
  "管理部":           { border: "border-l-orange-400",  leaderBg: "from-orange-50 to-amber-50 border-orange-100",    leaderLabel: "text-orange-600",  leaderPos: "text-orange-400",  memberTag: "bg-orange-50 border-orange-100 text-orange-700" },
  "技術本部":         { border: "border-l-emerald-400", leaderBg: "from-emerald-50 to-green-50 border-emerald-100",  leaderLabel: "text-emerald-600", leaderPos: "text-emerald-400", memberTag: "bg-emerald-50 border-emerald-100 text-emerald-700" },
  "技術グループ1":    { border: "border-l-green-400",   leaderBg: "from-green-50 to-lime-50 border-green-100",       leaderLabel: "text-green-600",   leaderPos: "text-green-400",   memberTag: "bg-green-50 border-green-100 text-green-700" },
  "技術グループ2":    { border: "border-l-lime-500",    leaderBg: "from-lime-50 to-yellow-50 border-lime-100",       leaderLabel: "text-lime-700",    leaderPos: "text-lime-500",    memberTag: "bg-lime-50 border-lime-100 text-lime-700" },
  "開発 Part1":      { border: "border-l-yellow-400",  leaderBg: "from-yellow-50 to-amber-50 border-yellow-100",    leaderLabel: "text-yellow-700",  leaderPos: "text-yellow-500",  memberTag: "bg-yellow-50 border-yellow-100 text-yellow-700" },
  "開発 Part2":      { border: "border-l-amber-400",   leaderBg: "from-amber-50 to-orange-50 border-amber-100",     leaderLabel: "text-amber-600",   leaderPos: "text-amber-400",   memberTag: "bg-amber-50 border-amber-100 text-amber-700" },
  "サービスグループ": { border: "border-l-red-400",    leaderBg: "from-red-50 to-rose-50 border-red-100",           leaderLabel: "text-red-600",     leaderPos: "text-red-400",     memberTag: "bg-red-50 border-red-100 text-red-700" },
  "営業１グループ":   { border: "border-l-rose-400",   leaderBg: "from-rose-50 to-pink-50 border-rose-100",         leaderLabel: "text-rose-600",    leaderPos: "text-rose-400",    memberTag: "bg-rose-50 border-rose-100 text-rose-700" },
};
const DEFAULT_ACCENT = { border: "border-l-slate-300", leaderBg: "from-slate-50 to-white border-slate-100", leaderLabel: "text-slate-500", leaderPos: "text-slate-400", memberTag: "bg-slate-50 border-slate-100 text-slate-600" };

function GroupCard({
  group,
  groups,
  employees,
  compact = false,
}: {
  group: GroupDto;
  groups: GroupDto[];
  employees: EmployeeDto[];
  compact?: boolean;
}) {
  const members = employees.filter((e) => group.memberIds.includes(e.id));
  const leader = employees.find((e) => e.id === group.leaderId);
  const parentName = group.parentGroupId ? (groups.find((g) => g.id === group.parentGroupId)?.name ?? null) : null;
  const accent = GROUP_ACCENT[group.name] ?? DEFAULT_ACCENT;

  return (
    <div className={`rounded-2xl border border-slate-100 border-l-4 ${accent.border} bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${compact ? "p-4" : "p-5"}`}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {parentName ? (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${resolveDepartmentColor(parentName)}`}>
            {parentName}
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            独立部門
          </span>
        )}
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          {group.memberIds.length}名
        </span>
      </div>

      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-900">{group.name}</p>
        <p className="mt-1 text-sm text-slate-500">{group.description || "説明が未設定です。"}</p>
      </div>

      <div className={`grid gap-4 border-t border-slate-100 pt-4 ${compact ? "sm:grid-cols-[180px_minmax(0,1fr)]" : "sm:grid-cols-[220px_minmax(0,1fr)]"}`}>
        <div className={`rounded-xl bg-gradient-to-br ${accent.leaderBg} border p-4`}>
          <p className={`text-xs font-medium ${accent.leaderLabel}`}>グループ長</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{group.leaderName}</p>
          <p className={`mt-1 text-xs ${accent.leaderPos}`}>{leader?.position ?? "未設定"}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">所属メンバー</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {members.map((member) => (
              <span key={member.id} className={`rounded-full border px-3 py-1 text-xs font-medium ${accent.memberTag}`}>
                {member.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeNode({
  group,
  allGroups,
  employees,
  expanded,
  onToggle,
  depth = 0,
}: {
  group: GroupDto;
  allGroups: GroupDto[];
  employees: EmployeeDto[];
  expanded: Record<number, boolean>;
  onToggle: (id: number) => void;
  depth?: number;
}) {
  const children = allGroups.filter((g) => g.parentGroupId === group.id);
  const hasChildren = children.length > 0;
  const isOpen = expanded[group.id] ?? true;

  return (
    <div className={depth > 0 ? "ml-4 border-l border-slate-200 pl-4 sm:ml-6 sm:pl-5" : ""}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggle(group.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-300 ease-out hover:border-orange-200 hover:text-orange-500"
            >
              <svg className={`h-4 w-4 transition-transform duration-300 ease-out ${isOpen ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="h-7 w-7 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <GroupCard group={group} groups={allGroups} employees={employees} compact={depth > 0} />
          </div>
        </div>

        {hasChildren && (
          <div className={`overflow-hidden transition-all duration-300 ease-out ${isOpen ? "max-h-[2400px] translate-y-0 opacity-100" : "max-h-0 -translate-y-1 opacity-0"}`}>
            <div className="space-y-3 pt-1">
              {children.map((child) => (
                <TreeNode
                  key={child.id}
                  group={child}
                  allGroups={allGroups}
                  employees={employees}
                  expanded={expanded}
                  onToggle={onToggle}
                  depth={depth + 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyGroupPage() {
  const [myGroups, setMyGroups] = useState<GroupDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    const { sub } = getSessionPayload(token);
    Promise.all([fetchEmployees(), fetchGroups()])
      .then(([emps, groups]) => {
        setEmployees(emps);
        const me = emps.find((e) => e.employeeNumber === sub);
        if (!me) return;

        const belongingGroups = groups.filter((g) => g.memberIds.includes(me.id));
        const result = new Map<number, GroupDto>();
        const addWithAncestors = (group: GroupDto) => {
          if (result.has(group.id)) return;
          result.set(group.id, group);
          if (group.parentGroupId) {
            const parent = groups.find((g) => g.id === group.parentGroupId);
            if (parent) addWithAncestors(parent);
          }
        };
        belongingGroups.forEach(addWithAncestors);
        setMyGroups(Array.from(result.values()));
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleGroup = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rootGroups = myGroups.filter(
    (g) => !g.parentGroupId || !myGroups.find((p) => p.id === g.parentGroupId)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (myGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-sm">所属グループがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">所属グループ</h2>
          <p className="text-sm text-slate-500 mt-0.5">あなたが所属するグループの組織図です。</p>
        </div>
      </div>
      <div className="space-y-4">
        {rootGroups.map((group) => (
          <TreeNode
            key={group.id}
            group={group}
            allGroups={myGroups}
            employees={employees}
            expanded={expanded}
            onToggle={toggleGroup}
          />
        ))}
      </div>
    </div>
  );
}
