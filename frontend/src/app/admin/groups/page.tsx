"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createGroup,
  deleteGroup,
  fetchEmployees,
  fetchGroups,
  type EmployeeDto,
  type GroupDto,
  updateGroup,
} from "@/lib/api";
import { getSessionPayload, getSessionRole } from "@/lib/session";

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

function normalizeDepartmentKey(value: string) {
  return value.replace(/\s+/g, "").trim();
}

function resolveDepartmentColor(value: string) {
  const normalized = normalizeDepartmentKey(value);
  return DEPT_COLOR[normalized] ?? "bg-slate-100 text-slate-700";
}

type GroupCreateMode = "independent" | "subgroup";

function GroupModal({
  groups,
  employees,
  group,
  token,
  onClose,
  onSaved,
}: {
  groups: GroupDto[];
  employees: EmployeeDto[];
  group: GroupDto | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = group !== null;
  const [createMode, setCreateMode] = useState<GroupCreateMode>(group?.parentGroupId ? "subgroup" : "independent");
  const [name, setName] = useState(group?.name ?? "");
  const [parentGroupId, setParentGroupId] = useState<number | "">(group?.parentGroupId ?? "");
  const [leaderId, setLeaderId] = useState<number | "">(group?.leaderId ?? "");
  const [memberIds, setMemberIds] = useState<number[]>(group?.memberIds ?? []);
  const [selectedMemberId, setSelectedMemberId] = useState<number | "">("");
  const [description, setDescription] = useState(group?.description ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const parentOptions = useMemo(() => {
    return groups.filter((item) => item.id !== group?.id);
  }, [group?.id, groups]);
  const leaderOptions = employees.filter((employee) => employee.status === "在籍");
  const memberOptions = leaderOptions.filter((employee) => !memberIds.includes(employee.id));
  const otherGroupByEmployeeId = useMemo(() => {
    const entries = groups
      .filter((item) => item.id !== group?.id)
      .flatMap((item) => item.memberIds.map((employeeId) => [employeeId, item.name] as const));
    return new Map<number, string>(entries);
  }, [group?.id, groups]);

  useEffect(() => {
    if (!leaderId) return;
    setMemberIds((prev) => (prev.includes(Number(leaderId)) ? prev : [...prev, Number(leaderId)]));
  }, [leaderId]);

  useEffect(() => {
    if (createMode === "independent") {
      setParentGroupId("");
      return;
    }
    if (!parentGroupId && parentOptions[0]) {
      setParentGroupId(parentOptions[0].id);
    }
  }, [createMode, parentGroupId, parentOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("グループ名を入力してください。");
      return;
    }

    if (createMode === "subgroup" && !parentGroupId) {
      setError("親グループを選択してください。");
      return;
    }

    if (!leaderId) {
      setError("グループ長を選択してください。");
      return;
    }

    if (memberIds.length === 0) {
      setError("所属メンバーを1名以上選択してください。");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        leaderId: Number(leaderId),
        memberIds,
        description: description.trim(),
        parentGroupId: createMode === "subgroup" ? Number(parentGroupId) : null,
      };

      if (isEdit && group) {
        await updateGroup(token, group.id, payload);
      } else {
        await createGroup(token, payload);
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = () => {
    if (!selectedMemberId) return;
    setMemberIds((prev) => (prev.includes(Number(selectedMemberId)) ? prev : [...prev, Number(selectedMemberId)]));
    setSelectedMemberId("");
  };

  const handleRemoveMember = (employeeId: number) => {
    if (employeeId === leaderId) {
      return;
    }
    setMemberIds((prev) => prev.filter((id) => id !== employeeId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {isEdit ? "グループ情報を編集" : "グループを追加"}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              独立部門は単独で登録し、傘下グループは親グループを指定して登録します。
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {isEdit ? "グループ区分" : "追加方式"}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCreateMode("independent")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  createMode === "independent" ? "admin-pill-active" : "admin-pill"
                }`}
              >
                独立部門
              </button>
              <button
                type="button"
                onClick={() => setCreateMode("subgroup")}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  createMode === "subgroup" ? "admin-pill-active" : "admin-pill"
                }`}
              >
                傘下グループ
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">グループ名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isEdit ? "" : "新しいグループ名を入力してください。"}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {createMode === "subgroup" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">親グループ</label>
              <select
                value={parentGroupId}
                onChange={(e) => setParentGroupId(e.target.value ? Number(e.target.value) : "")}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {parentOptions.length === 0 ? (
                  <option value="">選択できるグループがありません</option>
                ) : (
                  parentOptions.map((parentGroup) => (
                    <option key={parentGroup.id} value={parentGroup.id}>
                      {parentGroup.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">グループ長</label>
            <select
              value={leaderId}
              onChange={(e) => setLeaderId(e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {leaderOptions.length === 0 ? (
                <option value="">在籍社員がいません</option>
              ) : (
                leaderOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} ({employee.position})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">グループ説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="グループの役割や担当領域を入力してください。"
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">所属メンバー</p>
              <span className="text-xs text-slate-400">{memberIds.length}名</span>
            </div>
            <div className="mt-3 flex gap-2">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value ? Number(e.target.value) : "")}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">社員を選択してください</option>
                {memberOptions.map((employee) => {
                  const currentGroupName = otherGroupByEmployeeId.get(employee.id);
                  return (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                      {currentGroupName ? ` (${currentGroupName} から移動)` : ""}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={handleAddMember}
                className="rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-500 transition-colors hover:bg-orange-50"
              >
                追加
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {memberIds.length === 0 ? (
                <p className="text-xs text-slate-400">メンバーは別途設定してください。</p>
              ) : (
                employees
                  .filter((employee) => memberIds.includes(employee.id))
                  .map((employee) => (
                  <span
                    key={employee.id}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    {employee.name}
                    {employee.id === leaderId && (
                      <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-500">
                        リーダー
                      </span>
                    )}
                    {employee.id !== leaderId && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(employee.id)}
                        className="text-slate-400 transition-colors hover:text-red-500"
                        aria-label={`${employee.name}を削除`}
                      >
                        ×
                      </button>
                    )}
                  </span>
                  ))
              )}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              他グループ所属の社員を追加すると、既存グループから自動で移動します。
            </p>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="admin-btn-primary rounded-xl px-5 py-2.5"
            >
              {saving ? "保存中..." : isEdit ? "更新する" : "追加する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
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

function resolveGroupAccent(group: GroupDto) {
  return GROUP_ACCENT[group.name] ?? DEFAULT_ACCENT;
}

function GroupCard({
  group,
  groups,
  employees,
  canManage,
  onEdit,
  onDelete,
  compact = false,
}: {
  group: GroupDto;
  groups: GroupDto[];
  employees: EmployeeDto[];
  canManage: boolean;
  onEdit: (group: GroupDto) => void;
  onDelete: (groupId: number) => void;
  compact?: boolean;
}) {
  const members = employees.filter((employee) => group.memberIds.includes(employee.id));
  const leader = employees.find((employee) => employee.id === group.leaderId);
  const parentName = group.parentGroupId ? (groups.find((g) => g.id === group.parentGroupId)?.name ?? null) : null;
  const displayDescription = group.description;
  const accent = resolveGroupAccent(group);

  return (
    <div
      className={`rounded-2xl border border-slate-100 border-l-4 ${accent.border} bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
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
          <div>
            <p className="text-sm font-semibold text-slate-900">{group.name}</p>
            <p className="mt-1 text-sm text-slate-500">{displayDescription || "説明が未設定です。"}</p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => onEdit(group)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors duration-200 hover:text-orange-500"
            >
              編集
            </button>
            <button
              onClick={() => onDelete(group.id)}
              className="px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors duration-200 hover:text-red-600"
            >
              削除
            </button>
          </div>
        )}
      </div>

      <div className={`grid gap-4 border-t border-slate-100 pt-4 ${compact ? "mt-3 sm:grid-cols-[180px_minmax(0,1fr)]" : "mt-4 sm:grid-cols-[220px_minmax(0,1fr)]"}`}>
        <div className={`rounded-xl bg-gradient-to-br ${accent.leaderBg} border p-4`}>
          <p className={`text-xs font-medium ${accent.leaderLabel}`}>グループ長</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{group.leaderName}</p>
          <p className={`mt-1 text-xs ${accent.leaderPos}`}>
            {leader?.position ?? "未設定"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">所属メンバー</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {members.map((member) => (
              <span
                key={member.id}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${accent.memberTag}`}
              >
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
  employees,
  allGroups,
  expanded,
  canManage,
  onToggle,
  onEdit,
  onDelete,
  depth = 0,
}: {
  group: GroupDto;
  employees: EmployeeDto[];
  allGroups: GroupDto[];
  expanded: Record<string, boolean>;
  canManage: boolean;
  onToggle: (name: string) => void;
  onEdit: (group: GroupDto) => void;
  onDelete: (groupId: number) => void;
  depth?: number;
}) {
  const children = allGroups.filter((item) => item.parentGroupId === group.id);
  const hasChildren = children.length > 0;
  const isOpen = expanded[group.name] ?? true;

  return (
    <div className={`${depth > 0 ? "ml-4 border-l border-slate-200 pl-4 sm:ml-6 sm:pl-5" : ""}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggle(group.name)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-300 ease-out hover:border-orange-200 hover:text-orange-500"
              aria-label={isOpen ? `${group.name}を閉じる` : `${group.name}を開く`}
            >
              <svg
                className={`h-4 w-4 transition-transform duration-300 ease-out ${isOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <span className="h-7 w-7" />
          )}
          <div className="min-w-0 flex-1">
            <GroupCard
              group={group}
              groups={allGroups}
              employees={employees}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
              compact={depth > 0}
            />
          </div>
        </div>

        {hasChildren && (
          <div
            className={`overflow-hidden transition-all duration-300 ease-out ${
              isOpen ? "max-h-[2400px] translate-y-0 opacity-100" : "max-h-0 -translate-y-1 opacity-0"
            }`}
          >
            <div className="space-y-3 pt-1">
            {children.map((child) => (
              <TreeNode
                key={child.id}
                group={child}
                employees={employees}
                allGroups={allGroups}
                expanded={expanded}
                canManage={canManage}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
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

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalGroup, setModalGroup] = useState<GroupDto | null | undefined>(undefined);
  const [token, setToken] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const t = sessionStorage.getItem("admin_token") ?? "";
    setToken(t);
    setIsAdmin(getSessionRole(t) === "ADMIN");
  }, []);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = () => {
    setLoading(true);
    const t = sessionStorage.getItem("admin_token") ?? "";
    const role = getSessionRole(t);
    const { sub } = getSessionPayload(t);
    Promise.all([fetchGroups(), fetchEmployees()])
      .then(([allGroups, employees]) => {
        setEmployees(employees);
        const me = employees.find((e) => e.employeeNumber === sub);
        if (!me) { setGroups(allGroups); return; }
        // 본인이 리더인 그룹 + 하위 그룹 수집
        const myGroups = allGroups.filter((g) => g.leaderId === me.id);
        if (myGroups.length === 0) {
          // 그룹장이 아님 = 진짜 ADMIN → 전체 표시
          setGroups(allGroups);
          return;
        }
        const visibleIds = new Set<number>();
        const queue = [...myGroups];
        const visited = new Set<number>();
        while (queue.length > 0) {
          const g = queue.shift()!;
          if (visited.has(g.id)) continue;
          visited.add(g.id);
          visibleIds.add(g.id);
          allGroups.filter((c) => c.parentGroupId === g.id).forEach((c) => queue.push(c));
        }
        setGroups(allGroups.filter((g) => visibleIds.has(g.id)));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  const activeEmployees = employees.filter((employee) => employee.status === "在籍");
  const unassignedEmployees = activeEmployees.filter((employee) => {
    return !groups.some((group) => group.memberIds.includes(employee.id));
  });

  const rootGroups = groups.filter(
    (g) => !g.parentGroupId || !groups.find((p) => p.id === g.parentGroupId)
  );

  const collectSubtree = (rootId: number): GroupDto[] => {
    const result: GroupDto[] = [];
    const queue = [rootId];
    const visited = new Set<number>();
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const group = groups.find((g) => g.id === id);
      if (!group) continue;
      result.push(group);
      groups.filter((g) => g.parentGroupId === id).forEach((g) => queue.push(g.id));
    }
    return result;
  };

  const toggleGroup = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleDelete = (groupId: number) => {
    if (!confirm("このグループを削除しますか？")) return;
    deleteGroup(token, groupId).then(load).catch(() => {});
  };

  const isModalOpen = modalGroup !== undefined;

  return (
    <>
      {isAdmin && isModalOpen && (
        <GroupModal
          groups={groups}
          employees={employees}
          group={modalGroup ?? null}
          token={token}
          onClose={() => setModalGroup(undefined)}
          onSaved={() => {
            setModalGroup(undefined);
            load();
          }}
        />
      )}

      <div className="max-w-5xl space-y-6">
        <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white shadow-sm">
          <div className="h-1 bg-gradient-to-r from-orange-400 to-amber-300" />
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">グループ管理</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                部署別のグループ構成とグループ長、所属人数を一画面で管理します。
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setModalGroup(null)}
                className="admin-btn-primary inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                グループ追加
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="登録グループ数"
            value={loading ? "-" : groups.length}
            color="bg-orange-100"
            icon={
              <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            label="在籍社員数"
            value={loading ? "-" : activeEmployees.length}
            color="bg-emerald-100"
            icon={
              <svg className="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="未所属社員"
            value={loading ? "-" : unassignedEmployees.length}
            color="bg-yellow-100"
            icon={
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01M10.29 3.86l-7.5 13A1 1 0 003.66 18h16.68a1 1 0 00.87-1.14l-7.5-13a1 1 0 00-1.74 0z" />
              </svg>
            }
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <p className="text-sm text-slate-400">登録されたグループがありません。</p>
          </div>
        ) : (
          <div className="space-y-6">
            {rootGroups.map((rootGroup) => (
              <section key={rootGroup.id} className="space-y-4">
                <TreeNode
                  group={rootGroup}
                  employees={employees}
                  allGroups={collectSubtree(rootGroup.id)}
                  expanded={expanded}
                  canManage={isAdmin}
                  onToggle={toggleGroup}
                  onEdit={(nextGroup) => setModalGroup(nextGroup)}
                  onDelete={handleDelete}
                />
              </section>
            ))}

            {rootGroups.length === 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
                <p className="text-sm text-slate-400">登録されたグループがありません。</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
