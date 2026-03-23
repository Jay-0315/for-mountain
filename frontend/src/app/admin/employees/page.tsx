"use client";

import { useState, useEffect, useCallback } from "react";
import { createEmployee, deleteEmployee, fetchEmployees, type EmployeeDto, updateEmployee } from "@/lib/api";
import { getSessionRole } from "@/lib/session";

type Department =
  | "開発 Part1" | "開発 Part2"
  | "技術グループ1" | "技術グループ2" | "技術本部"
  | "サービスグループ" | "営業１グループ" | "管理部";

type EmployeeStatus = "在籍" | "休職" | "退職";
type Position = "代表取締役" | "常務" | "部長" | "課長" | "課長代理" | "主任" | "社員";
type JobTitle = "役員" | "管理職" | "一般社員";

const STATUS_COLOR: Record<string, string> = {
  在籍: "bg-green-100 text-green-700",
  休職: "bg-yellow-100 text-yellow-700",
  退職: "bg-slate-100 text-slate-500",
};

const DEPT_COLOR: Record<string, string> = {
  "開発Part1":      "bg-yellow-100 text-yellow-700",
  "開発Part2":      "bg-amber-100 text-amber-700",
  "技術グループ1":   "bg-green-100 text-green-700",
  "技術グループ2":   "bg-emerald-100 text-emerald-700",
  "技術本部":        "bg-lime-100 text-lime-700",
  "サービスグループ": "bg-red-100 text-red-700",
  "営業１グループ":  "bg-rose-100 text-rose-700",
  "管理部":          "bg-orange-100 text-orange-700",
};

function deptColorKey(value: string) {
  return value.replace(/\s+/g, "").trim();
}

const DEPARTMENTS: Department[] = [
  "開発 Part1", "開発 Part2",
  "技術グループ1", "技術グループ2", "技術本部",
  "サービスグループ", "営業１グループ", "管理部",
];
const POSITIONS: Position[] = ["代表取締役", "常務", "部長", "課長", "課長代理", "主任", "社員"];
const JOB_TITLES: JobTitle[] = ["役員", "管理職", "一般社員"];

type FilterStatus = "すべて" | EmployeeStatus;
type FilterDept   = "すべて" | Department;

// ── 추가/수정 모달 ────────────────────────────────────────────
function EmployeeModal({
  employee,
  token,
  onClose,
  onSaved,
}: {
  employee: EmployeeDto | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = employee !== null;
  const [form, setForm] = useState({
    employeeNumber: employee?.employeeNumber ?? "",
    name:           employee?.name ?? "",
    nameKana:       employee?.nameKana ?? "",
    nationality:    employee?.nationality ?? "韓国",
    birthDate:      employee?.birthDate ?? "",
    department:     employee?.department ?? "開発 Part1",
    position:       employee?.position ?? "社員",
    jobTitle:       employee?.jobTitle ?? "一般社員",
    joinDate:       employee?.joinDate ?? "",
    email:          employee?.email ?? "",
    status:         employee?.status ?? "在籍",
    annualLeaveDays: employee?.annualLeaveDays != null ? String(employee.annualLeaveDays) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        annualLeaveDays: form.annualLeaveDays !== "" ? Number(form.annualLeaveDays) : null,
      };
      if (isEdit && employee) {
        await updateEmployee(token, employee.id, payload);
      } else {
        await createEmployee(token, payload);
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            {isEdit ? "社員情報を編集" : "社員を追加"}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: "氏名",     key: "name",           placeholder: "盧鍾錫",      type: "text" },
            { label: "フリガナ", key: "nameKana",       placeholder: "ノジョンソク", type: "text" },
            { label: "社員番号", key: "employeeNumber", placeholder: "M26031025",   type: "text" },
            { label: "国籍",     key: "nationality",    placeholder: "韓国",         type: "text" },
            { label: "生年月日", key: "birthDate",      placeholder: "1990-01-01",  type: "date" },
            { label: "メール",   key: "email",          placeholder: "example@for-mountain.co.jp", type: "email" },
            { label: "入社日",   key: "joinDate",       placeholder: "2024-04-01",  type: "date" },
          ].map(({ label, key, placeholder, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
              <input
                type={type}
                value={(form as Record<string, string>)[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900
                           focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          ))}

          {[
            { label: "部署",       key: "department", options: DEPARTMENTS },
            { label: "職級",       key: "position",   options: POSITIONS },
            { label: "職責",       key: "jobTitle",   options: JOB_TITLES },
            { label: "ステータス", key: "status",     options: ["在籍", "休職", "退職"] },
          ].map(({ label, key, options }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
              <select
                value={(form as Record<string, string>)[key]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900
                           focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">年間有給日数</label>
            <input
              type="number"
              min={0}
              max={365}
              value={form.annualLeaveDays}
              onChange={(e) => set("annualLeaveDays", e.target.value)}
              placeholder="例: 20"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200
                         rounded-xl hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="submit" disabled={loading}
              className="admin-btn-primary px-4 py-2"
            >
              {loading ? "保存中..." : isEdit ? "更新する" : "追加する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────
export default function EmployeesPage() {
  const [employees, setEmployees]   = useState<EmployeeDto[]>([]);
  const [token]                     = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""));
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("すべて");
  const [deptFilter, setDeptFilter] = useState<FilterDept>("すべて");
  const [search, setSearch]         = useState("");
  const [modalEmployee, setModalEmployee] = useState<EmployeeDto | null | undefined>(undefined);
  const isAdmin = getSessionRole(token) === "ADMIN";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEmployees(await fetchEmployees());
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = employees.filter((e) => {
    if (statusFilter !== "すべて" && e.status !== statusFilter) return false;
    if (deptFilter   !== "すべて" && e.department !== deptFilter) return false;
    if (search && !e.name.includes(search) && !e.nameKana.includes(search)) return false;
    return true;
  });

  const isModalOpen = modalEmployee !== undefined;

  const handleDeleteEmployee = async (employee: EmployeeDto) => {
    if (!confirm(`${employee.name} さんを削除しますか？`)) return;
    try {
      await deleteEmployee(token, employee.id);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "社員削除に失敗しました。");
    }
  };

  return (
    <>
      {isModalOpen && (
        <EmployeeModal
          token={token}
          employee={modalEmployee ?? null}
          onClose={() => setModalEmployee(undefined)}
          onSaved={() => { setModalEmployee(undefined); load(); }}
        />
      )}

      <div className="max-w-5xl space-y-5">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">社員管理</h2>
          {isAdmin && (
            <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setModalEmployee(null)}
                className="admin-btn-primary inline-flex items-center justify-center gap-2 px-4 py-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                社員を追加
              </button>
            </div>
          )}
        </div>

        {/* 검색 + 필터 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="氏名で検索"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-900
                         focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value as FilterDept)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="すべて">すべての部署</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900
                       focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="すべて">すべての状態</option>
            <option value="在籍">在籍</option>
            <option value="休職">休職</option>
            <option value="退職">退職</option>
          </select>
        </div>

        {/* 테이블 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
            <p className="text-xs font-semibold text-slate-500">
              {loading ? "読み込み中..." : `全体 ${employees.length} 名 / 表示 ${filtered.length} 名`}
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">氏名</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden sm:table-cell">部署</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden md:table-cell">職級</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden lg:table-cell">社員番号</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden xl:table-cell">入社日</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">状態</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <p className="text-slate-900 font-medium">{emp.name}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{emp.nameKana}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${DEPT_COLOR[deptColorKey(emp.department)] ?? "bg-slate-100 text-slate-600"}`}>
                          {emp.department}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-slate-600 text-xs">{emp.position}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-slate-500 text-xs font-mono">{emp.employeeNumber}</span>
                      </td>
                      <td className="px-5 py-3.5 hidden xl:table-cell">
                        <span className="text-slate-500 text-xs font-mono">{emp.joinDate}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLOR[emp.status] ?? "bg-slate-100 text-slate-500"}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setModalEmployee(emp)}
                              className="text-xs font-semibold text-slate-500 hover:text-orange-500 px-2 py-1"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1"
                            >
                              削除
                            </button>
                          </div>
                        ) : (
                          <span className="px-2 py-1 text-xs text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-slate-400">該当する社員がいません。</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
