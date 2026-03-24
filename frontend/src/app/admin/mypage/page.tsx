"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchEmployees, fetchLeaves, type EmployeeDto, type LeaveDto } from "@/lib/api";
import { getSessionPayload } from "@/lib/session";
import {
  calcLeavePools,
  calcNextGrant,
  formatDateDisplay,
} from "@/lib/leaveUtils";

const STATUS_COLOR: Record<string, string> = {
  待機中: "bg-yellow-100 text-yellow-700",
  承認:   "bg-green-100 text-green-700",
  拒否:   "bg-red-100 text-red-600",
};

export default function MyPage() {
  const [employee, setEmployee] = useState<EmployeeDto | null>(null);
  const [leaves,   setLeaves]   = useState<LeaveDto[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const token   = typeof window === "undefined" ? null : window.sessionStorage.getItem("admin_token");
    const subject = getSessionPayload(token).sub;

    Promise.all([fetchEmployees(), fetchLeaves()])
      .then(([employees, leaveRecords]) => {
        const currentEmployee = employees.find((e) => e.employeeNumber === subject) ?? null;
        setEmployee(currentEmployee);
        setLeaves(
          currentEmployee
            ? leaveRecords.filter((l) => l.employeeId === currentEmployee.id)
            : []
        );
      })
      .catch(() => { setEmployee(null); setLeaves([]); })
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const today          = new Date();
    const approvedLeaves = leaves.filter((l) => l.status === "承認");

    const pools = employee?.joinDate
      ? calcLeavePools(employee.joinDate, approvedLeaves, today)
      : [];

    const nextGrant = employee?.joinDate
      ? calcNextGrant(employee.joinDate, today)
      : null;

    return {
      total:    leaves.length,
      pending:  leaves.filter((l) => l.status === "待機中").length,
      approved: leaves.filter((l) => l.status === "承認").length,
      pools,
      nextGrant,
    };
  }, [leaves, employee]);

  return (
    <div className="max-w-4xl space-y-6">
      {/* ── 헤더 ── */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">マイページ</h2>
        <p className="mt-0.5 text-sm text-slate-500">本人の情報と休暇申請状況を確認できます。</p>
      </div>

      {/* ── 사원 정보 ── */}
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
              <p className="mt-1 font-mono text-xs text-slate-400">{employee.employeeNumber}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-500">현재 로그인 정보와 연결된 사원 정보가 없습니다.</p>
        )}
      </div>

      {/* ── 잔여 휴가 카드 ── */}
      <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          {/* 좌측: 풀 목록 */}
          <div className="min-w-0 flex-1 space-y-4">
            {summary.pools.length === 0 ? (
              <p className="text-sm text-slate-400">有給休暇の残日数はありません</p>
            ) : (
              summary.pools.map((pool, i) => {
                const pct = Math.max(0, Math.min(100, (pool.remainingDays / pool.grantDays) * 100));
                const urgent = pool.remainingDays <= 3;
                return (
                  <div key={i}>
                    {/* 소진 기한 문구 */}
                    <p className={`text-sm font-medium ${urgent ? "text-red-600" : "text-orange-700"}`}>
                      <span className="font-bold">{formatDateDisplay(pool.expiryDate)}</span>
                      までに消化が必要な休暇が{" "}
                      <span className={`text-lg font-bold ${urgent ? "text-red-500" : "text-orange-500"}`}>
                        {pool.remainingDays}日
                      </span>{" "}
                      残っています
                    </p>
                    {/* 진행 바 */}
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-orange-100">
                      <div
                        className={`h-full rounded-full transition-all ${urgent ? "bg-red-400" : "bg-orange-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {/* 사용 현황 */}
                    <p className="mt-1.5 text-base font-bold text-orange-500">
                      使用済み {pool.usedDays}日
                    </p>
                  </div>
                );
              })
            )}

            {/* 다음 부여 안내 (모든 직원) */}
            {summary.nextGrant && (
              <p className="text-[12px] font-semibold text-orange-500">
                {summary.nextGrant.daysUntil}日後に{summary.nextGrant.days}日の休暇が付与されます！
              </p>
            )}
          </div>

          {/* 우측: 아이콘 */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100">
            <svg className="h-6 w-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── 통계 카드 ── */}
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

      {/* ── 휴가 이력 테이블 ── */}
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
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                      {leave.startDate}{leave.startDate !== leave.endDate ? ` ~ ${leave.endDate}` : ""}
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
