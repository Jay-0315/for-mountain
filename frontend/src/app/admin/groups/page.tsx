"use client";

import { useEffect, useMemo, useState } from "react";
import { type Department } from "../mock-data";
import {
  createGroup,
  deleteGroup,
  fetchEmployees,
  fetchGroups,
  type EmployeeDto,
  type GroupDto,
  updateGroup,
} from "@/lib/api";
import { getSessionRole } from "@/lib/session";

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

const TECH_PARENT_MAP: Partial<Record<Department, Department>> = {
  "技術グループ1": "技術本部",
  "技術グループ2": "技術本部",
  "開発 Part1": "技術グループ1",
  "開発 Part2": "技術グループ2",
};

const TECH_ROOT: Department = "技術本部";
type GroupCreateMode = "independent" | "subgroup";
const GROUP_PARENT_PREFIX = "[PARENT:";

function parseGroupDescription(description: string) {
  const trimmed = description.trim();
  if (!trimmed.startsWith(GROUP_PARENT_PREFIX)) {
    return { parentName: null as string | null, description };
  }

  const closingIndex = trimmed.indexOf("]");
  if (closingIndex === -1) {
    return { parentName: null as string | null, description };
  }

  const parentValue = trimmed.slice(GROUP_PARENT_PREFIX.length, closingIndex).trim();
  const nextDescription = trimmed.slice(closingIndex + 1).trim();

  return {
    parentName: parentValue || null,
    description: nextDescription,
  };
}

function buildGroupDescription(parentName: string | null, description: string) {
  if (!parentName) {
    return description;
  }
  return `${GROUP_PARENT_PREFIX}${parentName}]${description ? ` ${description}` : ""}`;
}

function resolveGroupParent(group: GroupDto) {
  const parsed = parseGroupDescription(group.description ?? "");
  return parsed.parentName;
}

function getDisplayDescription(group: GroupDto) {
  return parseGroupDescription(group.description ?? "").description;
}

function inferParentNameFromGroup(group: GroupDto) {
  const fromDescription = resolveGroupParent(group);
  if (fromDescription) return fromDescription;
  return null;
}

function resolveTreeParent(group: GroupDto) {
  const parentName = resolveGroupParent(group);
  if (parentName) return parentName;
  if ((Object.keys(TECH_PARENT_MAP) as Department[]).includes(group.name as Department)) {
    return TECH_PARENT_MAP[group.name as Department] ?? null;
  }
  return null;
}

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
  const initialParentName = group ? inferParentNameFromGroup(group) : null;
  const [createMode, setCreateMode] = useState<GroupCreateMode>(initialParentName ? "subgroup" : "independent");
  const [name, setName] = useState(group?.name ?? "");
  const [parentName, setParentName] = useState(initialParentName ?? "");
  const [leaderId, setLeaderId] = useState<number | "">(group?.leaderId ?? "");
  const [description, setDescription] = useState(group ? getDisplayDescription(group) : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const parentOptions = useMemo(() => {
    return groups.filter((item) => item.id !== group?.id);
  }, [group?.id, groups]);
  const leaderOptions = employees.filter((employee) => employee.status === "在籍");
  const memberIds = group?.memberIds ?? [];

  useEffect(() => {
    if (createMode === "independent") {
      if (parentName !== "") {
        setParentName("");
      }
      return;
    }

    if (!parentName && parentOptions[0]) {
      setParentName(parentOptions[0].name);
    }
  }, [createMode, parentName, parentOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("グループ名を入力してください。");
      return;
    }

    if (createMode === "subgroup" && !parentName) {
      setError("親グループを選択してください。");
      return;
    }

    if (!leaderId) {
      setError("グループ長を選択してください。");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        leaderId: Number(leaderId),
        memberIds,
        description: buildGroupDescription(createMode === "subgroup" ? parentName : null, description.trim()),
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
          {isEdit ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">グループ名</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">追加方式</label>
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
                  placeholder="新しいグループ名を入力してください。"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {createMode === "subgroup" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">親グループ</label>
                  <select
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {parentOptions.length === 0 ? (
                      <option value="">選択できるグループがありません</option>
                    ) : (
                      parentOptions.map((parentGroup) => (
                        <option key={parentGroup.id} value={parentGroup.name}>
                          {parentGroup.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              )}
            </>
          )}

          {isEdit && createMode === "subgroup" && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">親グループ</label>
              <select
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {parentOptions.map((parentGroup) => (
                  <option key={parentGroup.id} value={parentGroup.name}>
                    {parentGroup.name}
                  </option>
                ))}
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
            <div className="mt-3 flex flex-wrap gap-2">
              {memberIds.length === 0 ? (
                <p className="text-xs text-slate-400">メンバーは別途設定してください。</p>
              ) : (
                employees
                  .filter((employee) => memberIds.includes(employee.id))
                  .map((employee) => (
                  <span
                    key={employee.id}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                  >
                    {employee.name}
                  </span>
                  ))
              )}
            </div>
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
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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

function GroupCard({
  group,
  employees,
  canManage,
  onEdit,
  onDelete,
  compact = false,
}: {
  group: GroupDto;
  employees: EmployeeDto[];
  canManage: boolean;
  onEdit: (group: GroupDto) => void;
  onDelete: (groupId: number) => void;
  compact?: boolean;
}) {
  const members = employees.filter((employee) => group.memberIds.includes(employee.id));
  const parentName = resolveGroupParent(group);
  const displayDescription = getDisplayDescription(group);

  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md ${
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
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">グループ長</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{group.leaderName}</p>
          <p className="mt-1 text-xs text-slate-400">
            {members.find((employee) => employee.id === group.leaderId)?.position ?? "未設定"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500">所属メンバー</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {members.map((member) => (
              <span
                key={member.id}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
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
  const children = allGroups.filter((item) => resolveTreeParent(item) === group.name);
  const hasChildren = children.length > 0;
  const isOpen = expanded[group.name] ?? false;

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
  const [token] = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""));
  const isAdmin = getSessionRole(token) === "ADMIN";
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "技術本部": true,
    "技術グループ1": true,
    "技術グループ2": true,
  });

  const load = () => {
    setLoading(true);
    Promise.all([fetchGroups(), fetchEmployees()])
      .then(([groups, employees]) => {
        setGroups(groups);
        setEmployees(employees);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    void Promise.resolve().then(load);
  }, []);

  const activeEmployees = employees.filter((employee) => employee.status === "在籍");
  const unassignedEmployees = activeEmployees.filter((employee) => {
    return !groups.some((group) => group.memberIds.includes(employee.id));
  });

  const technicalRoot = groups.find((group) => group.name === TECH_ROOT) ?? groups.find((group) => resolveTreeParent(group) === TECH_ROOT);
  const technicalGroupIds = new Set<string | number>();
  groups.forEach((group) => {
    if (group.name === TECH_ROOT || resolveTreeParent(group)) {
      technicalGroupIds.add(group.id);
    }
  });
  const technicalGroups = groups.filter((group) => technicalGroupIds.has(group.id));
  const managementGroups = groups.filter((group) => !resolveGroupParent(group) && group.name === "管理部");
  const secondaryIndependentGroups = groups.filter((group) => {
    if (group.name === "管理部" || group.name === TECH_ROOT) {
      return false;
    }
    return resolveTreeParent(group) === null;
  });

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
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">グループ管理</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              部署別のグループ構成とグループ長、所属人数を一画面で管理します。
            </p>
          </div>
          {isAdmin && (
            <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setModalGroup(null)}
                className="admin-btn-primary inline-flex items-center justify-center gap-2 px-4 py-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                グループ追加
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="登録グループ数"
            value={loading ? "-" : groups.length}
            color="bg-orange-50"
            icon={
              <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatCard
            label="在籍社員数"
            value={loading ? "-" : activeEmployees.length}
            color="bg-green-50"
            icon={
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="未所属社員"
            value={loading ? "-" : unassignedEmployees.length}
            color="bg-yellow-50"
            icon={
              <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {managementGroups.length > 0 && (
              <section className="space-y-4">
                {managementGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    employees={employees}
                    canManage={isAdmin}
                    onEdit={(nextGroup) => setModalGroup(nextGroup)}
                    onDelete={handleDelete}
                  />
                ))}
              </section>
            )}

            {technicalRoot && (
              <section className="space-y-4">
                <TreeNode
                  group={technicalRoot}
                  employees={employees}
                  allGroups={technicalGroups}
                  expanded={expanded}
                  canManage={isAdmin}
                  onToggle={toggleGroup}
                  onEdit={(nextGroup) => setModalGroup(nextGroup)}
                  onDelete={handleDelete}
                />
              </section>
            )}

            {secondaryIndependentGroups.length > 0 && (
              <section className="space-y-4">
                <div className="grid gap-4">
                  {secondaryIndependentGroups.map((group) => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      employees={employees}
                      canManage={isAdmin}
                      onEdit={(nextGroup) => setModalGroup(nextGroup)}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )}

            {!technicalRoot && managementGroups.length === 0 && secondaryIndependentGroups.length === 0 && (
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
