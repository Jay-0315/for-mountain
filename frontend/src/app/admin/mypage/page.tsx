"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchEmployees, fetchLeaves, type EmployeeDto, type LeaveDto } from "@/lib/api";
import { getSessionPayload } from "@/lib/session";

const STATUS_COLOR: Record<string, string> = {
  待機中: "bg-yellow-100 text-yellow-700",
  承認: "bg-green-100 text-green-700",
  拒否: "bg-red-100 text-red-600",
};

export default function MyPage() {
  const [employee, setEmployee] = useState<EmployeeDto | null>(null);
  const [leaves, setLeaves] = useState<LeaveDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window === "undefined" ? null : window.sessionStorage.getItem("admin_token");
    const subject = getSessionPayload(token).sub;

    Promise.all([fetchEmployees(), fetchLeaves()])
      .then(([employees, leaveRecords]) => {
        const currentEmployee = employees.find((item) => item.employeeNumber === subject) ?? null;
        setEmployee(currentEmployee);
        setLeaves(
          currentEmployee
            ? leaveRecords.filter((leave) => leave.employeeId === currentEmployee.id)
            : []
        );
      })
      .catch(() => {
        setEmployee(null);
        setLeaves([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const approvedDays = leaves
      .filter((leave) => leave.status === "承認")
      .reduce((sum, leave) => sum + leave.days, 0);
    const remaining =
      employee?.annualLeaveDays != null ? employee.annualLeaveDays - approvedDays : null;
    return {
      total: leaves.length,
      pending: leaves.filter((leave) => leave.status === "待機中").length,
      approved: leaves.filter((leave) => leave.status === "承認").length,
      approvedDays,
      remaining,
    };
  }, [leaves, employee]);

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">マイページ</h2>
        <p className="mt-0.5 text-sm text-slate-500">本人の情報と休暇申請状況を確認できます。</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        {employee ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500">氏名</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{employee.name}</p>
              <p className="mt-1 text-xs text-slate-400">{employee.nameKana}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">所属</p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {employee.department} / {employee.position}
              </p>
              <p className="mt-1 text-xs text-slate-400 font-mono">{employee.employeeNumber}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-500">현재 로그인 정보와 연결된 사원 정보가 없습니다.</p>
        )}
      </div>

      {/* 잔여 휴가 카드 */}
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-orange-600">残有給休暇</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              {summary.remaining != null ? (
                <>
                  <span className={`text-3xl font-bold ${summary.remaining <= 3 ? "text-red-500" : "text-orange-500"}`}>
                    {summary.remaining}
                  </span>
                  <span className="text-sm font-medium text-orange-400">日</span>
                  <span className="ml-2 text-xs text-slate-400">/ {employee?.annualLeaveDays}日</span>
                </>
              ) : (
                <span className="text-base font-medium text-slate-400">未設定</span>
              )}
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
            <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        {summary.remaining != null && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-orange-100">
              <div
                className={`h-full rounded-full transition-all ${summary.remaining <= 3 ? "bg-red-400" : "bg-orange-400"}`}
                style={{ width: `${Math.max(0, Math.min(100, (summary.remaining / (employee?.annualLeaveDays ?? 1)) * 100))}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">使用済み {summary.approvedDays}日</p>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">総申請数</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">待機中</p>
          <p className="mt-2 text-2xl font-bold text-yellow-600">{summary.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">承認済み</p>
          <p className="mt-2 text-2xl font-bold text-green-600">{summary.approved}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
          <p className="text-xs font-semibold text-slate-500">本人の休暇履歴</p>
          <Link href="/admin/leave" className="text-xs font-semibold text-orange-500 hover:underline">
            休暇管理へ
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
          </div>
        ) : leaves.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-400">休暇申請履歴がありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">休暇種類</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">期間</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">日数</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="px-5 py-3.5 text-slate-700">{leave.leaveType}</td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-500">
                      {leave.startDate} {leave.startDate !== leave.endDate ? `~ ${leave.endDate}` : ""}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{leave.days}日</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[leave.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
