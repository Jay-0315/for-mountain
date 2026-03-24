"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchEmployees, fetchLeaves, type EmployeeDto, type LeaveDto } from "@/lib/api";
import { getSessionPayload } from "@/lib/session";
import {
  calcLeaveGrant,
  formatDateStr,
  formatDateDisplay,
  daysBetween,
} from "@/lib/leaveUtils";

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
    const today = new Date();
    const grant = employee?.joinDate ? calcLeaveGrant(employee.joinDate, today) : null;

    // 현재 사이클 내 승인된 휴가만 집계
    const grantStartStr = grant ? formatDateStr(grant.grantStart) : "";
    const nextGrantStr  = grant ? formatDateStr(grant.nextGrant)  : "";

    const approvedDays = grant
      ? leaves
          .filter(
            (l) =>
              l.status === "承認" &&
              l.startDate >= grantStartStr &&
              l.startDate < nextGrantStr
          )
          .reduce((sum, l) => sum + l.days, 0)
      : 0;

    const remaining = grant ? grant.grantDays - approvedDays : null;

    // 다음 단계까지 남은 일수 (6개월 미만 구간에서만 표시)
    const daysUntilNext =
      grant && grant.a === 0 && today < grant.nextGrant
        ? daysBetween(today, grant.nextGrant)
        : null;

    return {
      total:    leaves.length,
      pending:  leaves.filter((l) => l.status === "待機中").length,
      approved: leaves.filter((l) => l.status === "承認").length,
      approvedDays,
      remaining,
      grant,
      daysUntilNext,
    };
  }, [leaves, employee]);

  const { grant, remaining, approvedDays, daysUntilNext } = summary;

  // 진행률 바 (0~100)
  const progressPct = grant && remaining != null
    ? Math.max(0, Math.min(100, (remaining / grant.grantDays) * 100))
    : 0;

  // 사이클 기간 표시 (예: 2025.08.01 〜 2026.07.31)
  const cyclePeriod = grant
    ? (() => {
        const end = new Date(grant.nextGrant);
        end.setDate(end.getDate() - 1);
        return `${formatDateDisplay(grant.grantStart)} 〜 ${formatDateDisplay(end)}`;
      })()
    : null;

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
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {/* 라벨 */}
            <p className="text-xs font-medium text-orange-600">
              {remaining != null
                ? remaining > 0
                  ? `有給休暇が残り ${remaining} 日あります`
                  : "有給休暇の残日数はありません"
                : "有給休暇"}
            </p>

            {/* 숫자 */}
            <div className="mt-1 flex items-baseline gap-1.5">
              {remaining != null ? (
                <>
                  <span
                    className={`text-3xl font-bold ${
                      remaining === 0
                        ? "text-slate-400"
                        : remaining <= 3
                        ? "text-red-500"
                        : grant?.grantDays === 30
                        ? "text-orange-600"
                        : "text-orange-500"
                    }`}
                  >
                    {remaining}
                  </span>
                  <span className="text-sm font-medium text-orange-400">日</span>
                  <span className="ml-2 text-xs text-slate-400">/ {grant?.grantDays}日</span>
                  {grant?.grantDays === 30 && (
                    <span className="ml-1 rounded-full bg-orange-200 px-2 py-0.5 text-[10px] font-bold text-orange-700">
                      上限
                    </span>
                  )}
                </>
              ) : (
                <span className="text-base font-medium text-slate-400">—</span>
              )}
            </div>

            {/* 사이클 기간 */}
            {cyclePeriod && (
              <p className="mt-1 text-[11px] text-slate-400">付与期間: {cyclePeriod}</p>
            )}
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100">
            <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* 진행률 바 */}
        {remaining != null && grant && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-orange-100">
              <div
                className={`h-full rounded-full transition-all ${
                  remaining <= 3 ? "bg-red-400" : "bg-orange-400"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-xs text-slate-400">使用済み {approvedDays}日</p>
              {/* 6개월 미만 구간: 다음 단계까지 안내 */}
              {daysUntilNext != null && grant.grantDays === 5 && (
                <p className="text-[11px] text-orange-400">
                  あと {daysUntilNext} 日で +5日付与
                </p>
              )}
            </div>
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
