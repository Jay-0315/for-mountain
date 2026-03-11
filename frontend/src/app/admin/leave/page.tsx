"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import {
  cancelLeave,
  createLeave,
  fetchEmployees,
  fetchLeaves,
  type EmployeeDto,
  type LeaveDto,
  updateLeaveStatus,
} from "@/lib/api";
import { getSessionPayload, getSessionRole } from "@/lib/session";

const STATUS_COLOR: Record<string, string> = {
  待機中: "bg-yellow-100 text-yellow-700",
  承認:   "bg-green-100 text-green-700",
  否認:   "bg-red-100 text-red-600",
};

const LEAVE_TYPES = [
  "月次勤務実績申請",
  "日次勤務実績申請",
  "シフト申請",
  "有給（事前申請）",
  "有給（事後申請）",
  "半日有給 午前（事前申請）",
  "半日有給 午後（事前申請）",
  "公休（事前申請）",
  "公休（事後申請）",
  "半日 公休 午前（事前申請）",
  "半日 公休 午後（事前申請）",
  "遅刻（事前申請）",
  "遅刻（事後申請）",
  "代休（事前申請）",
  "代休（事後申請）",
  "通常残業（事前申請）",
  "通常残業（事後申請）",
  "深夜残業（事前申請）",
  "深夜残業（事後申請）",
  "休日出勤（事前申請）",
  "休日出勤（事後申請）",
  "出張（事前申請）",
  "出張（事後申請）",
] as const;
type LeaveType = "" | (typeof LEAVE_TYPES)[number];
type FilterStatus = "すべて" | "待機中" | "承認" | "否認";
type PageView = "list" | "apply";
const CANCELLABLE_STATUSES = new Set<LeaveDto["status"]>(["待機中", "否認"]);

function calcDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (e < s) return 0;
  return Math.round((e - s) / 86400000) + 1;
}

function getTodayDateString() {
  return new Date().toLocaleDateString("en-CA");
}

function ApplyForm({
  employee,
  onDone,
  onCancel,
  initialStartDate,
  initialEndDate,
}: {
  employee: EmployeeDto | null;
  onDone: () => void;
  onCancel: () => void;
  initialStartDate?: string;
  initialEndDate?: string;
}) {
  const [token]                     = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""));
  const [leaveType, setLeaveType]   = useState<LeaveType>("");
  const [startDate, setStartDate]   = useState(initialStartDate ?? "");
  const [endDate, setEndDate]       = useState(initialEndDate ?? initialStartDate ?? "");
  const [reason, setReason]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const today = getTodayDateString();

  const days = calcDays(startDate, endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!employee) { setError("現在のログイン情報に紐づく社員情報がありません。"); return; }
    if (!leaveType) { setError("休暇種類を選択してください。"); return; }
    if (startDate < today) { setError("開始日は本日以降を選択してください。"); return; }
    if (endDate < startDate) { setError("終了日は開始日以降にしてください。"); return; }

    setLoading(true);
    try {
      await createLeave(token, { employeeId: employee.id, leaveType, startDate, endDate, days, reason });
      onDone();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "申請に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-1.5 text-slate-400 hover:text-slate-900">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-slate-900">休暇申請</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">申請者</label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900">
            {employee ? (
              <>
                <p className="font-medium">{employee.name}（{employee.department} / {employee.position}）</p>
                <p className="mt-1.5 text-xs text-slate-400">{employee.nameKana} — {employee.employeeNumber}</p>
              </>
            ) : (
              <p className="text-sm text-red-500">현재 로그인 사용자에 연결된 사원 정보가 없습니다.</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">休暇種類</label>
          <select
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">選択ください</option>
            {LEAVE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">開始日</label>
            <input type="date" value={startDate} min={today} required
              onChange={(e) => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(e.target.value); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">終了日</label>
            <input type="date" value={endDate} min={startDate || today} required onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm" />
          </div>
        </div>

        {days > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 rounded-xl">
            <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-semibold text-orange-700">{days}日間</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            申請理由 <span className="text-slate-400 font-normal">(任意)</span>
          </label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            placeholder="例：私用のため、体調不良のため"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-slate-300 text-sm resize-none" />
        </div>

        {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onCancel}
            className="admin-btn-secondary px-5 py-2.5">
            キャンセル
          </button>
          <button type="submit" disabled={loading}
            className="admin-btn-primary px-5 py-2.5">
            {loading ? "申請中..." : "申請する"}
          </button>
        </div>
      </form>
    </div>
  );
}

function LeavePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [records, setRecords]           = useState<LeaveDto[]>([]);
  const [employees, setEmployees]       = useState<EmployeeDto[]>([]);
  const [loading, setLoading]           = useState(true);
  const [token]                         = useState(() => (typeof window === "undefined" ? "" : sessionStorage.getItem("admin_token") ?? ""));
  const isAdmin = getSessionRole(token) === "ADMIN";
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("すべて");
  const [view, setView]                 = useState<PageView>("list");
  const requestedView = searchParams.get("view");
  const prefilledStartDate = searchParams.get("startDate") ?? "";
  const prefilledEndDate = searchParams.get("endDate") ?? prefilledStartDate;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [leaves, employees] = await Promise.all([fetchLeaves(), fetchEmployees()]);
      setRecords(leaves);
      setEmployees(employees);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (requestedView === "apply") {
      setView("apply");
    }
  }, [requestedView]);

  const currentEmployee = employees.find((employee) => {
    if (typeof window === "undefined") return false;
    const token = window.sessionStorage.getItem("admin_token");
    return employee.employeeNumber === getSessionPayload(token).sub;
  }) ?? null;

  const visibleRecords = isAdmin || !currentEmployee
    ? records
    : records.filter((record) => record.employeeId === currentEmployee.id);

  const pendingCount = visibleRecords.filter((r) => r.status === "待機中").length;

  const handleStatusUpdate = async (id: number, status: LeaveDto["status"]) => {
    try {
      const updated = await updateLeaveStatus(token, id, status);
      setRecords((prev) => prev.map((r) => r.id === id ? updated : r));
    } catch { /* ignore */ }
  };

  const handleCancelLeave = async (id: number) => {
    if (!confirm("この休暇申請を取り消しますか？")) return;
    try {
      await cancelLeave(token, id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "休暇の取消に失敗しました。");
    }
  };

  const filtered = visibleRecords.filter((r) => {
    if (filterStatus !== "すべて" && r.status !== filterStatus) return false;
    return true;
  });

  if (view === "apply") {
    return (
      <ApplyForm employee={currentEmployee}
        initialStartDate={prefilledStartDate}
        initialEndDate={prefilledEndDate}
        onDone={() => { setView("list"); load(); }}
        onCancel={() => setView("list")} />
    );
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">休暇管理</h2>
          {pendingCount > 0 && (
            <p className="mt-0.5 text-xs font-medium text-orange-500">未承認の申請が {pendingCount} 件あります</p>
          )}
        </div>
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
          <button onClick={() => setView("apply")}
            className="admin-btn-primary inline-flex items-center justify-center gap-2 px-4 py-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            休暇申請
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(["待機中", "承認", "否認"] as const).map((status) => {
          const count = visibleRecords.filter((r) => r.status === status).length;
          const color =
            status === "待機中" ? "bg-orange-50" : status === "承認" ? "bg-green-50" : "bg-yellow-50";
          const iconColor =
            status === "待機中" ? "text-orange-500" : status === "承認" ? "text-green-500" : "text-yellow-500";
          return (
            <div key={status} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <svg className={`h-6 w-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {status === "待機中" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : status === "承認" ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4m0 4h.01M10.29 3.86l-7.5 13A1 1 0 003.66 18h16.68a1 1 0 00.87-1.14l-7.5-13a1 1 0 00-1.74 0z" />
                    )}
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">{status}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-2 flex-wrap">
          {(["すべて", "待機中", "承認", "否認"] as FilterStatus[]).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors
                ${filterStatus === s ? "admin-pill-active" : "admin-pill"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500">{filtered.length} 件</p>
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
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">休暇種類</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden md:table-cell">期間</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 hidden lg:table-cell">日数</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">状態</th>
                  <th className="hidden px-5 py-3 text-xs font-semibold text-slate-500 text-right sm:table-cell">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => router.push(`/admin/leave/${req.id}`)}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-slate-900 font-medium hover:text-orange-500">{req.employeeName}</p>
                      <p className="text-slate-400 text-xs mt-0.5 font-mono">{req.appliedAt}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-slate-500 text-xs">{req.department}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-left text-slate-700 text-xs font-medium hover:text-orange-500">
                        {req.leaveType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-slate-700 text-xs font-mono">{req.startDate}</p>
                      {req.startDate !== req.endDate && <p className="text-slate-400 text-xs font-mono">〜 {req.endDate}</p>}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-slate-700 text-xs">{req.days}日</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLOR[req.status] ?? ""}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="hidden px-5 py-3.5 sm:table-cell">
                      {isAdmin ? (
                        req.status === "待機中" ? (
                          <div className="flex items-center gap-2 justify-end">
                            <button onClick={(event) => {
                                event.stopPropagation();
                                handleStatusUpdate(req.id, "承認");
                              }}
                              className="rounded-lg border border-emerald-200 px-2 py-1 text-xs font-semibold text-emerald-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600">
                              承認
                            </button>
                            <button onClick={(event) => {
                              event.stopPropagation();
                              handleStatusUpdate(req.id, "否認");
                            }}
                              className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600">
                              否認
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <button onClick={(event) => {
                              event.stopPropagation();
                              if (!confirm("この休暇申請を待機中に戻しますか？")) return;
                              handleStatusUpdate(req.id, "待機中");
                            }}
                              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1">
                              取消
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="flex justify-end">
                          {currentEmployee && req.employeeId === currentEmployee.id && CANCELLABLE_STATUSES.has(req.status) ? (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleCancelLeave(req.id);
                              }}
                              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                            >
                              取消
                            </button>
                          ) : (
                            <span className="px-2 py-1 text-xs text-slate-300">-</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="px-5 py-10 text-center text-sm text-slate-400">該当する申請がありません。</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeavePage() {
  return (
    <Suspense fallback={<div className="flex min-h-[360px] items-center justify-center"><div className="h-7 w-7 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" /></div>}>
      <LeavePageContent />
    </Suspense>
  );
}
